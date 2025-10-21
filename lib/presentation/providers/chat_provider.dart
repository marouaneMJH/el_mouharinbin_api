import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/chat_repository_impl.dart';
import '../../data/models/message_model.dart';
import '../../core/enums/websocket_state.dart';
import '../../core/error/failures.dart';

/// Chat state for a specific community
class ChatCommunityState {
  final List<MessageModel> messages;
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasMoreMessages;
  final String? errorMessage;
  final bool isConnected;
  final bool isSending;
  final int currentPage;
  final List<String> optimisticMessageIds;

  const ChatCommunityState({
    this.messages = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasMoreMessages = true,
    this.errorMessage,
    this.isConnected = false,
    this.isSending = false,
    this.currentPage = 1,
    this.optimisticMessageIds = const [],
  });

  ChatCommunityState copyWith({
    List<MessageModel>? messages,
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasMoreMessages,
    String? errorMessage,
    bool? isConnected,
    bool? isSending,
    int? currentPage,
    List<String>? optimisticMessageIds,
  }) {
    return ChatCommunityState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMoreMessages: hasMoreMessages ?? this.hasMoreMessages,
      errorMessage: errorMessage,
      isConnected: isConnected ?? this.isConnected,
      isSending: isSending ?? this.isSending,
      currentPage: currentPage ?? this.currentPage,
      optimisticMessageIds: optimisticMessageIds ?? this.optimisticMessageIds,
    );
  }
}

/// Overall chat state
class ChatState {
  final Map<String, ChatCommunityState> communityStates;
  final WebSocketState connectionState;
  final Map<String, List<String>> typingUsers;
  final bool isRateLimited;
  final DateTime? rateLimitResetTime;

  const ChatState({
    this.communityStates = const {},
    this.connectionState = WebSocketState.disconnected,
    this.typingUsers = const {},
    this.isRateLimited = false,
    this.rateLimitResetTime,
  });

  ChatState copyWith({
    Map<String, ChatCommunityState>? communityStates,
    WebSocketState? connectionState,
    Map<String, List<String>>? typingUsers,
    bool? isRateLimited,
    DateTime? rateLimitResetTime,
  }) {
    return ChatState(
      communityStates: communityStates ?? this.communityStates,
      connectionState: connectionState ?? this.connectionState,
      typingUsers: typingUsers ?? this.typingUsers,
      isRateLimited: isRateLimited ?? this.isRateLimited,
      rateLimitResetTime: rateLimitResetTime,
    );
  }

  ChatCommunityState getCommunityState(String communityId) {
    return communityStates[communityId] ?? const ChatCommunityState();
  }
}

/// Chat provider dependencies
final chatRepositoryProvider = Provider<ChatRepositoryImpl>((ref) {
  throw UnimplementedError('ChatRepositoryImpl provider must be overridden');
});

/// Chat notifier
class ChatNotifier extends StateNotifier<ChatState> {
  final ChatRepositoryImpl _chatRepository;
  final Map<String, StreamSubscription> _messageSubscriptions = {};
  late StreamSubscription _connectionStateSubscription;
  late StreamSubscription _typingIndicatorSubscription;

  // Rate limiting
  static const int _maxMessagesPerSecond = 10;
  static const Duration _rateLimitWindow = Duration(seconds: 1);
  final Map<String, List<DateTime>> _communityMessageTimes = {};

  ChatNotifier({required ChatRepositoryImpl chatRepository})
    : _chatRepository = chatRepository,
      super(const ChatState()) {
    _setupGlobalListeners();
  }

  /// Connect to chat for a specific community
  Future<void> connectToChat(String communityId) async {
    try {
      // Update connection state for this community
      _updateCommunityState(
        communityId: communityId,
        updater: (state) => state.copyWith(isLoading: true, errorMessage: null),
      );

      // Join community room
      await _chatRepository.joinCommunityRoom(communityId);

      // Load initial messages
      await _loadMessages(communityId, page: 1);

      // Set up message listener for this community
      _setupMessageListener(communityId);

      // Update connection state
      _updateCommunityState(
        communityId: communityId,
        updater: (state) => state.copyWith(isLoading: false, isConnected: true),
      );
    } catch (e) {
      _updateCommunityState(
        communityId: communityId,
        updater: (state) => state.copyWith(
          isLoading: false,
          isConnected: false,
          errorMessage: _getErrorMessage(e),
        ),
      );
    }
  }

  /// Disconnect from chat for a specific community
  Future<void> disconnectFromChat(String communityId) async {
    try {
      // Cancel message subscription
      _messageSubscriptions[communityId]?.cancel();
      _messageSubscriptions.remove(communityId);

      // Leave community room
      await _chatRepository.leaveCommunityRoom(communityId);

      // Update state
      _updateCommunityState(
        communityId: communityId,
        updater: (state) => state.copyWith(isConnected: false),
      );

      // Clean up typing users for this community
      final updatedTypingUsers = Map<String, List<String>>.from(
        state.typingUsers,
      );
      updatedTypingUsers.remove(communityId);

      state = state.copyWith(typingUsers: updatedTypingUsers);
    } catch (e) {
      _updateCommunityState(
        communityId: communityId,
        updater: (state) => state.copyWith(errorMessage: _getErrorMessage(e)),
      );
    }
  }

  /// Send message to community
  Future<void> sendMessage({
    required String communityId,
    required String content,
    String? replyToId,
  }) async {
    try {
      // Check rate limiting
      if (_isRateLimited(communityId)) {
        state = state.copyWith(
          isRateLimited: true,
          rateLimitResetTime: DateTime.now().add(_rateLimitWindow),
        );
        throw Exception('Rate limit exceeded. Please slow down.');
      }

      // Update sending state
      _updateCommunityState(
        communityId: communityId,
        updater: (state) => state.copyWith(isSending: true),
      );

      // Create optimistic message
      final optimisticMessage = _createOptimisticMessage(
        communityId: communityId,
        content: content,
        replyToId: replyToId,
      );

      // Add optimistic message to UI
      _addOptimisticMessage(communityId, optimisticMessage);

      // Send message
      final success = await _chatRepository.sendMessage(
        communityId: communityId,
        content: content,
        replyToId: replyToId,
      );

      if (!success) {
        // Remove optimistic message and show error
        _removeOptimisticMessage(communityId, optimisticMessage.id);
        throw Exception('Failed to send message');
      }

      // Update rate limiting tracking
      _trackMessageSent(communityId);

      // Update sending state
      _updateCommunityState(
        communityId: communityId,
        updater: (state) => state.copyWith(isSending: false),
      );
    } catch (e) {
      _updateCommunityState(
        communityId: communityId,
        updater: (state) =>
            state.copyWith(isSending: false, errorMessage: _getErrorMessage(e)),
      );
    }
  }

  /// Listen to messages for a community (called after connecting)
  Future<void> listenToMessages(String communityId) async {
    _setupMessageListener(communityId);
  }

  /// Load older messages (pagination)
  Future<void> loadOlderMessages(String communityId) async {
    final communityState = state.getCommunityState(communityId);

    if (!communityState.hasMoreMessages || communityState.isLoadingMore) {
      return;
    }

    await _loadMessages(
      communityId,
      page: communityState.currentPage + 1,
      isLoadingMore: true,
    );
  }

  /// Clear error for community
  void clearError(String communityId) {
    _updateCommunityState(
      communityId: communityId,
      updater: (state) => state.copyWith(errorMessage: null),
    );
  }

  /// Clear rate limit
  void clearRateLimit() {
    state = state.copyWith(isRateLimited: false, rateLimitResetTime: null);
  }

  /// Private helper methods
  Future<void> _loadMessages(
    String communityId, {
    required int page,
    bool isLoadingMore = false,
  }) async {
    try {
      if (isLoadingMore) {
        _updateCommunityState(
          communityId: communityId,
          updater: (state) => state.copyWith(isLoadingMore: true),
        );
      } else {
        _updateCommunityState(
          communityId: communityId,
          updater: (state) => state.copyWith(isLoading: true),
        );
      }

      final messages = await _chatRepository.getMessages(
        communityId: communityId,
        page: page,
        limit: 20,
      );

      final hasMore = messages.length >= 20;

      if (page == 1) {
        _updateCommunityState(
          communityId: communityId,
          updater: (state) => state.copyWith(
            messages: messages,
            isLoading: false,
            isLoadingMore: false,
            hasMoreMessages: hasMore,
            currentPage: page,
          ),
        );
      } else {
        _updateCommunityState(
          communityId: communityId,
          updater: (state) => state.copyWith(
            messages: [...state.messages, ...messages],
            isLoading: false,
            isLoadingMore: false,
            hasMoreMessages: hasMore,
            currentPage: page,
          ),
        );
      }
    } catch (e) {
      _updateCommunityState(
        communityId: communityId,
        updater: (state) => state.copyWith(
          isLoading: false,
          isLoadingMore: false,
          errorMessage: _getErrorMessage(e),
        ),
      );
    }
  }

  void _setupGlobalListeners() {
    // Connection state listener
    _connectionStateSubscription = _chatRepository
        .getConnectionStateStream()
        .listen((connectionState) {
          state = state.copyWith(connectionState: connectionState);
        });

    // Typing indicator listener
    _typingIndicatorSubscription = _chatRepository
        .getTypingIndicatorStream()
        .listen((typingData) {
          _handleTypingIndicator(typingData);
        });
  }

  void _setupMessageListener(String communityId) {
    _messageSubscriptions[communityId]?.cancel();

    _messageSubscriptions[communityId] = _chatRepository
        .messageStream(communityId)
        .listen(
          (message) {
            _handleIncomingMessage(communityId, message);
          },
          onError: (error) {
            _updateCommunityState(
              communityId: communityId,
              updater: (state) =>
                  state.copyWith(errorMessage: _getErrorMessage(error)),
            );
          },
        );
  }

  void _handleIncomingMessage(String communityId, MessageModel message) {
    final communityState = state.getCommunityState(communityId);

    // Remove optimistic message if this is the real version
    final updatedOptimisticIds = List<String>.from(
      communityState.optimisticMessageIds,
    );
    updatedOptimisticIds.removeWhere(
      (id) => message.content == _getOptimisticMessageContent(communityId, id),
    );

    // Update or add message
    final updatedMessages = List<MessageModel>.from(communityState.messages);
    final existingIndex = updatedMessages.indexWhere((m) => m.id == message.id);

    if (existingIndex != -1) {
      updatedMessages[existingIndex] = message;
    } else {
      // Insert at the beginning for newest first
      updatedMessages.insert(0, message);
    }

    _updateCommunityState(
      communityId: communityId,
      updater: (state) => state.copyWith(
        messages: updatedMessages,
        optimisticMessageIds: updatedOptimisticIds,
      ),
    );
  }

  void _handleTypingIndicator(Map<String, dynamic> typingData) {
    final type = typingData['type'] as String;
    final data = typingData['data'] as Map<String, dynamic>;
    final communityId = data['communityId'] as String?;
    final userId = data['userId'] as String?;

    if (communityId == null || userId == null) return;

    final updatedTypingUsers = Map<String, List<String>>.from(
      state.typingUsers,
    );
    final currentTyping = List<String>.from(
      updatedTypingUsers[communityId] ?? [],
    );

    if (type == 'started') {
      if (!currentTyping.contains(userId)) {
        currentTyping.add(userId);
      }
    } else if (type == 'stopped') {
      currentTyping.remove(userId);
    }

    updatedTypingUsers[communityId] = currentTyping;
    state = state.copyWith(typingUsers: updatedTypingUsers);
  }

  MessageModel _createOptimisticMessage({
    required String communityId,
    required String content,
    String? replyToId,
  }) {
    return MessageModel(
      id: 'optimistic_${DateTime.now().millisecondsSinceEpoch}',
      content: content,
      communityId: communityId,
      userId: 'current_user',
      username: 'You',
      createdAt: DateTime.now(),
      replyToId: replyToId,
    );
  }

  void _addOptimisticMessage(String communityId, MessageModel message) {
    final communityState = state.getCommunityState(communityId);
    final updatedMessages = [message, ...communityState.messages];
    final updatedOptimisticIds = [
      ...communityState.optimisticMessageIds,
      message.id,
    ];

    _updateCommunityState(
      communityId: communityId,
      updater: (state) => state.copyWith(
        messages: updatedMessages,
        optimisticMessageIds: updatedOptimisticIds,
      ),
    );
  }

  void _removeOptimisticMessage(String communityId, String messageId) {
    final communityState = state.getCommunityState(communityId);
    final updatedMessages = communityState.messages
        .where((message) => message.id != messageId)
        .toList();
    final updatedOptimisticIds = communityState.optimisticMessageIds
        .where((id) => id != messageId)
        .toList();

    _updateCommunityState(
      communityId: communityId,
      updater: (state) => state.copyWith(
        messages: updatedMessages,
        optimisticMessageIds: updatedOptimisticIds,
      ),
    );
  }

  String? _getOptimisticMessageContent(String communityId, String messageId) {
    final communityState = state.getCommunityState(communityId);
    try {
      return communityState.messages
          .firstWhere((message) => message.id == messageId)
          .content;
    } catch (e) {
      return null;
    }
  }

  bool _isRateLimited(String communityId) {
    if (state.isRateLimited &&
        state.rateLimitResetTime != null &&
        DateTime.now().isBefore(state.rateLimitResetTime!)) {
      return true;
    }

    final now = DateTime.now();
    final messageTimes = _communityMessageTimes[communityId] ?? [];

    // Remove old timestamps
    messageTimes.removeWhere((time) => now.difference(time) > _rateLimitWindow);

    return messageTimes.length >= _maxMessagesPerSecond;
  }

  void _trackMessageSent(String communityId) {
    final now = DateTime.now();
    _communityMessageTimes[communityId] ??= [];
    _communityMessageTimes[communityId]!.add(now);

    // Clean up old timestamps
    _communityMessageTimes[communityId]!.removeWhere(
      (time) => now.difference(time) > _rateLimitWindow,
    );
  }

  void _updateCommunityState({
    required String communityId,
    required ChatCommunityState Function(ChatCommunityState) updater,
  }) {
    final currentCommunityStates = Map<String, ChatCommunityState>.from(
      state.communityStates,
    );
    final currentState =
        currentCommunityStates[communityId] ?? const ChatCommunityState();
    currentCommunityStates[communityId] = updater(currentState);

    state = state.copyWith(communityStates: currentCommunityStates);
  }

  String _getErrorMessage(dynamic error) {
    if (error is ServerException) {
      return error.message;
    } else if (error is Exception) {
      return error.toString().replaceFirst('Exception: ', '');
    } else {
      return 'An unexpected error occurred';
    }
  }

  @override
  void dispose() {
    // Cancel all subscriptions
    for (final subscription in _messageSubscriptions.values) {
      subscription.cancel();
    }
    _connectionStateSubscription.cancel();
    _typingIndicatorSubscription.cancel();

    super.dispose();
  }
}

/// Chat provider
final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  final chatRepository = ref.watch(chatRepositoryProvider);

  return ChatNotifier(chatRepository: chatRepository);
});

/// Convenience providers for specific communities
final chatCommunityStateProvider = Provider.family<ChatCommunityState, String>((
  ref,
  communityId,
) {
  return ref.watch(chatProvider).getCommunityState(communityId);
});

final communityMessagesProvider = Provider.family<List<MessageModel>, String>((
  ref,
  communityId,
) {
  return ref.watch(chatProvider).getCommunityState(communityId).messages;
});

final communityConnectionProvider = Provider.family<bool, String>((
  ref,
  communityId,
) {
  return ref.watch(chatProvider).getCommunityState(communityId).isConnected;
});

final chatConnectionStateProvider = Provider<WebSocketState>((ref) {
  return ref.watch(chatProvider).connectionState;
});

final chatRateLimitProvider = Provider<bool>((ref) {
  return ref.watch(chatProvider).isRateLimited;
});

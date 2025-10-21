import 'dart:async';
import '../datasources/websocket_service.dart';
import '../datasources/community_remote_datasource.dart';
import '../models/message_model.dart';
import '../../core/enums/websocket_state.dart';
import '../../core/error/failures.dart';
import '../../domain/repositories/chat_repository.dart';

/// Implementation of ChatRepository
class ChatRepositoryImpl implements ChatRepository {
  final WebSocketService _webSocketService;
  final CommunityRemoteDataSource _communityRemoteDataSource;

  // Rate limiting tracking
  final Map<String, List<DateTime>> _communityMessageTimes = {};
  static const int _maxMessagesPerSecond = 10;

  // Message caching
  final Map<String, List<MessageModel>> _messageCache = {};
  final Map<String, StreamController<MessageModel>> _messageStreamControllers =
      {};

  // Typing indicators
  final Map<String, Timer> _typingTimers = {};
  static const Duration _typingTimeout = Duration(seconds: 3);

  ChatRepositoryImpl({
    required WebSocketService webSocketService,
    required CommunityRemoteDataSource communityRemoteDataSource,
  }) : _webSocketService = webSocketService,
       _communityRemoteDataSource = communityRemoteDataSource {
    _setupMessageListener();
  }

  @override
  Future<bool> sendMessage({
    required String communityId,
    required String content,
    String? replyToId,
  }) async {
    try {
      // Check rate limit for this community
      if (!_checkCommunityRateLimit(communityId)) {
        throw ServerException('Rate limit exceeded for community $communityId');
      }

      // Validate content
      if (content.trim().isEmpty) {
        throw ServerException('Message content cannot be empty');
      }

      if (content.length > 2000) {
        throw ServerException('Message content too long (max 2000 characters)');
      }

      // Send via WebSocket
      final success = await _webSocketService.sendMessage(
        communityId: communityId,
        content: content.trim(),
        replyToId: replyToId,
      );

      if (!success) {
        throw ServerException(
          'Failed to send message - rate limit or connection issue',
        );
      }

      return true;
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to send message: ${e.toString()}');
    }
  }

  @override
  Future<List<MessageModel>> getMessages({
    required String communityId,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      // Get messages from API
      final response = await _communityRemoteDataSource.getCommunityPosts(
        communityId: communityId,
        page: page,
        limit: limit,
        sortBy: 'created_at',
        sortOrder: 'desc',
      );

      final messagesData = response['data'] as List<dynamic>? ?? [];
      final messages = messagesData
          .map(
            (messageJson) =>
                MessageModel.fromJson(messageJson as Map<String, dynamic>),
          )
          .toList();

      // Update cache for first page
      if (page == 1) {
        _messageCache[communityId] = messages;
      }

      return messages;
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get messages: ${e.toString()}');
    }
  }

  @override
  Stream<MessageModel> messageStream(String communityId) {
    // Create or get existing stream controller for this community
    if (!_messageStreamControllers.containsKey(communityId)) {
      _messageStreamControllers[communityId] =
          StreamController<MessageModel>.broadcast();
    }

    return _messageStreamControllers[communityId]!.stream;
  }

  @override
  Future<void> joinCommunityRoom(String communityId) async {
    try {
      await _webSocketService.joinCommunityRoom(communityId);

      // Initialize message stream controller if not exists
      if (!_messageStreamControllers.containsKey(communityId)) {
        _messageStreamControllers[communityId] =
            StreamController<MessageModel>.broadcast();
      }

      // Initialize rate limiting for this community
      if (!_communityMessageTimes.containsKey(communityId)) {
        _communityMessageTimes[communityId] = [];
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to join community room: ${e.toString()}');
    }
  }

  @override
  Future<void> leaveCommunityRoom(String communityId) async {
    try {
      await _webSocketService.leaveCommunityRoom(communityId);

      // Clean up resources for this community
      _cleanupCommunityResources(communityId);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to leave community room: ${e.toString()}');
    }
  }

  @override
  Future<void> editMessage({
    required String messageId,
    required String content,
  }) async {
    try {
      // Validate content
      if (content.trim().isEmpty) {
        throw ServerException('Message content cannot be empty');
      }

      if (content.length > 2000) {
        throw ServerException('Message content too long (max 2000 characters)');
      }

      await _webSocketService.editMessage(
        messageId: messageId,
        content: content.trim(),
      );
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to edit message: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteMessage(String messageId) async {
    try {
      await _webSocketService.deleteMessage(messageId);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to delete message: ${e.toString()}');
    }
  }

  @override
  Future<void> startTyping(String communityId) async {
    try {
      await _webSocketService.sendTypingIndicator(
        communityId: communityId,
        isTyping: true,
      );

      // Cancel previous timer if exists
      _typingTimers[communityId]?.cancel();

      // Set timer to automatically stop typing after timeout
      _typingTimers[communityId] = Timer(_typingTimeout, () async {
        try {
          await stopTyping(communityId);
        } catch (e) {
          // Ignore errors when auto-stopping typing
        }
      });
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(
        'Failed to start typing indicator: ${e.toString()}',
      );
    }
  }

  @override
  Future<void> stopTyping(String communityId) async {
    try {
      await _webSocketService.sendTypingIndicator(
        communityId: communityId,
        isTyping: false,
      );

      // Cancel timer
      _typingTimers[communityId]?.cancel();
      _typingTimers.remove(communityId);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to stop typing indicator: ${e.toString()}');
    }
  }

  @override
  Stream<Map<String, dynamic>> getUserPresenceStream() {
    return _webSocketService.userPresenceStream;
  }

  @override
  Stream<Map<String, dynamic>> getTypingIndicatorStream() {
    return _webSocketService.typingIndicatorStream;
  }

  @override
  Stream<WebSocketState> getConnectionStateStream() {
    return _webSocketService.connectionStateStream;
  }

  @override
  WebSocketState get connectionState => _webSocketService.connectionState;

  @override
  List<MessageModel> getCachedMessages(String communityId) {
    return _messageCache[communityId] ?? [];
  }

  @override
  Future<void> clearMessageCache(String communityId) async {
    _messageCache.remove(communityId);
  }

  @override
  Future<void> refreshMessages(String communityId) async {
    try {
      final messages = await getMessages(communityId: communityId);
      _messageCache[communityId] = messages;

      // Emit cached messages to stream
      final streamController = _messageStreamControllers[communityId];
      if (streamController != null) {
        for (final message in messages.reversed) {
          streamController.add(message);
        }
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to refresh messages: ${e.toString()}');
    }
  }

  /// Setup listener for incoming WebSocket messages
  void _setupMessageListener() {
    _webSocketService.messageStream.listen(
      (message) {
        // Add to cache
        final communityId = message.communityId;
        if (_messageCache.containsKey(communityId)) {
          final messages = _messageCache[communityId]!;

          // Check if message already exists (for updates/edits)
          final existingIndex = messages.indexWhere((m) => m.id == message.id);
          if (existingIndex != -1) {
            messages[existingIndex] = message;
          } else {
            messages.insert(0, message); // Add new message at the beginning
          }

          // Keep cache size reasonable (max 100 messages per community)
          if (messages.length > 100) {
            messages.removeRange(100, messages.length);
          }
        }

        // Forward to community-specific stream
        final streamController = _messageStreamControllers[communityId];
        if (streamController != null && !streamController.isClosed) {
          streamController.add(message);
        }
      },
      onError: (error) {
        // Handle stream errors
        print('Message stream error: $error');
      },
    );
  }

  /// Check rate limit for a specific community
  bool _checkCommunityRateLimit(String communityId) {
    final now = DateTime.now();
    final messageTimes = _communityMessageTimes[communityId] ?? [];

    // Remove timestamps older than 1 second
    messageTimes.removeWhere(
      (time) => now.difference(time).inMilliseconds > 1000,
    );

    // Check if we've hit the limit
    if (messageTimes.length >= _maxMessagesPerSecond) {
      return false;
    }

    // Add current timestamp
    messageTimes.add(now);
    _communityMessageTimes[communityId] = messageTimes;

    return true;
  }

  /// Clean up resources for a community when leaving
  void _cleanupCommunityResources(String communityId) {
    // Close and remove stream controller
    final streamController = _messageStreamControllers[communityId];
    if (streamController != null && !streamController.isClosed) {
      streamController.close();
    }
    _messageStreamControllers.remove(communityId);

    // Clear message cache
    _messageCache.remove(communityId);

    // Clear rate limiting data
    _communityMessageTimes.remove(communityId);

    // Cancel typing timer
    _typingTimers[communityId]?.cancel();
    _typingTimers.remove(communityId);
  }

  /// Dispose all resources
  void dispose() {
    // Close all stream controllers
    for (final controller in _messageStreamControllers.values) {
      if (!controller.isClosed) {
        controller.close();
      }
    }
    _messageStreamControllers.clear();

    // Cancel all typing timers
    for (final timer in _typingTimers.values) {
      timer.cancel();
    }
    _typingTimers.clear();

    // Clear all caches
    _messageCache.clear();
    _communityMessageTimes.clear();
  }
}

import 'dart:async';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../../core/constants/app_constants.dart';
import '../../core/enums/websocket_state.dart';
import '../../core/error/failures.dart';
import '../models/message_model.dart';

/// WebSocket service for real-time communication
abstract class WebSocketService {
  Stream<WebSocketState> get connectionStateStream;
  Stream<MessageModel> get messageStream;
  Stream<Map<String, dynamic>> get userPresenceStream;
  Stream<Map<String, dynamic>> get typingIndicatorStream;

  WebSocketState get connectionState;

  Future<void> connect();
  Future<void> disconnect();
  Future<void> joinCommunityRoom(String communityId);
  Future<void> leaveCommunityRoom(String communityId);
  Future<bool> sendMessage({
    required String communityId,
    required String content,
    String? replyToId,
  });
  Future<void> sendTypingIndicator({
    required String communityId,
    required bool isTyping,
  });
  Future<void> editMessage({
    required String messageId,
    required String content,
  });
  Future<void> deleteMessage(String messageId);
}

/// Implementation of WebSocketService using socket_io_client
class WebSocketServiceImpl implements WebSocketService {
  IO.Socket? _socket;
  final FlutterSecureStorage _secureStorage;

  // Connection state management
  final _connectionStateController =
      StreamController<WebSocketState>.broadcast();
  WebSocketState _connectionState = WebSocketState.disconnected;

  // Message streams
  final _messageController = StreamController<MessageModel>.broadcast();
  final _userPresenceController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _typingIndicatorController =
      StreamController<Map<String, dynamic>>.broadcast();

  // Rate limiting
  final List<DateTime> _messageTimes = [];
  static const int _maxMessagesPerSecond = 10;

  // Reconnection logic
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _reconnectDelay = Duration(seconds: 2);

  // Message queue for offline messages
  final List<Map<String, dynamic>> _offlineMessageQueue = [];

  // Current joined rooms
  final Set<String> _joinedRooms = <String>{};

  WebSocketServiceImpl({required FlutterSecureStorage secureStorage})
    : _secureStorage = secureStorage;

  @override
  Stream<WebSocketState> get connectionStateStream =>
      _connectionStateController.stream;

  @override
  Stream<MessageModel> get messageStream => _messageController.stream;

  @override
  Stream<Map<String, dynamic>> get userPresenceStream =>
      _userPresenceController.stream;

  @override
  Stream<Map<String, dynamic>> get typingIndicatorStream =>
      _typingIndicatorController.stream;

  @override
  WebSocketState get connectionState => _connectionState;

  @override
  Future<void> connect() async {
    try {
      if (_connectionState == WebSocketState.connected) {
        return;
      }

      _updateConnectionState(WebSocketState.connecting);

      // Get auth token
      final token = await _secureStorage.read(key: 'auth_token');
      if (token == null) {
        throw ServerException('No authentication token found');
      }

      // Create socket connection with auth
      _socket = IO.io(
        AppConstants.wsUrl,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .enableAutoConnect()
            .enableReconnection()
            .setReconnectionAttempts(_maxReconnectAttempts)
            .setReconnectionDelay(_reconnectDelay.inMilliseconds)
            .setAuth({'token': token})
            .build(),
      );

      _setupSocketListeners();

      // Connect to socket
      _socket!.connect();
    } catch (e) {
      _updateConnectionState(WebSocketState.error);
      throw ServerException('Failed to connect to WebSocket: ${e.toString()}');
    }
  }

  @override
  Future<void> disconnect() async {
    try {
      _reconnectTimer?.cancel();
      _reconnectTimer = null;
      _reconnectAttempts = 0;

      if (_socket != null) {
        _socket!.disconnect();
        _socket!.dispose();
        _socket = null;
      }

      _joinedRooms.clear();
      _updateConnectionState(WebSocketState.disconnected);
    } catch (e) {
      throw ServerException(
        'Failed to disconnect from WebSocket: ${e.toString()}',
      );
    }
  }

  @override
  Future<void> joinCommunityRoom(String communityId) async {
    try {
      if (_connectionState != WebSocketState.connected) {
        throw ServerException('WebSocket not connected');
      }

      _socket!.emit('community:join', {'communityId': communityId});
      _joinedRooms.add(communityId);
    } catch (e) {
      throw ServerException('Failed to join community room: ${e.toString()}');
    }
  }

  @override
  Future<void> leaveCommunityRoom(String communityId) async {
    try {
      if (_connectionState != WebSocketState.connected) {
        throw ServerException('WebSocket not connected');
      }

      _socket!.emit('community:leave', {'communityId': communityId});
      _joinedRooms.remove(communityId);
    } catch (e) {
      throw ServerException('Failed to leave community room: ${e.toString()}');
    }
  }

  @override
  Future<bool> sendMessage({
    required String communityId,
    required String content,
    String? replyToId,
  }) async {
    try {
      // Check rate limiting
      if (!_checkRateLimit()) {
        return false;
      }

      final messagePayload = {
        'communityId': communityId,
        'content': content,
        if (replyToId != null) 'replyToId': replyToId,
        'timestamp': DateTime.now().toIso8601String(),
      };

      if (_connectionState == WebSocketState.connected) {
        _socket!.emit('message:send', messagePayload);
        return true;
      } else {
        // Queue message for when connection is restored
        _offlineMessageQueue.add(messagePayload);
        return false;
      }
    } catch (e) {
      throw ServerException('Failed to send message: ${e.toString()}');
    }
  }

  @override
  Future<void> sendTypingIndicator({
    required String communityId,
    required bool isTyping,
  }) async {
    try {
      if (_connectionState != WebSocketState.connected) {
        return;
      }

      _socket!.emit('typing:indicator', {
        'communityId': communityId,
        'isTyping': isTyping,
      });
    } catch (e) {
      throw ServerException('Failed to send typing indicator: ${e.toString()}');
    }
  }

  @override
  Future<void> editMessage({
    required String messageId,
    required String content,
  }) async {
    try {
      if (_connectionState != WebSocketState.connected) {
        throw ServerException('WebSocket not connected');
      }

      _socket!.emit('message:edit', {
        'messageId': messageId,
        'content': content,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw ServerException('Failed to edit message: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteMessage(String messageId) async {
    try {
      if (_connectionState != WebSocketState.connected) {
        throw ServerException('WebSocket not connected');
      }

      _socket!.emit('message:delete', {
        'messageId': messageId,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw ServerException('Failed to delete message: ${e.toString()}');
    }
  }

  /// Setup socket event listeners
  void _setupSocketListeners() {
    if (_socket == null) return;

    // Connection events
    _socket!.onConnect((_) {
      _updateConnectionState(WebSocketState.connected);
      _reconnectAttempts = 0;
      _rejoinRooms();
      _sendQueuedMessages();
    });

    _socket!.onDisconnect((_) {
      _updateConnectionState(WebSocketState.disconnected);
      _scheduleReconnect();
    });

    _socket!.onConnectError((data) {
      _updateConnectionState(WebSocketState.error);
      _scheduleReconnect();
    });

    _socket!.onError((data) {
      _updateConnectionState(WebSocketState.error);
    });

    // Message events
    _socket!.on('message:created', (data) {
      try {
        final messageData = data as Map<String, dynamic>;
        final message = MessageModel.fromJson(messageData);
        _messageController.add(message);
      } catch (e) {
        // Log error but don't crash the app
        print('Error parsing message:created event: $e');
      }
    });

    _socket!.on('message:updated', (data) {
      try {
        final messageData = data as Map<String, dynamic>;
        final message = MessageModel.fromJson(messageData);
        _messageController.add(message);
      } catch (e) {
        print('Error parsing message:updated event: $e');
      }
    });

    _socket!.on('message:deleted', (data) {
      try {
        final messageData = data as Map<String, dynamic>;
        final message = MessageModel.fromJson(messageData);
        _messageController.add(message);
      } catch (e) {
        print('Error parsing message:deleted event: $e');
      }
    });

    // User presence events
    _socket!.on('community:user-joined', (data) {
      try {
        final presenceData = data as Map<String, dynamic>;
        _userPresenceController.add({'type': 'joined', 'data': presenceData});
      } catch (e) {
        print('Error parsing user-joined event: $e');
      }
    });

    _socket!.on('community:user-left', (data) {
      try {
        final presenceData = data as Map<String, dynamic>;
        _userPresenceController.add({'type': 'left', 'data': presenceData});
      } catch (e) {
        print('Error parsing user-left event: $e');
      }
    });

    // Typing indicator events
    _socket!.on('typing:started', (data) {
      try {
        final typingData = data as Map<String, dynamic>;
        _typingIndicatorController.add({'type': 'started', 'data': typingData});
      } catch (e) {
        print('Error parsing typing:started event: $e');
      }
    });

    _socket!.on('typing:stopped', (data) {
      try {
        final typingData = data as Map<String, dynamic>;
        _typingIndicatorController.add({'type': 'stopped', 'data': typingData});
      } catch (e) {
        print('Error parsing typing:stopped event: $e');
      }
    });

    // Authentication error
    _socket!.on('auth:error', (data) {
      _updateConnectionState(WebSocketState.error);
      // Could trigger token refresh or logout
    });
  }

  /// Update connection state and notify listeners
  void _updateConnectionState(WebSocketState newState) {
    if (_connectionState != newState) {
      _connectionState = newState;
      _connectionStateController.add(newState);
    }
  }

  /// Check if message sending is within rate limits
  bool _checkRateLimit() {
    final now = DateTime.now();

    // Remove timestamps older than 1 second
    _messageTimes.removeWhere(
      (time) => now.difference(time).inMilliseconds > 1000,
    );

    // Check if we've hit the limit
    if (_messageTimes.length >= _maxMessagesPerSecond) {
      return false;
    }

    // Add current timestamp
    _messageTimes.add(now);
    return true;
  }

  /// Schedule reconnection attempt
  void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      _updateConnectionState(WebSocketState.error);
      return;
    }

    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(_reconnectDelay, () async {
      _reconnectAttempts++;
      _updateConnectionState(WebSocketState.reconnecting);

      try {
        await connect();
      } catch (e) {
        _scheduleReconnect();
      }
    });
  }

  /// Rejoin previously joined rooms after reconnection
  Future<void> _rejoinRooms() async {
    for (final roomId in _joinedRooms.toList()) {
      try {
        await joinCommunityRoom(roomId);
      } catch (e) {
        // Continue rejoining other rooms even if one fails
        print('Failed to rejoin room $roomId: $e');
      }
    }
  }

  /// Send queued messages after reconnection
  Future<void> _sendQueuedMessages() async {
    final queueCopy = List<Map<String, dynamic>>.from(_offlineMessageQueue);
    _offlineMessageQueue.clear();

    for (final messagePayload in queueCopy) {
      try {
        _socket!.emit('message:send', messagePayload);
      } catch (e) {
        // Re-queue failed messages
        _offlineMessageQueue.add(messagePayload);
      }
    }
  }

  /// Dispose resources
  void dispose() {
    _reconnectTimer?.cancel();
    _connectionStateController.close();
    _messageController.close();
    _userPresenceController.close();
    _typingIndicatorController.close();

    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
    }
  }
}

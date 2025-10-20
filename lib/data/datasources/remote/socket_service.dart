import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  final IO.Socket _socket;
  late StreamController<Map<String, dynamic>> _messageController;
  late StreamController<bool> _connectionController;

  SocketService(this._socket) {
    _messageController = StreamController<Map<String, dynamic>>.broadcast();
    _connectionController = StreamController<bool>.broadcast();
    _setupListeners();
  }

  // Connection status stream
  Stream<bool> get connectionStatus => _connectionController.stream;

  // Message stream
  Stream<Map<String, dynamic>> get messages => _messageController.stream;

  // Check if socket is connected
  bool get isConnected => _socket.connected;

  void _setupListeners() {
    // Connection events
    _socket.onConnect((_) {
      print('Socket connected');
      _connectionController.add(true);
    });

    _socket.onDisconnect((_) {
      print('Socket disconnected');
      _connectionController.add(false);
    });

    _socket.onConnectError((error) {
      print('Socket connection error: $error');
      _connectionController.add(false);
    });

    _socket.onError((error) {
      print('Socket error: $error');
    });

    // Authentication events
    _socket.on('authenticated', (data) {
      print('Socket authenticated: $data');
      _messageController.add({'type': 'authenticated', 'data': data});
    });

    _socket.on('unauthorized', (data) {
      print('Socket unauthorized: $data');
      _messageController.add({'type': 'unauthorized', 'data': data});
    });

    // User events
    _socket.on('user:online', (data) {
      _messageController.add({'type': 'user:online', 'data': data});
    });

    _socket.on('user:offline', (data) {
      _messageController.add({'type': 'user:offline', 'data': data});
    });

    // Challenge events
    _socket.on('challenge:update', (data) {
      _messageController.add({'type': 'challenge:update', 'data': data});
    });

    _socket.on('challenge:joined', (data) {
      _messageController.add({'type': 'challenge:joined', 'data': data});
    });

    _socket.on('challenge:left', (data) {
      _messageController.add({'type': 'challenge:left', 'data': data});
    });

    _socket.on('challenge:completed', (data) {
      _messageController.add({'type': 'challenge:completed', 'data': data});
    });

    // Community events
    _socket.on('community:message', (data) {
      _messageController.add({'type': 'community:message', 'data': data});
    });

    _socket.on('community:post', (data) {
      _messageController.add({'type': 'community:post', 'data': data});
    });

    _socket.on('community:comment', (data) {
      _messageController.add({'type': 'community:comment', 'data': data});
    });

    // Notification events
    _socket.on('notification', (data) {
      _messageController.add({'type': 'notification', 'data': data});
    });

    // Support events
    _socket.on('support:request', (data) {
      _messageController.add({'type': 'support:request', 'data': data});
    });

    _socket.on('support:offer', (data) {
      _messageController.add({'type': 'support:offer', 'data': data});
    });

    // Progress events
    _socket.on('progress:update', (data) {
      _messageController.add({'type': 'progress:update', 'data': data});
    });

    _socket.on('streak:milestone', (data) {
      _messageController.add({'type': 'streak:milestone', 'data': data});
    });
  }

  // Connection methods
  void connect() {
    if (!_socket.connected) {
      _socket.connect();
    }
  }

  void disconnect() {
    if (_socket.connected) {
      _socket.disconnect();
    }
  }

  // Authentication
  void authenticate(String token) {
    _socket.emit('authenticate', {'token': token});
  }

  // User events
  void joinRoom(String roomId) {
    _socket.emit('join:room', {'roomId': roomId});
  }

  void leaveRoom(String roomId) {
    _socket.emit('leave:room', {'roomId': roomId});
  }

  void updateUserStatus(String status) {
    _socket.emit('user:status', {'status': status});
  }

  // Challenge events
  void joinChallengeRoom(String challengeId) {
    _socket.emit('challenge:join', {'challengeId': challengeId});
  }

  void leaveChallengeRoom(String challengeId) {
    _socket.emit('challenge:leave', {'challengeId': challengeId});
  }

  void updateChallengeProgress(
    String challengeId,
    Map<String, dynamic> progress,
  ) {
    _socket.emit('challenge:progress', {
      'challengeId': challengeId,
      'progress': progress,
    });
  }

  void completeChallengeTask(String challengeId, String taskId) {
    _socket.emit('challenge:task:complete', {
      'challengeId': challengeId,
      'taskId': taskId,
    });
  }

  // Community events
  void sendCommunityMessage(String roomId, String message) {
    _socket.emit('community:message:send', {
      'roomId': roomId,
      'message': message,
    });
  }

  void reactToPost(String postId, String reaction) {
    _socket.emit('community:post:react', {
      'postId': postId,
      'reaction': reaction,
    });
  }

  void commentOnPost(String postId, String comment) {
    _socket.emit('community:post:comment', {
      'postId': postId,
      'comment': comment,
    });
  }

  // Support events
  void requestSupport(String message, List<String> tags) {
    _socket.emit('support:request', {'message': message, 'tags': tags});
  }

  void offerSupport(String requestId, String message) {
    _socket.emit('support:offer', {'requestId': requestId, 'message': message});
  }

  // Progress events
  void updateProgress(Map<String, dynamic> progress) {
    _socket.emit('progress:update', progress);
  }

  void reportMilestone(String type, int value) {
    _socket.emit('milestone:reached', {'type': type, 'value': value});
  }

  // Typing indicators
  void startTyping(String roomId) {
    _socket.emit('typing:start', {'roomId': roomId});
  }

  void stopTyping(String roomId) {
    _socket.emit('typing:stop', {'roomId': roomId});
  }

  // Presence
  void updatePresence(String status) {
    _socket.emit('presence:update', {'status': status});
  }

  // Custom events
  void emit(String event, Map<String, dynamic> data) {
    _socket.emit(event, data);
  }

  void on(String event, Function(dynamic) callback) {
    _socket.on(event, callback);
  }

  void off(String event) {
    _socket.off(event);
  }

  // Stream subscriptions
  StreamSubscription<Map<String, dynamic>> listenToEvent(
    String eventType,
    Function(Map<String, dynamic>) callback,
  ) {
    return _messageController.stream
        .where((message) => message['type'] == eventType)
        .listen((message) => callback(message['data']));
  }

  StreamSubscription<bool> listenToConnection(Function(bool) callback) {
    return _connectionController.stream.listen(callback);
  }

  // Cleanup
  void dispose() {
    _socket.disconnect();
    _socket.dispose();
    _messageController.close();
    _connectionController.close();
  }
}

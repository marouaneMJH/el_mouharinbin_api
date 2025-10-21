import '../../core/enums/websocket_state.dart';
import '../../data/models/message_model.dart';

/// Repository interface for chat operations
abstract class ChatRepository {
  /// Send a message to a community
  /// Returns true if message was sent successfully
  /// Throws ServerException if rate limit is exceeded or other errors occur
  Future<bool> sendMessage({
    required String communityId,
    required String content,
    String? replyToId,
  });

  /// Get paginated messages for a community
  /// Returns list of messages ordered by creation time (newest first)
  Future<List<MessageModel>> getMessages({
    required String communityId,
    int page = 1,
    int limit = 20,
  });

  /// Get real-time message stream for a community
  /// Returns stream that emits new, updated, or deleted messages
  Stream<MessageModel> messageStream(String communityId);

  /// Join a community room for real-time messaging
  /// Must be called before receiving real-time messages
  Future<void> joinCommunityRoom(String communityId);

  /// Leave a community room
  /// Stops receiving real-time messages for this community
  Future<void> leaveCommunityRoom(String communityId);

  /// Edit an existing message
  /// Only the message author can edit their messages
  Future<void> editMessage({
    required String messageId,
    required String content,
  });

  /// Delete a message
  /// Only the message author or community admins can delete messages
  Future<void> deleteMessage(String messageId);

  /// Start typing indicator for a community
  /// Automatically stops after 3 seconds if not manually stopped
  Future<void> startTyping(String communityId);

  /// Stop typing indicator for a community
  Future<void> stopTyping(String communityId);

  /// Get user presence stream (users joining/leaving communities)
  Stream<Map<String, dynamic>> getUserPresenceStream();

  /// Get typing indicator stream (users starting/stopping typing)
  Stream<Map<String, dynamic>> getTypingIndicatorStream();

  /// Get WebSocket connection state stream
  Stream<WebSocketState> getConnectionStateStream();

  /// Get current WebSocket connection state
  WebSocketState get connectionState;

  /// Get cached messages for a community (offline access)
  List<MessageModel> getCachedMessages(String communityId);

  /// Clear cached messages for a community
  Future<void> clearMessageCache(String communityId);

  /// Refresh messages for a community (fetch latest from server)
  Future<void> refreshMessages(String communityId);
}

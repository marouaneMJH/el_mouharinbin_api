import 'package:json_annotation/json_annotation.dart';

part 'message_model.g.dart';

/// Message data model with JSON serialization
@JsonSerializable()
class MessageModel {
  final String id;
  final String content;
  @JsonKey(name: 'community_id')
  final String communityId;
  @JsonKey(name: 'user_id')
  final String userId;
  final String username;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  @JsonKey(name: 'is_deleted')
  final bool isDeleted;
  @JsonKey(name: 'message_type')
  final String messageType;
  @JsonKey(name: 'reply_to_id')
  final String? replyToId;
  @JsonKey(name: 'user_avatar_url')
  final String? userAvatarUrl;
  @JsonKey(name: 'attachment_urls')
  final List<String>? attachmentUrls;
  @JsonKey(name: 'reactions')
  final Map<String, int>? reactions;
  @JsonKey(name: 'edited_at')
  final DateTime? editedAt;
  @JsonKey(name: 'is_pinned')
  final bool isPinned;
  @JsonKey(name: 'mentions')
  final List<String>? mentions;

  const MessageModel({
    required this.id,
    required this.content,
    required this.communityId,
    required this.userId,
    required this.username,
    required this.createdAt,
    this.updatedAt,
    this.isDeleted = false,
    this.messageType = 'text',
    this.replyToId,
    this.userAvatarUrl,
    this.attachmentUrls,
    this.reactions,
    this.editedAt,
    this.isPinned = false,
    this.mentions,
  });

  /// Create MessageModel from JSON
  factory MessageModel.fromJson(Map<String, dynamic> json) =>
      _$MessageModelFromJson(json);

  /// Convert MessageModel to JSON
  Map<String, dynamic> toJson() => _$MessageModelToJson(this);

  /// Create a copy of MessageModel with updated values
  MessageModel copyWith({
    String? id,
    String? content,
    String? communityId,
    String? userId,
    String? username,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isDeleted,
    String? messageType,
    String? replyToId,
    String? userAvatarUrl,
    List<String>? attachmentUrls,
    Map<String, int>? reactions,
    DateTime? editedAt,
    bool? isPinned,
    List<String>? mentions,
  }) {
    return MessageModel(
      id: id ?? this.id,
      content: content ?? this.content,
      communityId: communityId ?? this.communityId,
      userId: userId ?? this.userId,
      username: username ?? this.username,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isDeleted: isDeleted ?? this.isDeleted,
      messageType: messageType ?? this.messageType,
      replyToId: replyToId ?? this.replyToId,
      userAvatarUrl: userAvatarUrl ?? this.userAvatarUrl,
      attachmentUrls: attachmentUrls ?? this.attachmentUrls,
      reactions: reactions ?? this.reactions,
      editedAt: editedAt ?? this.editedAt,
      isPinned: isPinned ?? this.isPinned,
      mentions: mentions ?? this.mentions,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MessageModel &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          communityId == other.communityId &&
          userId == other.userId;

  @override
  int get hashCode => id.hashCode ^ communityId.hashCode ^ userId.hashCode;

  @override
  String toString() {
    return 'MessageModel{id: $id, content: $content, communityId: $communityId, userId: $userId, username: $username, isDeleted: $isDeleted}';
  }
}

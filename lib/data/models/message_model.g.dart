// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'message_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MessageModel _$MessageModelFromJson(Map<String, dynamic> json) => MessageModel(
  id: json['id'] as String,
  content: json['content'] as String,
  communityId: json['community_id'] as String,
  userId: json['user_id'] as String,
  username: json['username'] as String,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: json['updated_at'] == null
      ? null
      : DateTime.parse(json['updated_at'] as String),
  isDeleted: json['is_deleted'] as bool? ?? false,
  messageType: json['message_type'] as String? ?? 'text',
  replyToId: json['reply_to_id'] as String?,
  userAvatarUrl: json['user_avatar_url'] as String?,
  attachmentUrls: (json['attachment_urls'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  reactions: (json['reactions'] as Map<String, dynamic>?)?.map(
    (k, e) => MapEntry(k, (e as num).toInt()),
  ),
  editedAt: json['edited_at'] == null
      ? null
      : DateTime.parse(json['edited_at'] as String),
  isPinned: json['is_pinned'] as bool? ?? false,
  mentions: (json['mentions'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$MessageModelToJson(MessageModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'content': instance.content,
      'community_id': instance.communityId,
      'user_id': instance.userId,
      'username': instance.username,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'is_deleted': instance.isDeleted,
      'message_type': instance.messageType,
      'reply_to_id': instance.replyToId,
      'user_avatar_url': instance.userAvatarUrl,
      'attachment_urls': instance.attachmentUrls,
      'reactions': instance.reactions,
      'edited_at': instance.editedAt?.toIso8601String(),
      'is_pinned': instance.isPinned,
      'mentions': instance.mentions,
    };

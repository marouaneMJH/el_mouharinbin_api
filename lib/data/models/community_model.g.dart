// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'community_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CommunityModel _$CommunityModelFromJson(Map<String, dynamic> json) =>
    CommunityModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      isPrivate: json['is_private'] as bool? ?? false,
      memberCount: (json['member_count'] as num?)?.toInt() ?? 0,
      createdBy: json['created_by'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      category: json['category'] as String?,
      coverImageUrl: json['cover_image_url'] as String?,
      postsCount: (json['posts_count'] as num?)?.toInt() ?? 0,
      isMember: json['is_member'] as bool? ?? false,
      isAdmin: json['is_admin'] as bool? ?? false,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
      rules: json['rules'] as Map<String, dynamic>?,
      settings: json['settings'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$CommunityModelToJson(CommunityModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'is_private': instance.isPrivate,
      'member_count': instance.memberCount,
      'created_by': instance.createdBy,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'category': instance.category,
      'cover_image_url': instance.coverImageUrl,
      'posts_count': instance.postsCount,
      'is_member': instance.isMember,
      'is_admin': instance.isAdmin,
      'tags': instance.tags,
      'rules': instance.rules,
      'settings': instance.settings,
    };

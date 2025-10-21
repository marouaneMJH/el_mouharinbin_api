// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserModel _$UserModelFromJson(Map<String, dynamic> json) => UserModel(
  id: json['id'] as String,
  email: json['email'] as String,
  username: json['username'] as String,
  fullName: json['fullName'] as String?,
  avatarUrl: json['avatarUrl'] as String?,
  bio: json['bio'] as String?,
  status:
      $enumDecodeNullable(_$UserStatusEnumMap, json['status']) ??
      UserStatus.active,
  role: $enumDecodeNullable(_$UserRoleEnumMap, json['role']) ?? UserRole.user,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  lastLoginAt: json['last_login_at'] == null
      ? null
      : DateTime.parse(json['last_login_at'] as String),
  isEmailVerified: json['is_email_verified'] as bool? ?? false,
  isActive: json['is_active'] as bool? ?? true,
  followersCount: (json['followers_count'] as num?)?.toInt() ?? 0,
  followingCount: (json['following_count'] as num?)?.toInt() ?? 0,
  postsCount: (json['posts_count'] as num?)?.toInt() ?? 0,
  settings: json['settings'] as Map<String, dynamic>?,
  privacySettings: json['privacy_settings'] as Map<String, dynamic>?,
  dateOfBirth: json['date_of_birth'] == null
      ? null
      : DateTime.parse(json['date_of_birth'] as String),
  timezone: json['timezone'] as String?,
);

Map<String, dynamic> _$UserModelToJson(UserModel instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
  'username': instance.username,
  'fullName': instance.fullName,
  'avatarUrl': instance.avatarUrl,
  'bio': instance.bio,
  'status': _$UserStatusEnumMap[instance.status]!,
  'role': _$UserRoleEnumMap[instance.role]!,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'last_login_at': instance.lastLoginAt?.toIso8601String(),
  'is_email_verified': instance.isEmailVerified,
  'is_active': instance.isActive,
  'followers_count': instance.followersCount,
  'following_count': instance.followingCount,
  'posts_count': instance.postsCount,
  'settings': instance.settings,
  'privacy_settings': instance.privacySettings,
  'date_of_birth': instance.dateOfBirth?.toIso8601String(),
  'timezone': instance.timezone,
};

const _$UserStatusEnumMap = {
  UserStatus.active: 'active',
  UserStatus.inactive: 'inactive',
  UserStatus.suspended: 'suspended',
};

const _$UserRoleEnumMap = {
  UserRole.user: 'user',
  UserRole.admin: 'admin',
  UserRole.moderator: 'moderator',
};

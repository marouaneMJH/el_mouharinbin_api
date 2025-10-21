import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

/// User status enumeration
enum UserStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('suspended')
  suspended,
}

/// User role enumeration
enum UserRole {
  @JsonValue('user')
  user,
  @JsonValue('admin')
  admin,
  @JsonValue('moderator')
  moderator,
}

/// User data model with JSON serialization
@JsonSerializable()
class UserModel {
  final String id;
  final String email;
  final String username;
  final String? fullName;
  final String? avatarUrl;
  final String? bio;
  final UserStatus status;
  final UserRole role;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  @JsonKey(name: 'last_login_at')
  final DateTime? lastLoginAt;
  @JsonKey(name: 'is_email_verified')
  final bool isEmailVerified;
  @JsonKey(name: 'is_active')
  final bool isActive;
  @JsonKey(name: 'followers_count')
  final int followersCount;
  @JsonKey(name: 'following_count')
  final int followingCount;
  @JsonKey(name: 'posts_count')
  final int postsCount;
  final Map<String, dynamic>? settings;
  @JsonKey(name: 'privacy_settings')
  final Map<String, dynamic>? privacySettings;
  @JsonKey(name: 'date_of_birth')
  final DateTime? dateOfBirth;
  final String? timezone;

  const UserModel({
    required this.id,
    required this.email,
    required this.username,
    this.fullName,
    this.avatarUrl,
    this.bio,
    this.status = UserStatus.active,
    this.role = UserRole.user,
    required this.createdAt,
    required this.updatedAt,
    this.lastLoginAt,
    this.isEmailVerified = false,
    this.isActive = true,
    this.followersCount = 0,
    this.followingCount = 0,
    this.postsCount = 0,
    this.settings,
    this.privacySettings,
    this.dateOfBirth,
    this.timezone,
  });

  /// Create UserModel from JSON
  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  /// Convert UserModel to JSON
  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  /// Create a copy of UserModel with updated values
  UserModel copyWith({
    String? id,
    String? email,
    String? username,
    String? fullName,
    String? avatarUrl,
    String? bio,
    UserStatus? status,
    UserRole? role,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastLoginAt,
    bool? isEmailVerified,
    bool? isActive,
    int? followersCount,
    int? followingCount,
    int? postsCount,
    Map<String, dynamic>? settings,
    Map<String, dynamic>? privacySettings,
    DateTime? dateOfBirth,
    String? timezone,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      username: username ?? this.username,
      fullName: fullName ?? this.fullName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      status: status ?? this.status,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isActive: isActive ?? this.isActive,
      followersCount: followersCount ?? this.followersCount,
      followingCount: followingCount ?? this.followingCount,
      postsCount: postsCount ?? this.postsCount,
      settings: settings ?? this.settings,
      privacySettings: privacySettings ?? this.privacySettings,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      timezone: timezone ?? this.timezone,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserModel &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          email == other.email &&
          username == other.username;

  @override
  int get hashCode => id.hashCode ^ email.hashCode ^ username.hashCode;

  @override
  String toString() {
    return 'UserModel{id: $id, email: $email, username: $username, status: $status, role: $role}';
  }
}

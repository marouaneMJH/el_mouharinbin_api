import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';

part 'auth_response_model.g.dart';

/// Authentication response model
@JsonSerializable()
class AuthResponseModel {
  @JsonKey(name: 'access_token')
  final String accessToken;
  @JsonKey(name: 'refresh_token')
  final String? refreshToken;
  final UserModel user;
  @JsonKey(name: 'token_type')
  final String tokenType;
  @JsonKey(name: 'expires_in')
  final int? expiresIn;
  @JsonKey(name: 'expires_at')
  final DateTime? expiresAt;
  final String? message;
  @JsonKey(name: 'is_new_user')
  final bool isNewUser;
  final List<String>? permissions;

  const AuthResponseModel({
    required this.accessToken,
    this.refreshToken,
    required this.user,
    this.tokenType = 'Bearer',
    this.expiresIn,
    this.expiresAt,
    this.message,
    this.isNewUser = false,
    this.permissions,
  });

  /// Create AuthResponseModel from JSON
  factory AuthResponseModel.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseModelFromJson(json);

  /// Convert AuthResponseModel to JSON
  Map<String, dynamic> toJson() => _$AuthResponseModelToJson(this);

  /// Create a copy of AuthResponseModel with updated values
  AuthResponseModel copyWith({
    String? accessToken,
    String? refreshToken,
    UserModel? user,
    String? tokenType,
    int? expiresIn,
    DateTime? expiresAt,
    String? message,
    bool? isNewUser,
    List<String>? permissions,
  }) {
    return AuthResponseModel(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      user: user ?? this.user,
      tokenType: tokenType ?? this.tokenType,
      expiresIn: expiresIn ?? this.expiresIn,
      expiresAt: expiresAt ?? this.expiresAt,
      message: message ?? this.message,
      isNewUser: isNewUser ?? this.isNewUser,
      permissions: permissions ?? this.permissions,
    );
  }

  /// Check if token is expired
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  /// Get remaining time until token expires
  Duration? get timeUntilExpiry {
    if (expiresAt == null) return null;
    final now = DateTime.now();
    if (now.isAfter(expiresAt!)) return null;
    return expiresAt!.difference(now);
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthResponseModel &&
          runtimeType == other.runtimeType &&
          accessToken == other.accessToken &&
          user == other.user;

  @override
  int get hashCode => accessToken.hashCode ^ user.hashCode;

  @override
  String toString() {
    return 'AuthResponseModel{accessToken: ${accessToken.substring(0, 10)}..., user: ${user.username}, tokenType: $tokenType, isNewUser: $isNewUser}';
  }
}

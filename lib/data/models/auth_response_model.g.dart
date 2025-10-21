// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_response_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthResponseModel _$AuthResponseModelFromJson(Map<String, dynamic> json) =>
    AuthResponseModel(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String?,
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      tokenType: json['token_type'] as String? ?? 'Bearer',
      expiresIn: (json['expires_in'] as num?)?.toInt(),
      expiresAt: json['expires_at'] == null
          ? null
          : DateTime.parse(json['expires_at'] as String),
      message: json['message'] as String?,
      isNewUser: json['is_new_user'] as bool? ?? false,
      permissions: (json['permissions'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$AuthResponseModelToJson(AuthResponseModel instance) =>
    <String, dynamic>{
      'access_token': instance.accessToken,
      'refresh_token': instance.refreshToken,
      'user': instance.user,
      'token_type': instance.tokenType,
      'expires_in': instance.expiresIn,
      'expires_at': instance.expiresAt?.toIso8601String(),
      'message': instance.message,
      'is_new_user': instance.isNewUser,
      'permissions': instance.permissions,
    };

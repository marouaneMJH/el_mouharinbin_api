import 'dart:io';
import 'package:dio/dio.dart';
import 'api_client.dart';
import '../../core/error/failures.dart';

/// Remote data source for user management operations
abstract class UserRemoteDataSource {
  Future<Map<String, dynamic>> getUserProfile(String userId);

  Future<Map<String, dynamic>> updateUserProfile({
    required String userId,
    Map<String, dynamic>? profileData,
    File? avatarImage,
  });

  Future<void> deleteUserAccount(String userId);

  Future<Map<String, dynamic>> getUsersList({
    int page = 1,
    int limit = 20,
    String? search,
    String? status,
    String? sortBy,
    String? sortOrder,
  });

  Future<Map<String, dynamic>> getUserStats(String userId);

  Future<Map<String, dynamic>> updateUserSettings({
    required String userId,
    required Map<String, dynamic> settings,
  });

  Future<Map<String, dynamic>> changePassword({
    required String userId,
    required String currentPassword,
    required String newPassword,
  });

  Future<Map<String, dynamic>> updatePrivacySettings({
    required String userId,
    required Map<String, dynamic> privacySettings,
  });

  Future<Map<String, dynamic>> blockUser({
    required String userId,
    required String targetUserId,
  });

  Future<void> unblockUser({
    required String userId,
    required String targetUserId,
  });

  Future<Map<String, dynamic>> getBlockedUsers(String userId);

  Future<Map<String, dynamic>> followUser({
    required String userId,
    required String targetUserId,
  });

  Future<void> unfollowUser({
    required String userId,
    required String targetUserId,
  });

  Future<Map<String, dynamic>> getUserFollowers({
    required String userId,
    int page = 1,
    int limit = 20,
  });

  Future<Map<String, dynamic>> getUserFollowing({
    required String userId,
    int page = 1,
    int limit = 20,
  });
}

/// Implementation of UserRemoteDataSource
class UserRemoteDataSourceImpl implements UserRemoteDataSource {
  final ApiClient _apiClient;

  UserRemoteDataSourceImpl({required ApiClient apiClient})
    : _apiClient = apiClient;

  @override
  Future<Map<String, dynamic>> getUserProfile(String userId) async {
    try {
      final response = await _apiClient.get('/users/$userId');

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get user profile failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get user profile: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> updateUserProfile({
    required String userId,
    Map<String, dynamic>? profileData,
    File? avatarImage,
  }) async {
    try {
      Response response;

      if (avatarImage != null) {
        // Create multipart form data for file upload
        final formData = FormData();

        // Add avatar file
        formData.files.add(
          MapEntry(
            'avatar',
            await MultipartFile.fromFile(
              avatarImage.path,
              filename: 'avatar.jpg',
            ),
          ),
        );

        // Add other profile data
        if (profileData != null) {
          profileData.forEach((key, value) {
            formData.fields.add(MapEntry(key, value.toString()));
          });
        }

        response = await _apiClient.put(
          '/users/$userId',
          data: formData,
          options: Options(contentType: 'multipart/form-data'),
        );
      } else {
        // Regular JSON update
        response = await _apiClient.put(
          '/users/$userId',
          data: profileData ?? {},
        );
      }

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Update user profile failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to update user profile: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteUserAccount(String userId) async {
    try {
      final response = await _apiClient.delete('/users/$userId');

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException(
          'Delete user account failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to delete user account: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getUsersList({
    int page = 1,
    int limit = 20,
    String? search,
    String? status,
    String? sortBy,
    String? sortOrder,
  }) async {
    try {
      final queryParameters = <String, dynamic>{'page': page, 'limit': limit};

      if (search != null && search.isNotEmpty) {
        queryParameters['search'] = search;
      }

      if (status != null) {
        queryParameters['status'] = status;
      }

      if (sortBy != null) {
        queryParameters['sort_by'] = sortBy;
      }

      if (sortOrder != null) {
        queryParameters['sort_order'] = sortOrder;
      }

      final response = await _apiClient.get(
        '/users',
        queryParameters: queryParameters,
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get users list failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get users list: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getUserStats(String userId) async {
    try {
      final response = await _apiClient.get('/users/$userId/stats');

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get user stats failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get user stats: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> updateUserSettings({
    required String userId,
    required Map<String, dynamic> settings,
  }) async {
    try {
      final response = await _apiClient.put(
        '/users/$userId/settings',
        data: settings,
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Update user settings failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to update user settings: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> changePassword({
    required String userId,
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _apiClient.put(
        '/users/$userId/password',
        data: {
          'current_password': currentPassword,
          'new_password': newPassword,
        },
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Change password failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to change password: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> updatePrivacySettings({
    required String userId,
    required Map<String, dynamic> privacySettings,
  }) async {
    try {
      final response = await _apiClient.put(
        '/users/$userId/privacy',
        data: privacySettings,
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Update privacy settings failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(
        'Failed to update privacy settings: ${e.toString()}',
      );
    }
  }

  @override
  Future<Map<String, dynamic>> blockUser({
    required String userId,
    required String targetUserId,
  }) async {
    try {
      final response = await _apiClient.post(
        '/users/$userId/block',
        data: {'target_user_id': targetUserId},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Block user failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to block user: ${e.toString()}');
    }
  }

  @override
  Future<void> unblockUser({
    required String userId,
    required String targetUserId,
  }) async {
    try {
      final response = await _apiClient.delete(
        '/users/$userId/block/$targetUserId',
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException(
          'Unblock user failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to unblock user: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getBlockedUsers(String userId) async {
    try {
      final response = await _apiClient.get('/users/$userId/blocked');

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get blocked users failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get blocked users: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> followUser({
    required String userId,
    required String targetUserId,
  }) async {
    try {
      final response = await _apiClient.post(
        '/users/$userId/follow',
        data: {'target_user_id': targetUserId},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Follow user failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to follow user: ${e.toString()}');
    }
  }

  @override
  Future<void> unfollowUser({
    required String userId,
    required String targetUserId,
  }) async {
    try {
      final response = await _apiClient.delete(
        '/users/$userId/follow/$targetUserId',
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException(
          'Unfollow user failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to unfollow user: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getUserFollowers({
    required String userId,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '/users/$userId/followers',
        queryParameters: {'page': page, 'limit': limit},
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get user followers failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get user followers: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getUserFollowing({
    required String userId,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '/users/$userId/following',
        queryParameters: {'page': page, 'limit': limit},
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get user following failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get user following: ${e.toString()}');
    }
  }
}

import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';
import '../../core/error/failures.dart';

/// Remote data source for authentication operations
abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> signUp({
    required String email,
    required String password,
    required String username,
    String? fullName,
  });

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  });

  Future<void> activateAccount({required String token});

  Future<Map<String, dynamic>> refreshToken();

  Future<void> logout();

  Future<Map<String, dynamic>> forgotPassword({required String email});

  Future<void> resetPassword({
    required String token,
    required String newPassword,
  });

  Future<Map<String, dynamic>> getCurrentUser();

  Future<void> resendActivationEmail();
}

/// Implementation of AuthRemoteDataSource
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient _apiClient;
  final FlutterSecureStorage _secureStorage;

  AuthRemoteDataSourceImpl({
    required ApiClient apiClient,
    required FlutterSecureStorage secureStorage,
  }) : _apiClient = apiClient,
       _secureStorage = secureStorage;

  @override
  Future<Map<String, dynamic>> signUp({
    required String email,
    required String password,
    required String username,
    String? fullName,
  }) async {
    try {
      final response = await _apiClient.post(
        '/auth/sign-up',
        data: {
          'email': email,
          'password': password,
          'username': username,
          if (fullName != null) 'full_name': fullName,
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;

        // Store tokens if provided (some APIs send tokens immediately)
        if (data['access_token'] != null) {
          await _storeAuthTokens(
            accessToken: data['access_token'],
            refreshToken: data['refresh_token'],
          );
        }

        // Store user data if provided
        if (data['user'] != null) {
          await _storeUserData(data['user']);
        }

        return data;
      } else {
        throw ServerException(
          'Sign up failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to sign up: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;

        // Store authentication tokens
        await _storeAuthTokens(
          accessToken: data['access_token'],
          refreshToken: data['refresh_token'],
        );

        // Store user data
        if (data['user'] != null) {
          await _storeUserData(data['user']);
        }

        return data;
      } else {
        throw ServerException(
          'Login failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to login: ${e.toString()}');
    }
  }

  @override
  Future<void> activateAccount({required String token}) async {
    try {
      final response = await _apiClient.get('/auth/activate/$token');

      if (response.statusCode == 200) {
        // Account activated successfully
        final data = response.data as Map<String, dynamic>?;

        // Update stored user data if provided
        if (data?['user'] != null) {
          await _storeUserData(data!['user']);
        }
      } else {
        throw ServerException(
          'Account activation failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to activate account: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> refreshToken() async {
    try {
      final refreshToken = await _secureStorage.read(key: 'refresh_token');
      if (refreshToken == null) {
        throw ServerException('No refresh token available');
      }

      final response = await _apiClient.post(
        '/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;

        // Store new tokens
        await _storeAuthTokens(
          accessToken: data['access_token'],
          refreshToken:
              data['refresh_token'] ?? refreshToken, // Keep old if not provided
        );

        return data;
      } else {
        throw ServerException(
          'Token refresh failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to refresh token: ${e.toString()}');
    }
  }

  @override
  Future<void> logout() async {
    try {
      // Call logout endpoint if available
      try {
        await _apiClient.post('/auth/logout');
      } catch (e) {
        // Continue with local logout even if server call fails
      }

      // Clear all stored authentication data
      await _clearAuthData();
    } catch (e) {
      throw ServerException('Failed to logout: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> forgotPassword({required String email}) async {
    try {
      final response = await _apiClient.post(
        '/auth/forgot-password',
        data: {'email': email},
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Forgot password failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(
        'Failed to send forgot password email: ${e.toString()}',
      );
    }
  }

  @override
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final response = await _apiClient.post(
        '/auth/reset-password',
        data: {'token': token, 'password': newPassword},
      );

      if (response.statusCode != 200) {
        throw ServerException(
          'Password reset failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to reset password: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final response = await _apiClient.get('/auth/me');

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;

        // Update stored user data
        if (data['user'] != null) {
          await _storeUserData(data['user']);
        }

        return data;
      } else {
        throw ServerException(
          'Get current user failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get current user: ${e.toString()}');
    }
  }

  @override
  Future<void> resendActivationEmail() async {
    try {
      final response = await _apiClient.post('/auth/resend-activation');

      if (response.statusCode != 200) {
        throw ServerException(
          'Resend activation email failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(
        'Failed to resend activation email: ${e.toString()}',
      );
    }
  }

  // Helper methods for token and user data management
  Future<void> _storeAuthTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    await _secureStorage.write(key: 'auth_token', value: accessToken);
    if (refreshToken != null) {
      await _secureStorage.write(key: 'refresh_token', value: refreshToken);
    }
  }

  Future<void> _storeUserData(Map<String, dynamic> userData) async {
    final userJson = jsonEncode(userData);
    await _secureStorage.write(key: 'user_data', value: userJson);
  }

  Future<void> _clearAuthData() async {
    await Future.wait([
      _secureStorage.delete(key: 'auth_token'),
      _secureStorage.delete(key: 'refresh_token'),
      _secureStorage.delete(key: 'user_data'),
    ]);
  }

  // Helper methods for checking authentication state
  Future<bool> isLoggedIn() async {
    final token = await _secureStorage.read(key: 'auth_token');
    return token != null && token.isNotEmpty;
  }

  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: 'auth_token');
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: 'refresh_token');
  }

  Future<Map<String, dynamic>?> getStoredUserData() async {
    final userJson = await _secureStorage.read(key: 'user_data');
    if (userJson != null) {
      try {
        return jsonDecode(userJson) as Map<String, dynamic>;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

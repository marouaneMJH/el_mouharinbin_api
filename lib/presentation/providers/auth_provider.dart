import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/models/auth_response_model.dart';
import '../../data/models/user_model.dart';
import '../../core/error/failures.dart';

/// Authentication states
enum AuthStatus { loading, authenticated, unauthenticated, error }

/// Authentication state class
class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? errorMessage;
  final bool isLoading;

  const AuthState({
    required this.status,
    this.user,
    this.errorMessage,
    this.isLoading = false,
  });

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    String? errorMessage,
    bool? isLoading,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthState &&
          runtimeType == other.runtimeType &&
          status == other.status &&
          user == other.user &&
          errorMessage == other.errorMessage &&
          isLoading == other.isLoading;

  @override
  int get hashCode =>
      status.hashCode ^
      user.hashCode ^
      (errorMessage?.hashCode ?? 0) ^
      isLoading.hashCode;

  @override
  String toString() {
    return 'AuthState{status: $status, user: $user, errorMessage: $errorMessage, isLoading: $isLoading}';
  }
}

/// Auth provider dependencies
final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  throw UnimplementedError('AuthRemoteDataSource provider must be overridden');
});

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

/// Authentication notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRemoteDataSource _authRemoteDataSource;
  final FlutterSecureStorage _secureStorage;

  AuthNotifier({
    required AuthRemoteDataSource authRemoteDataSource,
    required FlutterSecureStorage secureStorage,
  }) : _authRemoteDataSource = authRemoteDataSource,
       _secureStorage = secureStorage,
       super(const AuthState(status: AuthStatus.loading));

  /// Initialize auth state on app start
  Future<void> checkAuthStatus() async {
    try {
      state = state.copyWith(status: AuthStatus.loading, isLoading: true);

      // Check if user has stored auth token
      final token = await _secureStorage.read(key: 'auth_token');

      if (token == null || token.isEmpty) {
        state = const AuthState(status: AuthStatus.unauthenticated);
        return;
      }

      // Verify token by getting current user
      final userData = await _authRemoteDataSource.getCurrentUser();
      final user = UserModel.fromJson(userData['user'] ?? userData);

      state = AuthState(status: AuthStatus.authenticated, user: user);
    } catch (e) {
      // Token might be expired or invalid
      await _clearAuthData();
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: _getErrorMessage(e),
      );
    }
  }

  /// Login with email and password
  Future<void> login({required String email, required String password}) async {
    try {
      state = state.copyWith(status: AuthStatus.loading, isLoading: true);

      // Validate inputs
      if (email.isEmpty || password.isEmpty) {
        throw Exception('Email and password are required');
      }

      if (!_isValidEmail(email)) {
        throw Exception('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw Exception('Password must be at least 6 characters long');
      }

      // Attempt login
      final response = await _authRemoteDataSource.login(
        email: email.trim(),
        password: password,
      );

      final authResponse = AuthResponseModel.fromJson(response);

      state = AuthState(
        status: AuthStatus.authenticated,
        user: authResponse.user,
      );
    } catch (e) {
      state = AuthState(
        status: AuthStatus.error,
        errorMessage: _getErrorMessage(e),
      );
    }
  }

  /// Sign up with email, password, and username
  Future<void> signUp({
    required String email,
    required String password,
    required String username,
    String? fullName,
  }) async {
    try {
      state = state.copyWith(status: AuthStatus.loading, isLoading: true);

      // Validate inputs
      if (email.isEmpty || password.isEmpty || username.isEmpty) {
        throw Exception('Email, password, and username are required');
      }

      if (!_isValidEmail(email)) {
        throw Exception('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw Exception('Password must be at least 6 characters long');
      }

      if (username.length < 3) {
        throw Exception('Username must be at least 3 characters long');
      }

      if (!_isValidUsername(username)) {
        throw Exception(
          'Username can only contain letters, numbers, and underscores',
        );
      }

      // Attempt sign up
      final response = await _authRemoteDataSource.signUp(
        email: email.trim(),
        password: password,
        username: username.trim(),
        fullName: fullName?.trim(),
      );

      // Check if email verification is required
      if (response['access_token'] != null) {
        final authResponse = AuthResponseModel.fromJson(response);
        state = AuthState(
          status: AuthStatus.authenticated,
          user: authResponse.user,
        );
      } else {
        // Email verification required
        state = const AuthState(
          status: AuthStatus.unauthenticated,
          errorMessage: 'Please check your email to verify your account',
        );
      }
    } catch (e) {
      state = AuthState(
        status: AuthStatus.error,
        errorMessage: _getErrorMessage(e),
      );
    }
  }

  /// Logout user
  Future<void> logout() async {
    try {
      state = state.copyWith(isLoading: true);

      // Call logout endpoint
      await _authRemoteDataSource.logout();

      // Clear local storage
      await _clearAuthData();

      state = const AuthState(status: AuthStatus.unauthenticated);
    } catch (e) {
      // Even if server call fails, clear local data
      await _clearAuthData();
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  /// Refresh user data
  Future<void> refreshUser() async {
    try {
      if (state.status != AuthStatus.authenticated) return;

      final userData = await _authRemoteDataSource.getCurrentUser();
      final user = UserModel.fromJson(userData['user'] ?? userData);

      state = state.copyWith(user: user);
    } catch (e) {
      // Handle token expiration
      if (e is ServerException && e.message.contains('401')) {
        await logout();
      }
    }
  }

  /// Clear error message
  void clearError() {
    if (state.errorMessage != null) {
      state = state.copyWith(errorMessage: null);
    }
  }

  /// Check if current user is authenticated
  bool get isAuthenticated => state.status == AuthStatus.authenticated;

  /// Check if authentication is in progress
  bool get isLoading => state.isLoading || state.status == AuthStatus.loading;

  /// Get current user
  UserModel? get currentUser => state.user;

  /// Get current auth token
  Future<String?> get authToken async {
    return await _secureStorage.read(key: 'auth_token');
  }

  /// Private helper methods
  bool _isValidEmail(String email) {
    return RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    ).hasMatch(email);
  }

  bool _isValidUsername(String username) {
    return RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(username);
  }

  String _getErrorMessage(dynamic error) {
    if (error is ServerException) {
      return error.message;
    } else if (error is Exception) {
      return error.toString().replaceFirst('Exception: ', '');
    } else {
      return 'An unexpected error occurred';
    }
  }

  Future<void> _clearAuthData() async {
    await Future.wait([
      _secureStorage.delete(key: 'auth_token'),
      _secureStorage.delete(key: 'refresh_token'),
      _secureStorage.delete(key: 'user_data'),
    ]);
  }
}

/// Auth provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authRemoteDataSource = ref.watch(authRemoteDataSourceProvider);
  final secureStorage = ref.watch(secureStorageProvider);

  return AuthNotifier(
    authRemoteDataSource: authRemoteDataSource,
    secureStorage: secureStorage,
  );
});

/// Convenience providers
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).status == AuthStatus.authenticated;
});

final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).user;
});

final authLoadingProvider = Provider<bool>((ref) {
  final authState = ref.watch(authProvider);
  return authState.isLoading || authState.status == AuthStatus.loading;
});

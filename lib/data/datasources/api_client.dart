import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/app_constants.dart';
import '../../core/error/failures.dart';

/// Dio client with comprehensive interceptors and error handling
class ApiClient {
  late final Dio _dio;
  final FlutterSecureStorage _secureStorage;

  ApiClient(this._secureStorage) {
    _dio = Dio();
    _setupInterceptors();
    _setupBaseOptions();
  }

  Dio get dio => _dio;

  void _setupBaseOptions() {
    _dio.options = BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: Duration(milliseconds: AppConstants.connectionTimeout),
      receiveTimeout: Duration(milliseconds: 60000), // 60 seconds for receive
      sendTimeout: Duration(milliseconds: AppConstants.sendTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': '${AppConstants.appName}/${AppConstants.appVersion}',
      },
      validateStatus: (status) {
        // Accept status codes from 200-299 and some 4xx codes for custom handling
        return status != null && status >= 200 && status < 500;
      },
    );
  }

  void _setupInterceptors() {
    // JWT Authentication Interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add JWT token to headers if available
          final token = await _secureStorage.read(key: 'auth_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          if (kDebugMode) {
            print('🚀 REQUEST[${options.method}] => ${options.uri}');
            print('Headers: ${options.headers}');
            if (options.data != null) {
              print('Body: ${options.data}');
            }
          }

          handler.next(options);
        },

        onResponse: (response, handler) async {
          if (kDebugMode) {
            print(
              '✅ RESPONSE[${response.statusCode}] => ${response.requestOptions.uri}',
            );
            print('Data: ${response.data}');
          }
          handler.next(response);
        },

        onError: (error, handler) async {
          if (kDebugMode) {
            print(
              '❌ ERROR[${error.response?.statusCode}] => ${error.requestOptions.uri}',
            );
            print('Error: ${error.message}');
          }

          // Handle specific error cases
          await _handleError(error, handler);
        },
      ),
    );

    // Retry Interceptor
    _dio.interceptors.add(RetryInterceptor());

    // Logging Interceptor (only in debug mode)
    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          requestHeader: false,
          responseHeader: false,
          error: true,
          logPrint: (obj) {
            debugPrint('📝 DIO LOG: $obj');
          },
        ),
      );
    }
  }

  Future<void> _handleError(
    DioException error,
    ErrorInterceptorHandler handler,
  ) async {
    final statusCode = error.response?.statusCode;

    switch (statusCode) {
      case 401:
        // Unauthorized - try to refresh token
        if (await _refreshToken()) {
          // Retry the original request with new token
          final options = error.requestOptions;
          final token = await _secureStorage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
            try {
              final response = await _dio.fetch(options);
              handler.resolve(response);
              return;
            } catch (e) {
              // If retry also fails, proceed with original error
            }
          }
        }

        // Clear auth data on failed refresh
        await _clearAuthData();
        handler.next(error);
        break;

      case 403:
        // Forbidden - user doesn't have permission
        if (kDebugMode) {
          print('🚫 Access forbidden for ${error.requestOptions.uri}');
        }
        handler.next(error);
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - these might be retried by RetryInterceptor
        if (kDebugMode) {
          print(
            '🔥 Server error ${statusCode} for ${error.requestOptions.uri}',
          );
        }
        handler.next(error);
        break;

      default:
        handler.next(error);
    }
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _secureStorage.read(key: 'refresh_token');
      if (refreshToken == null || refreshToken.isEmpty) {
        return false;
      }

      final response = await _dio.post(
        '/auth/refresh',
        data: {'refresh_token': refreshToken},
        options: Options(
          headers: {'Authorization': null}, // Remove old token
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final newToken = response.data['access_token'];
        final newRefreshToken = response.data['refresh_token'];

        if (newToken != null) {
          await _secureStorage.write(key: 'auth_token', value: newToken);
          if (newRefreshToken != null) {
            await _secureStorage.write(
              key: 'refresh_token',
              value: newRefreshToken,
            );
          }
          return true;
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('🔄 Token refresh failed: $e');
      }
    }

    return false;
  }

  Future<void> _clearAuthData() async {
    await _secureStorage.delete(key: 'auth_token');
    await _secureStorage.delete(key: 'refresh_token');
    await _secureStorage.delete(key: 'user_data');
  }

  // Public methods for making requests
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw ServerException(_mapDioError(e));
    }
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw ServerException(_mapDioError(e));
    }
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw ServerException(_mapDioError(e));
    }
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw ServerException(_mapDioError(e));
    }
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw ServerException(_mapDioError(e));
    }
  }

  String _mapDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return 'Connection timeout. Please check your internet connection.';
      case DioExceptionType.sendTimeout:
        return 'Request timeout. Please try again.';
      case DioExceptionType.receiveTimeout:
        return 'Server response timeout. Please try again.';
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message = error.response?.data?['message'];

        switch (statusCode) {
          case 400:
            return message ?? 'Bad request. Please check your input.';
          case 401:
            return 'Unauthorized. Please log in again.';
          case 403:
            return 'Access forbidden. You don\'t have permission.';
          case 404:
            return 'Resource not found.';
          case 409:
            return message ?? 'Conflict. Resource already exists.';
          case 422:
            return message ?? 'Validation error. Please check your input.';
          case 429:
            return 'Too many requests. Please try again later.';
          case 500:
            return 'Internal server error. Please try again later.';
          case 502:
            return 'Bad gateway. Server is temporarily unavailable.';
          case 503:
            return 'Service unavailable. Please try again later.';
          default:
            return message ?? 'Server error occurred. Please try again.';
        }
      case DioExceptionType.cancel:
        return 'Request was cancelled.';
      case DioExceptionType.connectionError:
        return 'Connection error. Please check your internet connection.';
      case DioExceptionType.badCertificate:
        return 'Certificate error. Connection is not secure.';
      case DioExceptionType.unknown:
        if (error.error is SocketException) {
          return 'No internet connection. Please check your network.';
        }
        return error.message ?? 'An unexpected error occurred.';
    }
  }

  void dispose() {
    _dio.close();
  }
}

/// Retry interceptor for handling network failures
class RetryInterceptor extends Interceptor {
  final int maxRetries;
  final Duration retryDelay;
  final List<DioExceptionType> retryableErrors;

  RetryInterceptor({
    this.maxRetries = 3,
    this.retryDelay = const Duration(seconds: 1),
    this.retryableErrors = const [
      DioExceptionType.connectionTimeout,
      DioExceptionType.receiveTimeout,
      DioExceptionType.connectionError,
    ],
  });

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final shouldRetry = _shouldRetry(err);
    final retryCount = err.requestOptions.extra['retryCount'] ?? 0;

    if (shouldRetry && retryCount < maxRetries) {
      if (kDebugMode) {
        print(
          '🔄 Retrying request (${retryCount + 1}/$maxRetries): ${err.requestOptions.uri}',
        );
      }

      // Add delay before retry
      await Future.delayed(retryDelay * (retryCount + 1));

      // Update retry count
      err.requestOptions.extra['retryCount'] = retryCount + 1;

      try {
        final response = await Dio().fetch(err.requestOptions);
        handler.resolve(response);
        return;
      } catch (e) {
        // If retry fails, continue with original error handling
      }
    }

    handler.next(err);
  }

  bool _shouldRetry(DioException error) {
    // Don't retry client errors (4xx) except for specific cases
    final statusCode = error.response?.statusCode;
    if (statusCode != null && statusCode >= 400 && statusCode < 500) {
      // Only retry 408 (Request Timeout) and 429 (Too Many Requests)
      return statusCode == 408 || statusCode == 429;
    }

    // Retry network errors and server errors (5xx)
    return retryableErrors.contains(error.type) ||
        (statusCode != null && statusCode >= 500);
  }
}

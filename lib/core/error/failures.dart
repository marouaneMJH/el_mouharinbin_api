import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String message;

  const Failure(this.message);

  @override
  List<Object> get props => [message];
}

class ServerFailure extends Failure {
  const ServerFailure(super.message);

  factory ServerFailure.fromDioException(DioException exception) {
    switch (exception.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const ServerFailure(
          'Connection timeout. Please check your internet connection.',
        );

      case DioExceptionType.badResponse:
        return ServerFailure(_handleBadResponse(exception.response));

      case DioExceptionType.cancel:
        return const ServerFailure('Request was cancelled.');

      case DioExceptionType.connectionError:
        return const ServerFailure(
          'Connection error. Please check your internet connection.',
        );

      case DioExceptionType.badCertificate:
        return const ServerFailure('Certificate error.');

      case DioExceptionType.unknown:
      default:
        return const ServerFailure('An unexpected error occurred.');
    }
  }

  static String _handleBadResponse(Response? response) {
    if (response == null) {
      return 'No response from server.';
    }

    switch (response.statusCode) {
      case 400:
        return response.data['message'] ?? 'Bad request.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access forbidden.';
      case 404:
        return 'Resource not found.';
      case 409:
        return response.data['message'] ?? 'Conflict occurred.';
      case 422:
        return response.data['message'] ?? 'Validation error.';
      case 500:
        return 'Internal server error.';
      case 502:
        return 'Bad gateway.';
      case 503:
        return 'Service unavailable.';
      default:
        return 'Server error (${response.statusCode}).';
    }
  }
}

class CacheFailure extends Failure {
  const CacheFailure(super.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class AuthFailure extends Failure {
  const AuthFailure(super.message);
}

class ValidationFailure extends Failure {
  const ValidationFailure(super.message);
}

class UnknownFailure extends Failure {
  const UnknownFailure(super.message);
}

// Exception classes
class ServerException implements Exception {
  final String message;
  final int? statusCode;

  const ServerException(this.message, [this.statusCode]);
}

class CacheException implements Exception {
  final String message;

  const CacheException(this.message);
}

class NetworkException implements Exception {
  final String message;

  const NetworkException(this.message);
}

class AuthException implements Exception {
  final String message;

  const AuthException(this.message);
}

// Error handler utility
class ErrorHandler {
  static Failure handleException(Exception exception) {
    if (exception is DioException) {
      return ServerFailure.fromDioException(exception);
    } else if (exception is ServerException) {
      return ServerFailure(exception.message);
    } else if (exception is CacheException) {
      return CacheFailure(exception.message);
    } else if (exception is NetworkException) {
      return NetworkFailure(exception.message);
    } else if (exception is AuthException) {
      return AuthFailure(exception.message);
    } else {
      return UnknownFailure(exception.toString());
    }
  }

  static String getErrorMessage(Failure failure) {
    switch (failure.runtimeType) {
      case ServerFailure:
        return failure.message;
      case NetworkFailure:
        return 'Please check your internet connection and try again.';
      case CacheFailure:
        return 'Unable to load cached data.';
      case AuthFailure:
        return 'Authentication failed. Please login again.';
      case ValidationFailure:
        return failure.message;
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

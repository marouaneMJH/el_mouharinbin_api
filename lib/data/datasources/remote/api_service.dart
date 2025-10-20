import 'package:dio/dio.dart';
import '../../../core/config/app_config.dart';
import '../../../core/error/failures.dart';

class ApiService {
  final Dio _dio;

  ApiService(this._dio);

  // Auth endpoints
  Future<Response> signIn({
    required String email,
    required String password,
  }) async {
    try {
      return await _dio.post(
        '${AppConfig.authEndpoint}/signin',
        data: {'email': email, 'password': password},
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> signUp({
    required String email,
    required String password,
    required String username,
    String? fullName,
  }) async {
    try {
      return await _dio.post(
        '${AppConfig.authEndpoint}/signup',
        data: {
          'email': email,
          'password': password,
          'username': username,
          if (fullName != null) 'fullName': fullName,
        },
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> signOut() async {
    try {
      return await _dio.post('${AppConfig.authEndpoint}/signout');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> getCurrentUser() async {
    try {
      return await _dio.get('${AppConfig.authEndpoint}/me');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> forgotPassword({required String email}) async {
    try {
      return await _dio.post(
        '${AppConfig.authEndpoint}/forgot-password',
        data: {'email': email},
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      return await _dio.post(
        '${AppConfig.authEndpoint}/reset-password',
        data: {'token': token, 'password': newPassword},
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      return await _dio.put(
        '${AppConfig.authEndpoint}/change-password',
        data: {'currentPassword': currentPassword, 'newPassword': newPassword},
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> refreshToken() async {
    try {
      return await _dio.post('${AppConfig.authEndpoint}/refresh');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> verifyEmail({required String token}) async {
    try {
      return await _dio.post(
        '${AppConfig.authEndpoint}/verify-email',
        data: {'token': token},
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> resendVerificationEmail() async {
    try {
      return await _dio.post('${AppConfig.authEndpoint}/resend-verification');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  // User endpoints
  Future<Response> getProfile() async {
    try {
      return await _dio.get('${AppConfig.userEndpoint}/profile');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> updateProfile({
    String? fullName,
    String? bio,
    DateTime? dateOfBirth,
    String? timezone,
  }) async {
    try {
      return await _dio.put(
        '${AppConfig.userEndpoint}/profile',
        data: {
          if (fullName != null) 'fullName': fullName,
          if (bio != null) 'bio': bio,
          if (dateOfBirth != null) 'dateOfBirth': dateOfBirth.toIso8601String(),
          if (timezone != null) 'timezone': timezone,
        },
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> uploadAvatar({required String filePath}) async {
    try {
      final formData = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(filePath),
      });

      return await _dio.post(
        '${AppConfig.userEndpoint}/avatar',
        data: formData,
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> getPreferences() async {
    try {
      return await _dio.get('${AppConfig.userEndpoint}/preferences');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> updatePreferences({
    bool? notificationsEnabled,
    bool? emailNotifications,
    bool? pushNotifications,
    bool? darkMode,
    String? language,
    bool? showProgress,
    bool? showCommunity,
    bool? allowMessages,
  }) async {
    try {
      return await _dio.put(
        '${AppConfig.userEndpoint}/preferences',
        data: {
          if (notificationsEnabled != null)
            'notificationsEnabled': notificationsEnabled,
          if (emailNotifications != null)
            'emailNotifications': emailNotifications,
          if (pushNotifications != null) 'pushNotifications': pushNotifications,
          if (darkMode != null) 'darkMode': darkMode,
          if (language != null) 'language': language,
          if (showProgress != null) 'showProgress': showProgress,
          if (showCommunity != null) 'showCommunity': showCommunity,
          if (allowMessages != null) 'allowMessages': allowMessages,
        },
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> getStats() async {
    try {
      return await _dio.get('${AppConfig.userEndpoint}/stats');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> updateStats({
    int? currentStreak,
    int? longestStreak,
    int? totalDays,
    int? totalRelapses,
    DateTime? lastRelapseDate,
    DateTime? streakStartDate,
    int? journalEntries,
    int? challengesCompleted,
    int? communityPosts,
    int? helpedOthers,
  }) async {
    try {
      return await _dio.put(
        '${AppConfig.userEndpoint}/stats',
        data: {
          if (currentStreak != null) 'currentStreak': currentStreak,
          if (longestStreak != null) 'longestStreak': longestStreak,
          if (totalDays != null) 'totalDays': totalDays,
          if (totalRelapses != null) 'totalRelapses': totalRelapses,
          if (lastRelapseDate != null)
            'lastRelapseDate': lastRelapseDate.toIso8601String(),
          if (streakStartDate != null)
            'streakStartDate': streakStartDate.toIso8601String(),
          if (journalEntries != null) 'journalEntries': journalEntries,
          if (challengesCompleted != null)
            'challengesCompleted': challengesCompleted,
          if (communityPosts != null) 'communityPosts': communityPosts,
          if (helpedOthers != null) 'helpedOthers': helpedOthers,
        },
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> deleteAccount() async {
    try {
      return await _dio.delete('${AppConfig.userEndpoint}/account');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> searchUsers({
    required String query,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      return await _dio.get(
        '${AppConfig.userEndpoint}/search',
        queryParameters: {'q': query, 'page': page, 'limit': limit},
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> getUserById({required String userId}) async {
    try {
      return await _dio.get('${AppConfig.userEndpoint}/$userId');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> getLeaderboard({
    String period = 'weekly',
    int page = 1,
    int limit = 50,
  }) async {
    try {
      return await _dio.get(
        '${AppConfig.userEndpoint}/leaderboard',
        queryParameters: {'period': period, 'page': page, 'limit': limit},
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  // Journal endpoints
  Future<Response> createJournalEntry({
    required String title,
    required String content,
    required String mood,
    List<String> tags = const [],
    bool isPrivate = true,
    int urgeLevel = 0,
    List<String> triggers = const [],
    List<String> copingStrategies = const [],
    String? gratitude,
    String? tomorrowGoals,
  }) async {
    try {
      return await _dio.post(
        '${AppConfig.journalEndpoint}/entries',
        data: {
          'title': title,
          'content': content,
          'mood': mood,
          'tags': tags,
          'isPrivate': isPrivate,
          'urgeLevel': urgeLevel,
          'triggers': triggers,
          'copingStrategies': copingStrategies,
          if (gratitude != null) 'gratitude': gratitude,
          if (tomorrowGoals != null) 'tomorrowGoals': tomorrowGoals,
        },
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> getJournalEntries({
    int page = 1,
    int limit = 20,
    DateTime? startDate,
    DateTime? endDate,
    List<String>? tags,
    String? mood,
  }) async {
    try {
      return await _dio.get(
        '${AppConfig.journalEndpoint}/entries',
        queryParameters: {
          'page': page,
          'limit': limit,
          if (startDate != null) 'startDate': startDate.toIso8601String(),
          if (endDate != null) 'endDate': endDate.toIso8601String(),
          if (tags != null) 'tags': tags.join(','),
          if (mood != null) 'mood': mood,
        },
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> getJournalEntry({required String entryId}) async {
    try {
      return await _dio.get('${AppConfig.journalEndpoint}/entries/$entryId');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> updateJournalEntry({
    required String entryId,
    String? title,
    String? content,
    String? mood,
    List<String>? tags,
    bool? isPrivate,
    int? urgeLevel,
    List<String>? triggers,
    List<String>? copingStrategies,
    String? gratitude,
    String? tomorrowGoals,
  }) async {
    try {
      return await _dio.put(
        '${AppConfig.journalEndpoint}/entries/$entryId',
        data: {
          if (title != null) 'title': title,
          if (content != null) 'content': content,
          if (mood != null) 'mood': mood,
          if (tags != null) 'tags': tags,
          if (isPrivate != null) 'isPrivate': isPrivate,
          if (urgeLevel != null) 'urgeLevel': urgeLevel,
          if (triggers != null) 'triggers': triggers,
          if (copingStrategies != null) 'copingStrategies': copingStrategies,
          if (gratitude != null) 'gratitude': gratitude,
          if (tomorrowGoals != null) 'tomorrowGoals': tomorrowGoals,
        },
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> deleteJournalEntry({required String entryId}) async {
    try {
      return await _dio.delete('${AppConfig.journalEndpoint}/entries/$entryId');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  // Challenge endpoints
  Future<Response> getChallenges({
    int page = 1,
    int limit = 20,
    String? type,
    String? difficulty,
    String? category,
    List<String>? tags,
    bool? isPublic,
  }) async {
    try {
      return await _dio.get(
        '${AppConfig.challengeEndpoint}',
        queryParameters: {
          'page': page,
          'limit': limit,
          if (type != null) 'type': type,
          if (difficulty != null) 'difficulty': difficulty,
          if (category != null) 'category': category,
          if (tags != null) 'tags': tags.join(','),
          if (isPublic != null) 'isPublic': isPublic,
        },
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> getChallenge({required String challengeId}) async {
    try {
      return await _dio.get('${AppConfig.challengeEndpoint}/$challengeId');
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> joinChallenge({required String challengeId}) async {
    try {
      return await _dio.post(
        '${AppConfig.challengeEndpoint}/$challengeId/join',
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> leaveChallenge({required String challengeId}) async {
    try {
      return await _dio.post(
        '${AppConfig.challengeEndpoint}/$challengeId/leave',
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  Future<Response> getUserChallenges({
    String? userId,
    String? status,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      return await _dio.get(
        '${AppConfig.challengeEndpoint}/user',
        queryParameters: {
          if (userId != null) 'userId': userId,
          if (status != null) 'status': status,
          'page': page,
          'limit': limit,
        },
      );
    } on DioException catch (e) {
      throw ServerException(_getErrorMessage(e));
    }
  }

  // Helper method to extract error message
  String _getErrorMessage(DioException exception) {
    switch (exception.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timeout';

      case DioExceptionType.badResponse:
        final statusCode = exception.response?.statusCode;
        final data = exception.response?.data;

        if (data is Map<String, dynamic> && data.containsKey('message')) {
          return data['message'] as String;
        }

        return 'Server error ($statusCode)';

      case DioExceptionType.cancel:
        return 'Request was cancelled';

      case DioExceptionType.connectionError:
        return 'Connection error';

      case DioExceptionType.badCertificate:
        return 'Certificate error';

      case DioExceptionType.unknown:
      default:
        return exception.message ?? 'Unknown error occurred';
    }
  }
}

import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get baseUrl =>
      dotenv.env['BASE_URL'] ?? 'http://localhost:3000';
  static String get socketUrl =>
      dotenv.env['SOCKET_URL'] ?? 'http://localhost:3000';
  static String get apiKey => dotenv.env['API_KEY'] ?? '';

  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'theme_mode';
  static const String onboardingKey = 'onboarding_completed';

  // API endpoints
  static const String authEndpoint = '/api/auth';
  static const String userEndpoint = '/api/users';
  static const String journalEndpoint = '/api/journal';
  static const String challengeEndpoint = '/api/challenges';
  static const String communityEndpoint = '/api/community';

  // Socket events
  static const String socketConnect = 'connect';
  static const String socketDisconnect = 'disconnect';
  static const String socketUserJoin = 'user:join';
  static const String socketUserLeave = 'user:leave';
  static const String socketChallengeUpdate = 'challenge:update';
  static const String socketCommunityMessage = 'community:message';

  // App constants
  static const int connectionTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000;
  static const int sendTimeout = 30000;
  static const int maxRetries = 3;

  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);

  // Challenge types
  static const List<String> challengeTypes = [
    'daily',
    'weekly',
    'monthly',
    'custom',
  ];

  // Notification types
  static const List<String> notificationTypes = [
    'reminder',
    'achievement',
    'support',
    'challenge',
  ];
}

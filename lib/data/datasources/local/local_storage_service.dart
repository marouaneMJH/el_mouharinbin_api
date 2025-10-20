import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/config/app_config.dart';
import '../../../domain/entities/user.dart';

class LocalStorageService {
  final FlutterSecureStorage _secureStorage;
  final SharedPreferences _sharedPreferences;

  LocalStorageService({
    required FlutterSecureStorage secureStorage,
    required SharedPreferences sharedPreferences,
  }) : _secureStorage = secureStorage,
       _sharedPreferences = sharedPreferences;

  // Auth token management
  Future<void> saveAuthToken(String token) async {
    await _secureStorage.write(key: AppConfig.tokenKey, value: token);
  }

  Future<String?> getAuthToken() async {
    return await _secureStorage.read(key: AppConfig.tokenKey);
  }

  Future<void> saveRefreshToken(String token) async {
    await _secureStorage.write(key: AppConfig.refreshTokenKey, value: token);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: AppConfig.refreshTokenKey);
  }

  Future<void> clearAuthData() async {
    await _secureStorage.delete(key: AppConfig.tokenKey);
    await _secureStorage.delete(key: AppConfig.refreshTokenKey);
    await _secureStorage.delete(key: AppConfig.userKey);
  }

  // User data management
  Future<void> saveUser(User user) async {
    final userJson = jsonEncode(user.toJson());
    await _secureStorage.write(key: AppConfig.userKey, value: userJson);
  }

  Future<User?> getUser() async {
    final userJson = await _secureStorage.read(key: AppConfig.userKey);
    if (userJson != null) {
      try {
        final userMap = jsonDecode(userJson) as Map<String, dynamic>;
        return UserJson.fromJson(userMap);
      } catch (e) {
        // Clear corrupted data
        await _secureStorage.delete(key: AppConfig.userKey);
        return null;
      }
    }
    return null;
  }

  // Theme management
  Future<void> saveThemeMode(bool isDarkMode) async {
    await _sharedPreferences.setBool(AppConfig.themeKey, isDarkMode);
  }

  bool? getThemeMode() {
    return _sharedPreferences.getBool(AppConfig.themeKey);
  }

  // Onboarding management
  Future<void> setOnboardingCompleted(bool completed) async {
    await _sharedPreferences.setBool(AppConfig.onboardingKey, completed);
  }

  bool isOnboardingCompleted() {
    return _sharedPreferences.getBool(AppConfig.onboardingKey) ?? false;
  }

  // Generic data storage
  Future<void> saveString(String key, String value) async {
    await _sharedPreferences.setString(key, value);
  }

  String? getString(String key) {
    return _sharedPreferences.getString(key);
  }

  Future<void> saveInt(String key, int value) async {
    await _sharedPreferences.setInt(key, value);
  }

  int? getInt(String key) {
    return _sharedPreferences.getInt(key);
  }

  Future<void> saveBool(String key, bool value) async {
    await _sharedPreferences.setBool(key, value);
  }

  bool? getBool(String key) {
    return _sharedPreferences.getBool(key);
  }

  Future<void> saveDouble(String key, double value) async {
    await _sharedPreferences.setDouble(key, value);
  }

  double? getDouble(String key) {
    return _sharedPreferences.getDouble(key);
  }

  Future<void> saveStringList(String key, List<String> value) async {
    await _sharedPreferences.setStringList(key, value);
  }

  List<String>? getStringList(String key) {
    return _sharedPreferences.getStringList(key);
  }

  // Secure data storage
  Future<void> saveSecureString(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }

  Future<String?> getSecureString(String key) async {
    return await _secureStorage.read(key: key);
  }

  Future<void> deleteSecureString(String key) async {
    await _secureStorage.delete(key: key);
  }

  // Cache management
  Future<void> saveCache(String key, Map<String, dynamic> data) async {
    final jsonData = jsonEncode(data);
    await _sharedPreferences.setString('cache_$key', jsonData);
  }

  Map<String, dynamic>? getCache(String key) {
    final jsonData = _sharedPreferences.getString('cache_$key');
    if (jsonData != null) {
      try {
        return jsonDecode(jsonData) as Map<String, dynamic>;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  Future<void> clearCache(String key) async {
    await _sharedPreferences.remove('cache_$key');
  }

  Future<void> clearAllCache() async {
    final keys = _sharedPreferences
        .getKeys()
        .where((key) => key.startsWith('cache_'))
        .toList();

    for (final key in keys) {
      await _sharedPreferences.remove(key);
    }
  }

  // Clear all data
  Future<void> clearAllData() async {
    await _secureStorage.deleteAll();
    await _sharedPreferences.clear();
  }
}

// Extension to add toJson and fromJson to User entity
extension UserJson on User {
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'username': username,
      'fullName': fullName,
      'avatarUrl': avatarUrl,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isEmailVerified': isEmailVerified,
      'isActive': isActive,
      'bio': bio,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'timezone': timezone,
      'preferences': preferences?.toJson(),
      'stats': stats?.toJson(),
    };
  }

  static User fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      username: json['username'] as String,
      fullName: json['fullName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      isEmailVerified: json['isEmailVerified'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? false,
      bio: json['bio'] as String?,
      dateOfBirth: json['dateOfBirth'] != null
          ? DateTime.parse(json['dateOfBirth'] as String)
          : null,
      timezone: json['timezone'] as String?,
      preferences: json['preferences'] != null
          ? UserPreferencesJson.fromJson(
              json['preferences'] as Map<String, dynamic>,
            )
          : null,
      stats: json['stats'] != null
          ? UserStatsJson.fromJson(json['stats'] as Map<String, dynamic>)
          : null,
    );
  }
}

extension UserPreferencesJson on UserPreferences {
  Map<String, dynamic> toJson() {
    return {
      'notificationsEnabled': notificationsEnabled,
      'emailNotifications': emailNotifications,
      'pushNotifications': pushNotifications,
      'darkMode': darkMode,
      'language': language,
      'showProgress': showProgress,
      'showCommunity': showCommunity,
      'allowMessages': allowMessages,
    };
  }

  static UserPreferences fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      notificationsEnabled: json['notificationsEnabled'] as bool? ?? true,
      emailNotifications: json['emailNotifications'] as bool? ?? true,
      pushNotifications: json['pushNotifications'] as bool? ?? true,
      darkMode: json['darkMode'] as bool? ?? false,
      language: json['language'] as String? ?? 'en',
      showProgress: json['showProgress'] as bool? ?? true,
      showCommunity: json['showCommunity'] as bool? ?? true,
      allowMessages: json['allowMessages'] as bool? ?? true,
    );
  }
}

extension UserStatsJson on UserStats {
  Map<String, dynamic> toJson() {
    return {
      'currentStreak': currentStreak,
      'longestStreak': longestStreak,
      'totalDays': totalDays,
      'totalRelapses': totalRelapses,
      'lastRelapseDate': lastRelapseDate?.toIso8601String(),
      'streakStartDate': streakStartDate?.toIso8601String(),
      'journalEntries': journalEntries,
      'challengesCompleted': challengesCompleted,
      'communityPosts': communityPosts,
      'helpedOthers': helpedOthers,
    };
  }

  static UserStats fromJson(Map<String, dynamic> json) {
    return UserStats(
      currentStreak: json['currentStreak'] as int? ?? 0,
      longestStreak: json['longestStreak'] as int? ?? 0,
      totalDays: json['totalDays'] as int? ?? 0,
      totalRelapses: json['totalRelapses'] as int? ?? 0,
      lastRelapseDate: json['lastRelapseDate'] != null
          ? DateTime.parse(json['lastRelapseDate'] as String)
          : null,
      streakStartDate: json['streakStartDate'] != null
          ? DateTime.parse(json['streakStartDate'] as String)
          : null,
      journalEntries: json['journalEntries'] as int? ?? 0,
      challengesCompleted: json['challengesCompleted'] as int? ?? 0,
      communityPosts: json['communityPosts'] as int? ?? 0,
      helpedOthers: json['helpedOthers'] as int? ?? 0,
    );
  }
}

import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String username;
  final String? fullName;
  final String? avatarUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isEmailVerified;
  final bool isActive;
  final String? bio;
  final DateTime? dateOfBirth;
  final String? timezone;
  final UserPreferences? preferences;
  final UserStats? stats;

  const User({
    required this.id,
    required this.email,
    required this.username,
    this.fullName,
    this.avatarUrl,
    required this.createdAt,
    required this.updatedAt,
    this.isEmailVerified = false,
    this.isActive = false,
    this.bio,
    this.dateOfBirth,
    this.timezone,
    this.preferences,
    this.stats,
  });

  User copyWith({
    String? id,
    String? email,
    String? username,
    String? fullName,
    String? avatarUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isEmailVerified,
    bool? isActive,
    String? bio,
    DateTime? dateOfBirth,
    String? timezone,
    UserPreferences? preferences,
    UserStats? stats,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      username: username ?? this.username,
      fullName: fullName ?? this.fullName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isActive: isActive ?? this.isActive,
      bio: bio ?? this.bio,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      timezone: timezone ?? this.timezone,
      preferences: preferences ?? this.preferences,
      stats: stats ?? this.stats,
    );
  }

  @override
  List<Object?> get props => [
    id,
    email,
    username,
    fullName,
    avatarUrl,
    createdAt,
    updatedAt,
    isEmailVerified,
    isActive,
    bio,
    dateOfBirth,
    timezone,
    preferences,
    stats,
  ];
}

class UserPreferences extends Equatable {
  final bool notificationsEnabled;
  final bool emailNotifications;
  final bool pushNotifications;
  final bool darkMode;
  final String language;
  final bool showProgress;
  final bool showCommunity;
  final bool allowMessages;

  const UserPreferences({
    this.notificationsEnabled = true,
    this.emailNotifications = true,
    this.pushNotifications = true,
    this.darkMode = false,
    this.language = 'en',
    this.showProgress = true,
    this.showCommunity = true,
    this.allowMessages = true,
  });

  UserPreferences copyWith({
    bool? notificationsEnabled,
    bool? emailNotifications,
    bool? pushNotifications,
    bool? darkMode,
    String? language,
    bool? showProgress,
    bool? showCommunity,
    bool? allowMessages,
  }) {
    return UserPreferences(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      pushNotifications: pushNotifications ?? this.pushNotifications,
      darkMode: darkMode ?? this.darkMode,
      language: language ?? this.language,
      showProgress: showProgress ?? this.showProgress,
      showCommunity: showCommunity ?? this.showCommunity,
      allowMessages: allowMessages ?? this.allowMessages,
    );
  }

  @override
  List<Object?> get props => [
    notificationsEnabled,
    emailNotifications,
    pushNotifications,
    darkMode,
    language,
    showProgress,
    showCommunity,
    allowMessages,
  ];
}

class UserStats extends Equatable {
  final int currentStreak;
  final int longestStreak;
  final int totalDays;
  final int totalRelapses;
  final DateTime? lastRelapseDate;
  final DateTime? streakStartDate;
  final int journalEntries;
  final int challengesCompleted;
  final int communityPosts;
  final int helpedOthers;

  const UserStats({
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.totalDays = 0,
    this.totalRelapses = 0,
    this.lastRelapseDate,
    this.streakStartDate,
    this.journalEntries = 0,
    this.challengesCompleted = 0,
    this.communityPosts = 0,
    this.helpedOthers = 0,
  });

  UserStats copyWith({
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
  }) {
    return UserStats(
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      totalDays: totalDays ?? this.totalDays,
      totalRelapses: totalRelapses ?? this.totalRelapses,
      lastRelapseDate: lastRelapseDate ?? this.lastRelapseDate,
      streakStartDate: streakStartDate ?? this.streakStartDate,
      journalEntries: journalEntries ?? this.journalEntries,
      challengesCompleted: challengesCompleted ?? this.challengesCompleted,
      communityPosts: communityPosts ?? this.communityPosts,
      helpedOthers: helpedOthers ?? this.helpedOthers,
    );
  }

  @override
  List<Object?> get props => [
    currentStreak,
    longestStreak,
    totalDays,
    totalRelapses,
    lastRelapseDate,
    streakStartDate,
    journalEntries,
    challengesCompleted,
    communityPosts,
    helpedOthers,
  ];
}

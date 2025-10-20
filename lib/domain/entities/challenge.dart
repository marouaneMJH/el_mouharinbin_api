import 'package:equatable/equatable.dart';

enum ChallengeDifficulty { easy, medium, hard }

enum ChallengeType { daily, weekly, monthly, custom }

enum ChallengeStatus { notStarted, active, completed, failed, paused }

extension ChallengeDifficultyExtension on ChallengeDifficulty {
  String get name {
    switch (this) {
      case ChallengeDifficulty.easy:
        return 'Easy';
      case ChallengeDifficulty.medium:
        return 'Medium';
      case ChallengeDifficulty.hard:
        return 'Hard';
    }
  }

  int get points {
    switch (this) {
      case ChallengeDifficulty.easy:
        return 10;
      case ChallengeDifficulty.medium:
        return 25;
      case ChallengeDifficulty.hard:
        return 50;
    }
  }
}

extension ChallengeTypeExtension on ChallengeType {
  String get name {
    switch (this) {
      case ChallengeType.daily:
        return 'Daily';
      case ChallengeType.weekly:
        return 'Weekly';
      case ChallengeType.monthly:
        return 'Monthly';
      case ChallengeType.custom:
        return 'Custom';
    }
  }

  Duration get defaultDuration {
    switch (this) {
      case ChallengeType.daily:
        return const Duration(days: 1);
      case ChallengeType.weekly:
        return const Duration(days: 7);
      case ChallengeType.monthly:
        return const Duration(days: 30);
      case ChallengeType.custom:
        return const Duration(days: 1);
    }
  }
}

class Challenge extends Equatable {
  final String id;
  final String title;
  final String description;
  final ChallengeType type;
  final ChallengeDifficulty difficulty;
  final ChallengeStatus status;
  final DateTime startDate;
  final DateTime? endDate;
  final int targetDays;
  final int currentDay;
  final int points;
  final String category;
  final List<String> tags;
  final String? imageUrl;
  final List<ChallengeTask> tasks;
  final List<String> participants;
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isPublic;
  final String? reward;

  const Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.difficulty,
    required this.status,
    required this.startDate,
    this.endDate,
    required this.targetDays,
    this.currentDay = 0,
    required this.points,
    required this.category,
    this.tags = const [],
    this.imageUrl,
    this.tasks = const [],
    this.participants = const [],
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
    this.isPublic = true,
    this.reward,
  });

  Challenge copyWith({
    String? id,
    String? title,
    String? description,
    ChallengeType? type,
    ChallengeDifficulty? difficulty,
    ChallengeStatus? status,
    DateTime? startDate,
    DateTime? endDate,
    int? targetDays,
    int? currentDay,
    int? points,
    String? category,
    List<String>? tags,
    String? imageUrl,
    List<ChallengeTask>? tasks,
    List<String>? participants,
    String? createdBy,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isPublic,
    String? reward,
  }) {
    return Challenge(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      difficulty: difficulty ?? this.difficulty,
      status: status ?? this.status,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      targetDays: targetDays ?? this.targetDays,
      currentDay: currentDay ?? this.currentDay,
      points: points ?? this.points,
      category: category ?? this.category,
      tags: tags ?? this.tags,
      imageUrl: imageUrl ?? this.imageUrl,
      tasks: tasks ?? this.tasks,
      participants: participants ?? this.participants,
      createdBy: createdBy ?? this.createdBy,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isPublic: isPublic ?? this.isPublic,
      reward: reward ?? this.reward,
    );
  }

  double get progressPercentage {
    if (targetDays == 0) return 0.0;
    return (currentDay / targetDays).clamp(0.0, 1.0);
  }

  Duration get timeRemaining {
    if (endDate == null) return Duration.zero;
    final now = DateTime.now();
    if (endDate!.isBefore(now)) return Duration.zero;
    return endDate!.difference(now);
  }

  bool get isCompleted => status == ChallengeStatus.completed;
  bool get isActive => status == ChallengeStatus.active;
  bool get isFailed => status == ChallengeStatus.failed;

  @override
  List<Object?> get props => [
    id,
    title,
    description,
    type,
    difficulty,
    status,
    startDate,
    endDate,
    targetDays,
    currentDay,
    points,
    category,
    tags,
    imageUrl,
    tasks,
    participants,
    createdBy,
    createdAt,
    updatedAt,
    isPublic,
    reward,
  ];
}

class ChallengeTask extends Equatable {
  final String id;
  final String challengeId;
  final String title;
  final String description;
  final bool isCompleted;
  final DateTime? completedAt;
  final int day;
  final bool isOptional;

  const ChallengeTask({
    required this.id,
    required this.challengeId,
    required this.title,
    required this.description,
    this.isCompleted = false,
    this.completedAt,
    required this.day,
    this.isOptional = false,
  });

  ChallengeTask copyWith({
    String? id,
    String? challengeId,
    String? title,
    String? description,
    bool? isCompleted,
    DateTime? completedAt,
    int? day,
    bool? isOptional,
  }) {
    return ChallengeTask(
      id: id ?? this.id,
      challengeId: challengeId ?? this.challengeId,
      title: title ?? this.title,
      description: description ?? this.description,
      isCompleted: isCompleted ?? this.isCompleted,
      completedAt: completedAt ?? this.completedAt,
      day: day ?? this.day,
      isOptional: isOptional ?? this.isOptional,
    );
  }

  @override
  List<Object?> get props => [
    id,
    challengeId,
    title,
    description,
    isCompleted,
    completedAt,
    day,
    isOptional,
  ];
}

class UserChallenge extends Equatable {
  final String id;
  final String userId;
  final String challengeId;
  final ChallengeStatus status;
  final DateTime joinedAt;
  final DateTime? completedAt;
  final DateTime? lastActivityAt;
  final int currentDay;
  final List<String> completedTasks;
  final int pointsEarned;

  const UserChallenge({
    required this.id,
    required this.userId,
    required this.challengeId,
    required this.status,
    required this.joinedAt,
    this.completedAt,
    this.lastActivityAt,
    this.currentDay = 0,
    this.completedTasks = const [],
    this.pointsEarned = 0,
  });

  UserChallenge copyWith({
    String? id,
    String? userId,
    String? challengeId,
    ChallengeStatus? status,
    DateTime? joinedAt,
    DateTime? completedAt,
    DateTime? lastActivityAt,
    int? currentDay,
    List<String>? completedTasks,
    int? pointsEarned,
  }) {
    return UserChallenge(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      challengeId: challengeId ?? this.challengeId,
      status: status ?? this.status,
      joinedAt: joinedAt ?? this.joinedAt,
      completedAt: completedAt ?? this.completedAt,
      lastActivityAt: lastActivityAt ?? this.lastActivityAt,
      currentDay: currentDay ?? this.currentDay,
      completedTasks: completedTasks ?? this.completedTasks,
      pointsEarned: pointsEarned ?? this.pointsEarned,
    );
  }

  @override
  List<Object?> get props => [
    id,
    userId,
    challengeId,
    status,
    joinedAt,
    completedAt,
    lastActivityAt,
    currentDay,
    completedTasks,
    pointsEarned,
  ];
}

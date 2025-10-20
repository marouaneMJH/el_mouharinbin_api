import 'package:equatable/equatable.dart';

enum JournalMood { excellent, good, neutral, bad, terrible }

extension JournalMoodExtension on JournalMood {
  String get name {
    switch (this) {
      case JournalMood.excellent:
        return 'Excellent';
      case JournalMood.good:
        return 'Good';
      case JournalMood.neutral:
        return 'Neutral';
      case JournalMood.bad:
        return 'Bad';
      case JournalMood.terrible:
        return 'Terrible';
    }
  }

  String get emoji {
    switch (this) {
      case JournalMood.excellent:
        return '😄';
      case JournalMood.good:
        return '😊';
      case JournalMood.neutral:
        return '😐';
      case JournalMood.bad:
        return '😞';
      case JournalMood.terrible:
        return '😢';
    }
  }

  double get value {
    switch (this) {
      case JournalMood.excellent:
        return 5.0;
      case JournalMood.good:
        return 4.0;
      case JournalMood.neutral:
        return 3.0;
      case JournalMood.bad:
        return 2.0;
      case JournalMood.terrible:
        return 1.0;
    }
  }
}

class JournalEntry extends Equatable {
  final String id;
  final String userId;
  final String title;
  final String content;
  final JournalMood mood;
  final List<String> tags;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isPrivate;
  final int urgeLevel; // 1-10 scale
  final List<String> triggers;
  final List<String> copingStrategies;
  final String? gratitude;
  final String? tomorrowGoals;

  const JournalEntry({
    required this.id,
    required this.userId,
    required this.title,
    required this.content,
    required this.mood,
    required this.tags,
    required this.createdAt,
    required this.updatedAt,
    this.isPrivate = true,
    this.urgeLevel = 0,
    this.triggers = const [],
    this.copingStrategies = const [],
    this.gratitude,
    this.tomorrowGoals,
  });

  JournalEntry copyWith({
    String? id,
    String? userId,
    String? title,
    String? content,
    JournalMood? mood,
    List<String>? tags,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isPrivate,
    int? urgeLevel,
    List<String>? triggers,
    List<String>? copingStrategies,
    String? gratitude,
    String? tomorrowGoals,
  }) {
    return JournalEntry(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      content: content ?? this.content,
      mood: mood ?? this.mood,
      tags: tags ?? this.tags,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isPrivate: isPrivate ?? this.isPrivate,
      urgeLevel: urgeLevel ?? this.urgeLevel,
      triggers: triggers ?? this.triggers,
      copingStrategies: copingStrategies ?? this.copingStrategies,
      gratitude: gratitude ?? this.gratitude,
      tomorrowGoals: tomorrowGoals ?? this.tomorrowGoals,
    );
  }

  @override
  List<Object?> get props => [
    id,
    userId,
    title,
    content,
    mood,
    tags,
    createdAt,
    updatedAt,
    isPrivate,
    urgeLevel,
    triggers,
    copingStrategies,
    gratitude,
    tomorrowGoals,
  ];
}

class JournalTemplate extends Equatable {
  final String id;
  final String name;
  final String description;
  final List<String> prompts;
  final bool isDefault;
  final String category;

  const JournalTemplate({
    required this.id,
    required this.name,
    required this.description,
    required this.prompts,
    this.isDefault = false,
    required this.category,
  });

  JournalTemplate copyWith({
    String? id,
    String? name,
    String? description,
    List<String>? prompts,
    bool? isDefault,
    String? category,
  }) {
    return JournalTemplate(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      prompts: prompts ?? this.prompts,
      isDefault: isDefault ?? this.isDefault,
      category: category ?? this.category,
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    description,
    prompts,
    isDefault,
    category,
  ];
}

import 'package:dartz/dartz.dart';
import '../entities/journal.dart';
import '../../core/error/failures.dart';

abstract class JournalRepository {
  Future<Either<Failure, JournalEntry>> createEntry({
    required String title,
    required String content,
    required JournalMood mood,
    List<String> tags = const [],
    bool isPrivate = true,
    int urgeLevel = 0,
    List<String> triggers = const [],
    List<String> copingStrategies = const [],
    String? gratitude,
    String? tomorrowGoals,
  });

  Future<Either<Failure, JournalEntry>> updateEntry({
    required String entryId,
    String? title,
    String? content,
    JournalMood? mood,
    List<String>? tags,
    bool? isPrivate,
    int? urgeLevel,
    List<String>? triggers,
    List<String>? copingStrategies,
    String? gratitude,
    String? tomorrowGoals,
  });

  Future<Either<Failure, Unit>> deleteEntry({required String entryId});

  Future<Either<Failure, JournalEntry>> getEntry({required String entryId});

  Future<Either<Failure, List<JournalEntry>>> getEntries({
    int page = 1,
    int limit = 20,
    DateTime? startDate,
    DateTime? endDate,
    List<String>? tags,
    JournalMood? mood,
  });

  Future<Either<Failure, List<JournalEntry>>> searchEntries({
    required String query,
    int page = 1,
    int limit = 20,
  });

  Future<Either<Failure, JournalEntry?>> getTodayEntry();

  Future<Either<Failure, List<JournalTemplate>>> getTemplates();

  Future<Either<Failure, JournalTemplate>> createTemplate({
    required String name,
    required String description,
    required List<String> prompts,
    required String category,
  });

  Future<Either<Failure, Unit>> deleteTemplate({required String templateId});

  Future<Either<Failure, Map<String, int>>> getMoodStats({
    DateTime? startDate,
    DateTime? endDate,
  });

  Future<Either<Failure, Map<String, int>>> getUrgeStats({
    DateTime? startDate,
    DateTime? endDate,
  });

  Future<Either<Failure, List<String>>> getTopTriggers({
    DateTime? startDate,
    DateTime? endDate,
    int limit = 10,
  });

  Future<Either<Failure, List<String>>> getTopCopingStrategies({
    DateTime? startDate,
    DateTime? endDate,
    int limit = 10,
  });
}

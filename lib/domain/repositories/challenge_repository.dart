import 'package:dartz/dartz.dart';
import '../entities/challenge.dart';
import '../../core/error/failures.dart';

abstract class ChallengeRepository {
  Future<Either<Failure, Challenge>> createChallenge({
    required String title,
    required String description,
    required ChallengeType type,
    required ChallengeDifficulty difficulty,
    required int targetDays,
    required String category,
    List<String> tags = const [],
    String? imageUrl,
    List<ChallengeTask> tasks = const [],
    bool isPublic = true,
    String? reward,
  });

  Future<Either<Failure, Challenge>> updateChallenge({
    required String challengeId,
    String? title,
    String? description,
    ChallengeType? type,
    ChallengeDifficulty? difficulty,
    int? targetDays,
    String? category,
    List<String>? tags,
    String? imageUrl,
    List<ChallengeTask>? tasks,
    bool? isPublic,
    String? reward,
  });

  Future<Either<Failure, Unit>> deleteChallenge({required String challengeId});

  Future<Either<Failure, Challenge>> getChallenge({
    required String challengeId,
  });

  Future<Either<Failure, List<Challenge>>> getChallenges({
    int page = 1,
    int limit = 20,
    ChallengeType? type,
    ChallengeDifficulty? difficulty,
    String? category,
    List<String>? tags,
    bool? isPublic,
  });

  Future<Either<Failure, List<Challenge>>> searchChallenges({
    required String query,
    int page = 1,
    int limit = 20,
  });

  Future<Either<Failure, List<Challenge>>> getPopularChallenges({
    int page = 1,
    int limit = 20,
  });

  Future<Either<Failure, List<Challenge>>> getFeaturedChallenges({
    int page = 1,
    int limit = 10,
  });

  Future<Either<Failure, UserChallenge>> joinChallenge({
    required String challengeId,
  });

  Future<Either<Failure, Unit>> leaveChallenge({required String challengeId});

  Future<Either<Failure, UserChallenge>> updateChallengeProgress({
    required String challengeId,
    required int currentDay,
    List<String>? completedTasks,
  });

  Future<Either<Failure, Unit>> markTaskCompleted({
    required String challengeId,
    required String taskId,
  });

  Future<Either<Failure, UserChallenge>> completeChallenge({
    required String challengeId,
  });

  Future<Either<Failure, UserChallenge>> failChallenge({
    required String challengeId,
  });

  Future<Either<Failure, UserChallenge>> pauseChallenge({
    required String challengeId,
  });

  Future<Either<Failure, UserChallenge>> resumeChallenge({
    required String challengeId,
  });

  Future<Either<Failure, List<UserChallenge>>> getUserChallenges({
    String? userId,
    ChallengeStatus? status,
    int page = 1,
    int limit = 20,
  });

  Future<Either<Failure, List<UserChallenge>>> getActiveChallenges();

  Future<Either<Failure, List<UserChallenge>>> getCompletedChallenges({
    int page = 1,
    int limit = 20,
  });

  Future<Either<Failure, Map<String, dynamic>>> getChallengeStats({
    required String challengeId,
  });

  Future<Either<Failure, List<String>>> getChallengeTags();

  Future<Either<Failure, List<String>>> getChallengeCategories();
}

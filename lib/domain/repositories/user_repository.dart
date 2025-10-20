import 'package:dartz/dartz.dart';
import '../entities/user.dart';
import '../../core/error/failures.dart';

abstract class UserRepository {
  Future<Either<Failure, User>> getProfile();

  Future<Either<Failure, User>> updateProfile({
    String? fullName,
    String? bio,
    DateTime? dateOfBirth,
    String? timezone,
  });

  Future<Either<Failure, String>> uploadAvatar({required String filePath});

  Future<Either<Failure, UserPreferences>> getPreferences();

  Future<Either<Failure, UserPreferences>> updatePreferences({
    bool? notificationsEnabled,
    bool? emailNotifications,
    bool? pushNotifications,
    bool? darkMode,
    String? language,
    bool? showProgress,
    bool? showCommunity,
    bool? allowMessages,
  });

  Future<Either<Failure, UserStats>> getStats();

  Future<Either<Failure, UserStats>> updateStats({
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
  });

  Future<Either<Failure, Unit>> deleteAccount();

  Future<Either<Failure, List<User>>> searchUsers({
    required String query,
    int page = 1,
    int limit = 20,
  });

  Future<Either<Failure, User>> getUserById({required String userId});

  Future<Either<Failure, List<User>>> getLeaderboard({
    String period = 'weekly', // weekly, monthly, all-time
    int page = 1,
    int limit = 50,
  });
}

import 'package:dartz/dartz.dart';
import '../entities/user.dart';
import '../../core/error/failures.dart';

abstract class AuthRepository {
  Future<Either<Failure, User>> signIn({
    required String email,
    required String password,
  });

  Future<Either<Failure, User>> signUp({
    required String email,
    required String password,
    required String username,
    String? fullName,
  });

  Future<Either<Failure, Unit>> signOut();

  Future<Either<Failure, User>> getCurrentUser();

  Future<Either<Failure, Unit>> forgotPassword({required String email});

  Future<Either<Failure, Unit>> resetPassword({
    required String token,
    required String newPassword,
  });

  Future<Either<Failure, Unit>> changePassword({
    required String currentPassword,
    required String newPassword,
  });

  Future<Either<Failure, User>> refreshToken();

  Future<Either<Failure, Unit>> verifyEmail({required String token});

  Future<Either<Failure, Unit>> resendVerificationEmail();

  Stream<User?> get authStateChanges;
}

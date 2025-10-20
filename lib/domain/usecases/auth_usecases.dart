import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';
import '../../core/error/failures.dart';

// Base use case class
abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}

class NoParams extends Equatable {
  @override
  List<Object> get props => [];
}

// Auth use cases
class SignIn implements UseCase<User, SignInParams> {
  final AuthRepository repository;

  SignIn(this.repository);

  @override
  Future<Either<Failure, User>> call(SignInParams params) async {
    return await repository.signIn(
      email: params.email,
      password: params.password,
    );
  }
}

class SignInParams extends Equatable {
  final String email;
  final String password;

  const SignInParams({required this.email, required this.password});

  @override
  List<Object> get props => [email, password];
}

class SignUp implements UseCase<User, SignUpParams> {
  final AuthRepository repository;

  SignUp(this.repository);

  @override
  Future<Either<Failure, User>> call(SignUpParams params) async {
    return await repository.signUp(
      email: params.email,
      password: params.password,
      username: params.username,
      fullName: params.fullName,
    );
  }
}

class SignUpParams extends Equatable {
  final String email;
  final String password;
  final String username;
  final String? fullName;

  const SignUpParams({
    required this.email,
    required this.password,
    required this.username,
    this.fullName,
  });

  @override
  List<Object?> get props => [email, password, username, fullName];
}

class SignOut implements UseCase<Unit, NoParams> {
  final AuthRepository repository;

  SignOut(this.repository);

  @override
  Future<Either<Failure, Unit>> call(NoParams params) async {
    return await repository.signOut();
  }
}

class GetCurrentUser implements UseCase<User, NoParams> {
  final AuthRepository repository;

  GetCurrentUser(this.repository);

  @override
  Future<Either<Failure, User>> call(NoParams params) async {
    return await repository.getCurrentUser();
  }
}

class ForgotPassword implements UseCase<Unit, ForgotPasswordParams> {
  final AuthRepository repository;

  ForgotPassword(this.repository);

  @override
  Future<Either<Failure, Unit>> call(ForgotPasswordParams params) async {
    return await repository.forgotPassword(email: params.email);
  }
}

class ForgotPasswordParams extends Equatable {
  final String email;

  const ForgotPasswordParams({required this.email});

  @override
  List<Object> get props => [email];
}

class ResetPassword implements UseCase<Unit, ResetPasswordParams> {
  final AuthRepository repository;

  ResetPassword(this.repository);

  @override
  Future<Either<Failure, Unit>> call(ResetPasswordParams params) async {
    return await repository.resetPassword(
      token: params.token,
      newPassword: params.newPassword,
    );
  }
}

class ResetPasswordParams extends Equatable {
  final String token;
  final String newPassword;

  const ResetPasswordParams({required this.token, required this.newPassword});

  @override
  List<Object> get props => [token, newPassword];
}

class ChangePassword implements UseCase<Unit, ChangePasswordParams> {
  final AuthRepository repository;

  ChangePassword(this.repository);

  @override
  Future<Either<Failure, Unit>> call(ChangePasswordParams params) async {
    return await repository.changePassword(
      currentPassword: params.currentPassword,
      newPassword: params.newPassword,
    );
  }
}

class ChangePasswordParams extends Equatable {
  final String currentPassword;
  final String newPassword;

  const ChangePasswordParams({
    required this.currentPassword,
    required this.newPassword,
  });

  @override
  List<Object> get props => [currentPassword, newPassword];
}

class RefreshToken implements UseCase<User, NoParams> {
  final AuthRepository repository;

  RefreshToken(this.repository);

  @override
  Future<Either<Failure, User>> call(NoParams params) async {
    return await repository.refreshToken();
  }
}

class VerifyEmail implements UseCase<Unit, VerifyEmailParams> {
  final AuthRepository repository;

  VerifyEmail(this.repository);

  @override
  Future<Either<Failure, Unit>> call(VerifyEmailParams params) async {
    return await repository.verifyEmail(token: params.token);
  }
}

class VerifyEmailParams extends Equatable {
  final String token;

  const VerifyEmailParams({required this.token});

  @override
  List<Object> get props => [token];
}

class ResendVerificationEmail implements UseCase<Unit, NoParams> {
  final AuthRepository repository;

  ResendVerificationEmail(this.repository);

  @override
  Future<Either<Failure, Unit>> call(NoParams params) async {
    return await repository.resendVerificationEmail();
  }
}

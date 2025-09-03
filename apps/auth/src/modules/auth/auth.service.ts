import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import servicesOptions from 'libs/contract/config/services-options';
import { servicesPattern } from 'libs/contract/config/services-pattern';
import * as bcrypt from 'bcrypt';
import { $Enums, User } from 'libs/contract/prisma/generated/client';
import { UserI } from 'libs/contract/interfaces/user.interface';
import { AuthPayloadDto } from 'libs/contract/dtos/dto/auth-payload.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'libs/contract/dtos/users/create-user.dto';
import UserStatus = $Enums.UserStatus;
import { AccountActivationMailTDto } from 'libs/contract/payloads/mail-templates/account-activation.payload';
import { first, firstValueFrom } from 'rxjs';
import JwtPayloadI from '../../../../../libs/contract/interfaces/jwt-paylaod.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(servicesOptions['users'][0].name) private usersClient: ClientProxy,
    @Inject(servicesOptions['mail'][0].name) private mailClient: ClientProxy,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser({
    email,
    password,
  }: AuthPayloadDto): Promise<UserI | null> {
    const user = await firstValueFrom(
      this.usersClient.send<User | null>(
        servicesPattern['users'].find_by_email,
        { email },
      ),
    );

    // Check if the user exist and correct password
    if (
      !user ||
      !user.password ||
      !user.status ||
      user.status != UserStatus.ACTIVE
    ) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  login(user: UserI): { accessToken: string; refreshToken: string } {
    const payload = {
      email: user.email,
      id: user.id,
      // role: user.role,
      status: user.status,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  // Create pending account of the use
  async signUp(createUserDto: CreateUserDto): Promise<{
    message: string;
    status: HttpStatus;
    userId?: string;
  }> {
    try {
      // Create the user with proper async handling
      const user = await firstValueFrom(
        this.usersClient.send(servicesPattern.users.create, createUserDto),
      );

      // Validate user creation response
      if (!user || !user.id) {
        this.logger.error('User creation failed: Invalid user response');
        return {
          message: 'Failed to create user account',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }

      // Generate activation link
      const userActivationUrl = this.generateUserActivationLink({
        id: user.id,
        status: user.status,
      });

      this.logger.debug(userActivationUrl);

      // Prepare mail data with validation
      const mailData = new AccountActivationMailTDto({
        userEmail: createUserDto.email,
        userName: createUserDto.name,
        loginUrl: `${this.configService.get('FRONTEND_URL')}/login`,
        activationUrl: userActivationUrl,
        resendUrl: `${this.configService.get('API_URL')}/auth/resend-activation`,
        supportEmail: this.configService.get('SUPPORT_EMAIL') ?? '',
      });

      // Send activation email (fire-and-forget with error logging)
      this.mailClient.emit(servicesPattern.mail.activate, mailData);

      this.logger.log(`User created successfully with ID: ${user.id}`);

      return {
        message:
          'Account created successfully. Please check your email to activate your account.',
        status: HttpStatus.CREATED,
        userId: user.id,
      };
    } catch (error) {
      throw error;
    }
  }

  // Activate pended User
  async activateUser(activationToken: string): Promise<{
    message: string;
    status: HttpStatus;
    userId?: string;
  }> {
    try {
      // Validate token format
      if (
        !activationToken ||
        typeof activationToken !== 'string' ||
        activationToken.trim() === ''
      ) {
        return {
          message: 'Invalid activation token provided',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      // Verify and decode the activation token
      const tokenPayload = this.checkActivateToken(activationToken.trim());

      // Activate the user account
      const user = await firstValueFrom(
        this.usersClient.send<User>(servicesPattern.users.activate_pending, {
          userId: tokenPayload.id,
        }),
      );

      // Validate activation response
      if (!user) {
        this.logger.error(`User activation failed for ID: ${tokenPayload.id}`);
        return {
          message: 'Failed to activate account',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }

      this.logger.log(
        `User activated successfully with ID: ${tokenPayload.id}`,
      );

      // Optional: Send welcome email
      try {
        this.mailClient.emit(servicesPattern.mail.welcome, {
          to: user.email,
          name: user.name,
        });
      } catch (mailError) {
        // Log mail error but don't fail the activation
        this.logger.warn('Failed to send welcome email', {
          error: mailError.message,
          userId: tokenPayload.id,
        });
      }

      return {
        message: 'Account activated successfully. You can now log in.',
        status: HttpStatus.OK,
        userId: tokenPayload.id,
      };
    } catch (error) {
      // Enhanced error logging
      this.logger.error('Error during user activation', {
        error: error.message,
        stack: error.stack,
        token: activationToken
          ? activationToken.substring(0, 10) + '...'
          : 'undefined',
        timestamp: new Date().toISOString(),
      });

      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        return {
          message: 'Activation link has expired. Please request a new one.',
          status: HttpStatus.GONE,
        };
      }

      if (error.name === 'JsonWebTokenError') {
        return {
          message: 'Invalid activation token',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      // Handle user service errors
      if (error.code === 'USER_NOT_FOUND') {
        return {
          message: 'User account not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      if (error.code === 'USER_ALREADY_ACTIVE') {
        return {
          message: 'Account is already activated',
          status: HttpStatus.CONFLICT,
        };
      }

      // Generic error response
      return {
        message:
          'Unable to activate account. Please try again or contact support.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Get the profile of the currently authenticated user
  async getMe(userJwtPayload: JwtPayloadI) {
    // Check if the user defined
    if (!userJwtPayload || !userJwtPayload.id)
      throw new UnauthorizedException(
        'Authentication required: User information missing or invalid',
      );

    try {
      const userProfile = await firstValueFrom(
        this.usersClient.send(servicesPattern.users.find_one, {
          userId: userJwtPayload.id,
        }),
      );

      return userProfile;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * Refresh both the access and refresh tokens
   * @param userId User ID to refresh tokens for
   * @returns New access and refresh tokens
   */
  async refreshTokens(userId: string) {
    try {
      const user = await firstValueFrom(
        this.usersClient.send<User>(servicesPattern.users.find_one, {
          userId: userId,
        }),
      );
      if (!user || !user.status)
        throw new UnauthorizedException(
          'User account is not active. Cannot refresh tokens.',
        );

      // Check if the user active
      this.checkUserStatusActive(user);

      // Return the refreshed tokens
      return this.login(user);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  // Check the availability of JWT token
  private checkActivateToken(token: string): {
    id: string;
    status: UserStatus;
    iat?: number;
    exp?: number;
  } {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');

      if (!secret) {
        throw new Error('JWT_SECRET configuration is missing');
      }

      const payload = this.jwtService.verify(token, {
        secret,
      });

      // Validate payload structure
      if (!payload || typeof payload !== 'object' || !payload.id) {
        throw new Error('Invalid token payload structure');
      }

      return payload as {
        id: string;
        status: UserStatus;
        iat?: number;
        exp?: number;
      };
    } catch (error) {
      this.logger.error('Token verification failed', {
        error: error.message,
        tokenPreview: token ? token.substring(0, 10) + '...' : 'undefined',
      });

      // Re-throw with original error for proper error handling upstream
      throw error;
    }
  }

  // Optional: Method to resend activation email
  private async resendActivationEmail(email: string): Promise<{
    message: string;
    status: HttpStatus;
  }> {
    try {
      // Find user by email
      const user = await firstValueFrom(
        this.usersClient.send(servicesPattern.users.find_by_email, { email }),
      );
      if (!user) {
        return {
          message: 'User not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      if (user.status === UserStatus.ACTIVE) {
        return {
          message: 'Account is already activated',
          status: HttpStatus.CONFLICT,
        };
      } else if (user.status === UserStatus.PENDING) {
        // Generate new activation link
        const userActivationUrl = this.generateUserActivationLink({
          id: user.id,
          status: user.status,
        });

        // Send new activation email
        const mailData = new AccountActivationMailTDto({
          userEmail: user.email,
          userName: user.name,
          loginUrl: `${this.configService.get('FRONTEND_URL')}/login`,
          activationUrl: userActivationUrl,
          resendUrl: `${this.configService.get('API_URL')}/auth/resend-activation`,
          supportEmail: this.configService.get('SUPPORT_EMAIL') ?? '',
        });

        this.mailClient.emit(servicesPattern.mail.activate, mailData);

        return {
          message: 'New activation email sent. Please check your inbox.',
          status: HttpStatus.OK,
        };
      } else {
        return {
          message: 'The user is paned.',
          status: HttpStatus.FORBIDDEN,
        };
      }
    } catch (error) {
      this.logger.error('Error resending activation email', {
        error: error.message,
        email,
      });

      return {
        message: 'Unable to resend activation email. Please try again later.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Generate an access token for the user
   * @param payload User payload for the token
   * @returns Access token string
   */
  private generateAccessToken(payload: JwtPayloadI): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });
  }

  private generateUserActivationLink(payload: {
    id: string;
    status: UserStatus;
  }): string {
    try {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACTIVATION_EXPIRES_IN'), // Fixed typo
      });

      const baseUrl = this.configService.get('API_URL');
      if (!baseUrl) {
        throw new Error('API_URL configuration is missing');
      }

      return `${baseUrl}/auth/activate/${token}`;
    } catch (error) {
      this.logger.error('Failed to generate activation link', {
        error: error.message,
        userId: payload.id,
      });
      throw new Error('Failed to generate activation link');
    }
  }

  /**
   * Generate a refresh token for the user
   * @param payload User payload for the token
   * @returns Refresh token string
   */
  private generateRefreshToken(payload: {
    email: string;
    id: string;
    // role: string;
    status: UserStatus;
  }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: 'JWT_REFRESH_EXPIRES_IN', // Long-lived refresh token
    });
  }

  private checkUserStatusActive(user: UserI) {
    if (user.status !== UserStatus.ACTIVE) throw new ForbiddenException();
  }
}

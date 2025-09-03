import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserStatus } from '../../../../libs/contract/enums/user.enum';
import JwtPayloadI from '../../../../libs/contract/interfaces/jwt-paylaod.interface';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  private readonly logger = new Logger('RefreshTokenGuard');

  handleRequest<TUser = JwtPayloadI>(
    err: any,
    user: JwtPayloadI,
    info: any,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid refresh token');
    }

    if (user.status !== UserStatus.ACTIVE) {
      // Get the request object

      // Log security event for audit trail
      this.logger.debug(
        `Refresh denied: User ID ${user.id} with inactive status (${user.status}) attempted to refresh tokens.`,
      );

      throw new UnauthorizedException(
        'User account is not active. Refresh token has been invalidated.',
      );
    }

    return user as TUser;
  }
}

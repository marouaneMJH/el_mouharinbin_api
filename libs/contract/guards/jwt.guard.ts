import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import JwtPayloadI from '../interfaces/jwt-paylaod.interface';
import { UserStatus } from '../enums/user.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('hello');
    return super.canActivate(context);
  }

  handleRequest<TUser = JwtPayloadI>(
    err: any,
    user: JwtPayloadI,
    info: any,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }

    if (user.status !== UserStatus.ACTIVE) {
      // Get the request object
      const request = context.switchToHttp().getRequest<Request>();

      // Log security event for audit trail
      console.log(
        `Access denied: User ID ${user.id} with inactive status (${user.status}) attempted to access the application.`,
      );

      throw new UnauthorizedException(
        'User account is not active. Token has been invalidated.',
      );
    }

    return user as TUser;
  }
}

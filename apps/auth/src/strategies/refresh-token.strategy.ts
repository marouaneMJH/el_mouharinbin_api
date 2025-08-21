import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '../../../../libs/contract/enums/user.enum';
import { UserI } from '../../../../libs/contract/interfaces/user.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');

    if (!refreshSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables',
      );
    }

    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        // First check the request body
        (req: Request) => {
          if (req.body && req.body.refreshToken) {
            return req.body.refreshToken as string;
          }
          // Then check cookies
          if (req.cookies && req.cookies.refreshToken) {
            return req.cookies.refreshToken as string;
          }
          return null;
        },
      ]),
      secretOrKey: refreshSecret,
      passReqToCallback: true,
    };
    super(options);
  }

  validate(
    refreshToken: string,
    payload: { id: string; email: string; role: string; status: UserStatus },
  ): Pick<UserI, "id" | "status" | "email" > | {refreshToken: string } {
    // Check if user is active before processing the refresh token
    if (payload.status !== UserStatus.ACTIVE) {
      throw new Error('User account is not active. Cannot refresh tokens.');
    }

    return {
      id: payload.id,
      email: payload.email,
      // todo: add the role into user schema
      // role: payload.role,
      status: payload.status, // Use the status from the token
      refreshToken,
    } ;
  }
}

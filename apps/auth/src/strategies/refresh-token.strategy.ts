import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import JwtPayloadI from '../../../../libs/contract/interfaces/jwt-paylaod.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: any) => {
        // Exemple: client.send('refresh_token', { refreshToken: 'xxx' })
        if (req?.refreshToken) {
          return req.refreshToken;
        }
        return null;
      },
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(payload: JwtPayloadI): Promise<JwtPayloadI> {
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      status: payload.status,
    };
  }
}

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../modules/auth/auth.service';
import { UserI } from 'libs/contract/interfaces/user.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly logger: Logger = new Logger(this.constructor.name);
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // This tells passport that we're using email instead of username
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<UserI> {
    const user = await this.authService.validateUser({ email, password });
    this.logger.debug(`User after validation: ${JSON.stringify(user)}`);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

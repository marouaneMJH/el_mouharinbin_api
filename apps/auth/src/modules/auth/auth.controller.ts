import { Controller, Logger, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from 'libs/contract/dtos/dto/auth-payload.dto';
import { LocalGuard } from '../../guards/local.guard';
import { UserI } from 'libs/contract/interfaces/user.interface';
import { servicesPattern } from 'libs/contract/config/services-pattern';
import { JwtAuthGuard } from '../../../../../libs/contract/guards/jwt.guard';
import { CreateUserDto } from '../../../../../libs/contract/dtos/users/create-user.dto';
import JwtPayloadI from '../../../../../libs/contract/interfaces/jwt-paylaod.interface';
import { RefreshTokenStrategy } from '../../strategies/refresh-token.strategy';
import { RefreshTokenGuard } from '../../guards/refresh.guard';

@Controller()
export class AuthController {
  private readonly logger: Logger = new Logger(this.constructor.name);
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(servicesPattern.auth.login)
  @UseGuards(LocalGuard)
  login(@Payload() user: UserI) {
    this.logger.debug(`User inside login ${JSON.stringify(user)}`);
    return this.authService.login(user);
  }

  @MessagePattern(servicesPattern.auth.create)
  signUp(@Payload() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @MessagePattern(servicesPattern.auth.activate)
  activateAccount(@Payload() activationToken: string) {
    return this.authService.activateUser(activationToken);
  }

  @MessagePattern(servicesPattern.auth.me)
  me(@Payload() userPayload: JwtPayloadI) {
    return this.authService.getMe(userPayload);
  }

  @MessagePattern(servicesPattern.auth.refresh)
  @UseGuards(RefreshTokenGuard)
  refreshTokens(@Payload() user: JwtPayloadI) {
    return this.authService.refreshTokens(user.id);
  }

  // @Post('logout')
  // logout(@Res({ passthrough: true }) res: Response) {
  //   res.clearCookie('token');
  //   return { message: 'Logged out successfully' };
  // }
}

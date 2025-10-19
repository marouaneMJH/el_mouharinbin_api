import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'libs/contract/dtos/users/create-user.dto';
import { AuthPayloadDto } from 'libs/contract/dtos/dto/auth-payload.dto';

@Controller('auth')
export class AuthController {
  private readonly logger: Logger = new Logger(this.constructor.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginPayload: AuthPayloadDto) {
    this.logger.debug(`request: ${loginPayload.email}`);

    return await this.authService.login(loginPayload);
  }

  @Post('sign-up')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Get('activate/:token')
  async activateAccount(@Param('token') token: string) {
    return await this.authService.activateAccount(token);
  }
}

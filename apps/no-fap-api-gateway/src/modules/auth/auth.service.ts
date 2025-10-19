import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import servicesOptions from 'libs/contract/config/services-options';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginPayloadI } from 'libs/contract/interfaces/login-payload.interface';
import { servicesPattern } from 'libs/contract/config/services-pattern';
import { CreateUserDto } from '../../../../../libs/contract/dtos/users/create-user.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(this.constructor.name);
  constructor(
    @Inject(servicesOptions['auth'][0].name) private authClient: ClientProxy,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginPayload: LoginPayloadI) {
    this.logger.debug(loginPayload.email);
    try {
      return await firstValueFrom(
        this.authClient.send(servicesPattern.auth.login, {
          ...loginPayload,
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  signUp(createUserDto: CreateUserDto) {
    try {
      return this.authClient.send(servicesPattern.auth.create, createUserDto);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async activateAccount(activationToken: string) {
    return await firstValueFrom(
      this.authClient.send(servicesPattern.auth.activate, activationToken),
    );
  }
}

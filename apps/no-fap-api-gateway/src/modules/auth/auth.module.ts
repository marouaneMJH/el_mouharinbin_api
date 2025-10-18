import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import servicesOptions from '../../../../../libs/contract/config/services-options';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ClientsModule.register(servicesOptions['auth'])],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}

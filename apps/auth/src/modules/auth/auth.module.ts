import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import servicesOptions from 'libs/contract/config/services-options';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from '../../strategies/local.strategy';
import { RefreshTokenStrategy } from '../../strategies/refresh-token.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'libs/contract/strategies/jwt.strategy';

@Module({
  imports: [
    ClientsModule.register(servicesOptions['users']),
    ClientsModule.register(servicesOptions['mail']),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), 'apps/auth/.env'), '.env.shared'],
      cache: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule, PassportModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
})
export class AuthModule {}

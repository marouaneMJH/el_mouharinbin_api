import { Module } from '@nestjs/common';
import { NoFapApiGatewayController } from './no-fap-api-gateway.controller';
import { NoFapApiGatewayService } from './no-fap-api-gateway.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtStrategy } from '../../../libs/contract/strategies/jwt.strategy';
import { AppConfigModule } from '../../../libs/contract/config/config.module';
import configuration from '../../../libs/contract/config/configuration';

console.log(__dirname);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.shared',join(__dirname, '.env') ],
      // load: [configuration],
      isGlobal: true,
    }),
    MailModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [NoFapApiGatewayController],
  providers: [NoFapApiGatewayService, JwtStrategy],
})
export class NoFapApiGatewayModule {}

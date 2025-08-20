import { Module } from '@nestjs/common';
import { NoFapApiGatewayController } from './no-fap-api-gateway.controller';
import { NoFapApiGatewayService } from './no-fap-api-gateway.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

console.log(__dirname);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '.env'),
      isGlobal: true,
    }),
    MailModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [NoFapApiGatewayController],
  providers: [NoFapApiGatewayService],
})
export class NoFapApiGatewayModule {}

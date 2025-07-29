import { Module } from '@nestjs/common';
import { NoFapApiGatewayController } from './no-fap-api-gateway.controller';
import { NoFapApiGatewayService } from './no-fap-api-gateway.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { MailModule } from './mail/mail.module';

console.log(__dirname);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '.env'),
      isGlobal: true,
    }),
    MailModule,
  ],
  controllers: [NoFapApiGatewayController],
  providers: [NoFapApiGatewayService],
})
export class NoFapApiGatewayModule {}

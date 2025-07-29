import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
// import { ClientsModule, Transport } from '@nestjs/microservices';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/mail/.env',
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}

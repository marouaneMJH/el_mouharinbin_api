import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import servicesOptions from 'libs/contract/config/services-options';

@Module({
  imports: [ClientsModule.register(servicesOptions['mail'])],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}

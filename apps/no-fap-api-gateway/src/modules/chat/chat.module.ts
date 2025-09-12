import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ClientsModule } from '@nestjs/microservices';
import servicesOptions from '../../../../../libs/contract/config/services-options';

@Module({
  imports: [ClientsModule.register(servicesOptions['chat'])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}

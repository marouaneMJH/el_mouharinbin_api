import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ClientsModule } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import servicesOptions from '../../../../../libs/contract/config/services-options';

@Module({
  imports: [
    ClientsModule.register(servicesOptions['chat']),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}

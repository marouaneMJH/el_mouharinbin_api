import { Module } from '@nestjs/common';
// import { ChatController } from './chat.controller';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [ChatModule],
  // controllers: [ChatController],
  // providers: [ChatService],
})
export class AppChatModule {}

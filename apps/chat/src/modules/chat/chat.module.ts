import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import loadConfigModule from '../../../../../libs/contract/utils/load-config-module.util';

@Module({
  imports: [loadConfigModule('apps/chat/.env'), ChatModule],

  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

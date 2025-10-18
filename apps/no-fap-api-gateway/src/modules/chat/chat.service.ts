import { Inject, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import servicesOptions from '../../../../../libs/contract/config/services-options';
import { ClientProxy } from '@nestjs/microservices';
import { servicesPattern } from '../../../../../libs/contract/config/services-pattern';

@Injectable()
export class ChatService {
  constructor(
    @Inject(servicesOptions['chat'][0].name) private chatClient: ClientProxy,
  ) {}

  async createSession({
    userId,
    username,
  }: {
    userId: string;
    username: string;
  }) {
    return this.chatClient.send(servicesPattern.chat.create, {
      userId,
      username,
    });
  }

  async removeSession(userId: string) {
    return this.chatClient.send(servicesPattern.chat.delete, { userId });
  }
}

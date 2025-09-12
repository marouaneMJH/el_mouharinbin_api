import { Inject, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import servicesOptions from '../../../../../libs/contract/config/services-options';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ChatService {
  constructor(
    @Inject(servicesOptions['chat'][0].name) private chatClient: ClientProxy,
  ) {}

  test() {
    console.log('test');
    return 'hello';
  }
}

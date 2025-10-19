import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import {
  SendMessageDto,
  MessageResponseDto,
  GetMessagesDto,
  GetMessagesWithUserDto,
  PaginatedMessagesDto,
  DeleteMessageDto,
} from '../../../../../libs/contract/dtos/chat';
import { CHAT_MESSAGE_PATTERNS } from '../../../../../libs/contract/interfaces/chat/chat-events.interface';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Handler pour envoyer un message
   * Écoute le pattern 'chat.message.send' via RabbitMQ
   */
  @MessagePattern(CHAT_MESSAGE_PATTERNS.SEND_MESSAGE)
  async sendMessage(
    @Payload() sendMessageDto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    return await this.chatService.sendMessage(sendMessageDto);
  }

  /**
   * Handler pour récupérer l'historique des messages
   * Écoute le pattern 'chat.message.get' via RabbitMQ
   */
  @MessagePattern(CHAT_MESSAGE_PATTERNS.GET_MESSAGES)
  async getMessages(
    @Payload() getMessagesDto: GetMessagesWithUserDto,
  ): Promise<PaginatedMessagesDto> {
    return await this.chatService.getMessages(
      getMessagesDto,
      getMessagesDto.requesterId,
    );
  }

  /**
   * Handler pour supprimer un message
   * Écoute le pattern 'chat.message.delete' via RabbitMQ
   */
  @MessagePattern(CHAT_MESSAGE_PATTERNS.DELETE_MESSAGE)
  async deleteMessage(
    @Payload() deleteMessageDto: DeleteMessageDto,
  ): Promise<MessageResponseDto> {
    return await this.chatService.deleteMessage(deleteMessageDto);
  }
}

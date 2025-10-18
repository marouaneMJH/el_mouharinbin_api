import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import JwtPayloadI from '../../../../../libs/contract/interfaces/jwt-paylaod.interface';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    // Get token from handshake query or headers
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.query?.token ||
      client.handshake?.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      client.disconnect(true);
      return;
    }
    try {
      const payload = this.jwtService.verify<JwtPayloadI>(token);
      if (!payload || !payload.id || !payload.email) {
        client.disconnect(true);
        return;
      }
      // Attach user info to socket
      client.data.user = { id: payload.id, username: payload.email };
      // Create user session in DB
      await this.chatService.createSession({
        userId: payload.id,
        username: payload.email,
      });
      // Optionally, set up token expiry auto-disconnect
      const exp = (payload as any).exp;
      if (exp) {
        const msUntilExpiry = exp * 1000 - Date.now();
        if (msUntilExpiry > 0) {
          setTimeout(() => client.disconnect(true), msUntilExpiry);
        } else {
          client.disconnect(true);
        }
      }
    } catch (e) {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    // Remove session from DB
    if (client.data?.user?.id) {
      await this.chatService.removeSession(client.data.user.id);
    }
  }

  // @SubscribeMessage('test')
  // test(client: Socket, data: string) {
  //   return this.chatService.test();
  // }

  // @SubscribeMessage('findAllChat')
  // findAll() {
  //   return this.chatService.findAll();
  // }
  //
  // @SubscribeMessage('findOneChat')
  // findOne(@MessageBody() id: number) {
  //   return this.chatService.findOne(id);
  // }
  //
  // @SubscribeMessage('updateChat')
  // update(@MessageBody() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(updateChatDto.id, updateChatDto);
  // }
  //
  // @SubscribeMessage('removeChat')
  // remove(@MessageBody() id: number) {
  //   return this.chatService.remove(id);
  // }
}

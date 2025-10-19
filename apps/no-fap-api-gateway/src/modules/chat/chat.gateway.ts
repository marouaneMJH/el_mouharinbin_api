import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import JwtPayloadI from '../../../../../libs/contract/interfaces/jwt-paylaod.interface';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    @Inject('CHAT_EVENT_CLIENT') private readonly eventClient: ClientProxy,
  ) {}

  /**
   * Initialize module and setup RabbitMQ event listeners
   */
  async onModuleInit() {
    this.logger.log('WebSocket Gateway initialized');

    // Setup RabbitMQ event listeners for broadcasting
    this.setupEventListeners();
  }

  /**
   * Setup RabbitMQ event listeners to broadcast to WebSocket clients
   */
  private setupEventListeners() {
    this.logger.log(
      'Setting up RabbitMQ event listeners for WebSocket broadcasting',
    );

    // Note: In a real implementation, you would use a dedicated event consumer
    // For now, we'll provide the structure for broadcasting events
    // The actual event listening would be implemented in a separate service
  }

  /**
   * Broadcast event to all clients in a specific community room
   * @param communityId The community ID to broadcast to
   * @param eventName The event name to emit
   * @param data The data to broadcast
   */
  private broadcastToRoom(communityId: string, eventName: string, data: any) {
    const roomName = `community:${communityId}`;
    this.server.to(roomName).emit(eventName, data);
  }

  /**
   * Handle new WebSocket connections with JWT authentication
   */

  /**
   * Handle new WebSocket connections with JWT authentication
   */
  async handleConnection(client: Socket) {
    const clientIp = client.handshake.address;
    const userAgent = client.handshake.headers['user-agent'];

    this.logger.log(`New WebSocket connection attempt from ${clientIp}`);

    try {
      // Get token from multiple possible sources
      const token =
        client.handshake?.auth?.token ||
        client.handshake?.query?.token ||
        client.handshake?.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(
          `Connection rejected: No authentication token provided from ${clientIp}`,
        );
        client.emit('error', { message: 'Authentication required' });
        client.disconnect(true);
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify<JwtPayloadI>(token);
      if (!payload || !payload.id || !payload.email) {
        this.logger.warn(`Connection rejected: Invalid token from ${clientIp}`);
        client.emit('error', { message: 'Invalid authentication token' });
        client.disconnect(true);
        return;
      }

      // Check token expiration
      const exp = (payload as any).exp;
      if (exp && exp * 1000 <= Date.now()) {
        this.logger.warn(
          `Connection rejected: Expired token for user ${payload.email}`,
        );
        client.emit('error', { message: 'Token expired' });
        client.disconnect(true);
        return;
      }

      // Enhance user data with email
      const userData = {
        id: payload.id,
        username: payload.email.split('@')[0], // Use email prefix as username
        email: payload.email,
      };

      // Attach user info to socket
      (client as AuthenticatedSocket).data.user = userData;

      // Track connected client
      this.connectedClients.set(client.id, client as AuthenticatedSocket);

      // Create user session in chat service
      await this.chatService.createSession({
        userId: payload.id,
        username: userData.username,
        socketId: client.id,
      });

      // Setup token expiry auto-disconnect if needed
      if (exp) {
        const msUntilExpiry = exp * 1000 - Date.now();
        if (msUntilExpiry > 0) {
          setTimeout(() => {
            this.logger.debug(
              `Auto-disconnecting user ${userData.email} due to token expiry`,
            );
            client.emit('token:expired', { message: 'Session expired' });
            client.disconnect(true);
          }, msUntilExpiry);
        }
      }

      // Send successful connection event
      client.emit('connected', {
        user: userData,
        connectedAt: new Date().toISOString(),
        clientId: client.id,
      });

      this.logger.log(
        `User ${userData.email} (ID: ${userData.id}) successfully connected. ` +
          `Socket ID: ${client.id}, IP: ${clientIp}, Total connections: ${this.connectedClients.size}`,
      );
    } catch (error) {
      this.logger.error(
        `Connection error from ${clientIp}: ${error.message}`,
        error.stack,
      );
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  /**
   * Handle WebSocket disconnections
   */
  async handleDisconnect(client: Socket) {
    const authClient = client as AuthenticatedSocket;
    const userData = authClient.data?.user;

    try {
      // Remove from connected clients tracking
      this.connectedClients.delete(client.id);

      // Remove session from chat service
      if (userData?.id) {
        await this.chatService.removeSession(userData.id);

        this.logger.log(
          `User ${userData.email} (ID: ${userData.id}) disconnected. ` +
            `Socket ID: ${client.id}, Remaining connections: ${this.connectedClients.size}`,
        );
      } else {
        this.logger.log(
          `Unauthenticated client disconnected. Socket ID: ${client.id}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error handling disconnect for socket ${client.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle client joining a community room
   */
  @SubscribeMessage('join-community')
  async handleJoinCommunity(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { communityId: string },
  ) {
    const userData = client.data?.user;

    if (!userData) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    if (!payload?.communityId) {
      client.emit('error', { message: 'Community ID is required' });
      return;
    }

    try {
      // For now, we'll trust that the client has valid access
      // In a production system, this should validate community membership
      // through the community service

      // Join the Socket.IO room
      const roomName = `community:${payload.communityId}`;
      await client.join(roomName);

      // Send confirmation to client
      client.emit('joined-community', {
        communityId: payload.communityId,
        roomName,
        joinedAt: new Date().toISOString(),
      });

      // Notify room about new user
      client.to(roomName).emit('user:joined', {
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
        },
        communityId: payload.communityId,
        joinedAt: new Date().toISOString(),
      });

      this.logger.log(
        `User ${userData.email} joined community ${payload.communityId} room. ` +
          `Socket ID: ${client.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error joining community ${payload.communityId} for user ${userData.email}: ${error.message}`,
        error.stack,
      );
      client.emit('error', { message: 'Failed to join community' });
    }
  }

  /**
   * Handle client leaving a community room
   */
  @SubscribeMessage('leave-community')
  async handleLeaveCommunity(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { communityId: string },
  ) {
    const userData = client.data?.user;

    if (!userData) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    if (!payload?.communityId) {
      client.emit('error', { message: 'Community ID is required' });
      return;
    }

    try {
      const roomName = `community:${payload.communityId}`;

      // Notify room about user leaving before actually leaving
      client.to(roomName).emit('user:left', {
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
        },
        communityId: payload.communityId,
        leftAt: new Date().toISOString(),
      });

      // Leave the Socket.IO room
      await client.leave(roomName);

      // Send confirmation to client
      client.emit('left-community', {
        communityId: payload.communityId,
        roomName,
        leftAt: new Date().toISOString(),
      });

      this.logger.log(
        `User ${userData.email} left community ${payload.communityId} room. ` +
          `Socket ID: ${client.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error leaving community ${payload.communityId} for user ${userData.email}: ${error.message}`,
        error.stack,
      );
      client.emit('error', { message: 'Failed to leave community' });
    }
  }

  /**
   * Handle message created events from RabbitMQ and broadcast to WebSocket clients
   */
  @EventPattern('chat.message.created')
  async handleMessageCreated(data: {
    messageId: string;
    content: string;
    authorId: string;
    authorUsername: string;
    communityId: string;
    createdAt: string;
    messageType: string;
  }) {
    try {
      const roomName = `community:${data.communityId}`;

      // Broadcast message to all clients in the community room
      this.server.to(roomName).emit('message:created', {
        id: data.messageId,
        content: data.content,
        author: {
          id: data.authorId,
          username: data.authorUsername,
        },
        communityId: data.communityId,
        messageType: data.messageType,
        createdAt: data.createdAt,
      });

      this.logger.debug(
        `Broadcasting message created event to room ${roomName}. ` +
          `Message ID: ${data.messageId}, Author: ${data.authorUsername}`,
      );
    } catch (error) {
      this.logger.error(
        `Error broadcasting message created event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle message deleted events from RabbitMQ and broadcast to WebSocket clients
   */
  @EventPattern('chat.message.deleted')
  async handleMessageDeleted(data: {
    messageId: string;
    communityId: string;
    deletedBy: string;
    deletedAt: string;
  }) {
    try {
      const roomName = `community:${data.communityId}`;

      // Broadcast message deletion to all clients in the community room
      this.server.to(roomName).emit('message:deleted', {
        messageId: data.messageId,
        communityId: data.communityId,
        deletedBy: data.deletedBy,
        deletedAt: data.deletedAt,
      });

      this.logger.debug(
        `Broadcasting message deleted event to room ${roomName}. ` +
          `Message ID: ${data.messageId}, Deleted by: ${data.deletedBy}`,
      );
    } catch (error) {
      this.logger.error(
        `Error broadcasting message deleted event: ${error.message}`,
        error.stack,
      );
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

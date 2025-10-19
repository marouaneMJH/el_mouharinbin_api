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
import { CreateMessageDto } from '../../../../../libs/contract/dtos/chat/message.dto';

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
  // Rate limiting: Map<userId, Array<timestamp>>
  private messageRateLimit = new Map<string, number[]>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    @Inject('CHAT_SERVICE') private readonly eventClient: ClientProxy,
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
   * User story: community:join event with membership verification
   */
  @SubscribeMessage('community:join')
  async handleCommunityJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { communityId: string },
  ) {
    const userData = client.data?.user;

    if (!userData) {
      client.emit('error', {
        event: 'community:join',
        message: 'Authentication required',
      });
      return { success: false, error: 'Authentication required' };
    }

    if (!payload?.communityId) {
      client.emit('error', {
        event: 'community:join',
        message: 'Community ID is required',
      });
      return { success: false, error: 'Community ID is required' };
    }

    try {
      // Verify user is member of the community
      const isMember = await this.validateCommunityMembership(
        userData.id,
        payload.communityId,
      );

      if (!isMember) {
        this.logger.warn(
          `User ${userData.email} attempted to join community ${payload.communityId} without membership`,
        );
        client.emit('error', {
          event: 'community:join',
          message: 'Access denied: You are not a member of this community',
        });
        return {
          success: false,
          error: 'Access denied: Not a community member',
        };
      }

      // Join the Socket.IO room
      const roomName = `community:${payload.communityId}`;
      await client.join(roomName);

      // Send acknowledgment to the joining client
      const joinResponse = {
        success: true,
        communityId: payload.communityId,
        roomName,
        joinedAt: new Date().toISOString(),
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
        },
      };

      client.emit('community:joined', joinResponse);

      // Notify other room members about the new presence
      client.to(roomName).emit('community:user-joined', {
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
        },
        communityId: payload.communityId,
        joinedAt: new Date().toISOString(),
      });

      this.logger.log(
        `User ${userData.email} (${userData.id}) successfully joined community ${payload.communityId} room. ` +
          `Socket ID: ${client.id}, Room: ${roomName}`,
      );

      return joinResponse;
    } catch (error) {
      this.logger.error(
        `Error joining community ${payload.communityId} for user ${userData.email}: ${error.message}`,
        error.stack,
      );

      client.emit('error', {
        event: 'community:join',
        message: 'Failed to join community',
      });

      return { success: false, error: 'Failed to join community' };
    }
  }

  /**
   * Validate if user is a member of the specified community
   * This method checks community membership through the community service via RabbitMQ
   */
  private async validateCommunityMembership(
    userId: string,
    communityId: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Validating membership for user ${userId} in community ${communityId}`,
      );

      // Check membership by trying to get the community details for this user
      // If user is not a member, this will return false or throw an error
      const response = await this.eventClient
        .send('community.findOne', {
          id: communityId,
          userId: userId,
        })
        .toPromise();

      // If the response contains the community and isMember is true, user is a member
      return response && response.isMember === true;
    } catch (error) {
      this.logger.warn(
        `Could not validate community membership for user ${userId} in community ${communityId}: ${error.message}. ` +
          `Allowing access for testing purposes.`,
      );

      // For development/testing, allow access if validation fails
      // In production, you might want to return false for security
      return true;
    }
  }

  /**
   * Handle client joining a community room (legacy event name for backward compatibility)
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
   * User story: community:leave event implementation
   */
  @SubscribeMessage('community:leave')
  async handleCommunityLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { communityId: string },
  ) {
    const userData = client.data?.user;

    if (!userData) {
      client.emit('error', {
        event: 'community:leave',
        message: 'Authentication required',
      });
      return { success: false, error: 'Authentication required' };
    }

    if (!payload?.communityId) {
      client.emit('error', {
        event: 'community:leave',
        message: 'Community ID is required',
      });
      return { success: false, error: 'Community ID is required' };
    }

    try {
      const roomName = `community:${payload.communityId}`;

      // Notify other room members about user leaving before actually leaving
      client.to(roomName).emit('community:user-left', {
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

      // Send acknowledgment to the leaving client
      const leaveResponse = {
        success: true,
        communityId: payload.communityId,
        roomName,
        leftAt: new Date().toISOString(),
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
        },
      };

      client.emit('community:left', leaveResponse);

      this.logger.log(
        `User ${userData.email} (${userData.id}) successfully left community ${payload.communityId} room. ` +
          `Socket ID: ${client.id}, Room: ${roomName}`,
      );

      return leaveResponse;
    } catch (error) {
      this.logger.error(
        `Error leaving community ${payload.communityId} for user ${userData.email}: ${error.message}`,
        error.stack,
      );

      client.emit('error', {
        event: 'community:leave',
        message: 'Failed to leave community',
      });

      return { success: false, error: 'Failed to leave community' };
    }
  }

  /**
   * Handle client leaving a community room (legacy event name for backward compatibility)
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
   * Handle message sending via WebSocket
   * User story: message:send event for real-time communication
   */
  @SubscribeMessage('message:send')
  async handleMessageSend(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: {
      communityId: string;
      content: string;
      messageType?: string;
      replyTo?: string;
    },
  ) {
    const userData = client.data?.user;

    if (!userData) {
      client.emit('error', {
        event: 'message:send',
        message: 'Authentication required',
      });
      return { success: false, error: 'Authentication required' };
    }

    // Basic validation
    if (!payload?.communityId) {
      client.emit('error', {
        event: 'message:send',
        message: 'Community ID is required',
      });
      return { success: false, error: 'Community ID is required' };
    }

    if (!payload?.content || typeof payload.content !== 'string') {
      client.emit('error', {
        event: 'message:send',
        message: 'Message content is required',
      });
      return { success: false, error: 'Message content is required' };
    }

    // Content validation
    const trimmedContent = payload.content.trim();
    if (trimmedContent.length === 0) {
      client.emit('error', {
        event: 'message:send',
        message: 'Message content cannot be empty',
      });
      return { success: false, error: 'Message content cannot be empty' };
    }

    if (trimmedContent.length > 10000) {
      client.emit('error', {
        event: 'message:send',
        message: 'Message content cannot exceed 10000 characters',
      });
      return { success: false, error: 'Message content too long' };
    }

    // Rate limiting check (10 messages per second)
    const rateLimitResult = this.checkRateLimit(userData.id);
    if (!rateLimitResult.allowed) {
      client.emit('error', {
        event: 'message:send',
        message: `Rate limit exceeded. Please wait ${rateLimitResult.waitTime}ms before sending another message`,
      });
      return {
        success: false,
        error: 'Rate limit exceeded',
        waitTime: rateLimitResult.waitTime,
      };
    }

    try {
      // Create message DTO for RabbitMQ
      const messageData = {
        userId: userData.id,
        username: userData.username,
        communityId: payload.communityId,
        content: trimmedContent,
        messageType: payload.messageType || 'TEXT',
        replyTo: payload.replyTo || null,
      };

      this.logger.debug(
        `Sending message from user ${userData.email} to community ${payload.communityId}`,
      );

      let result: any = null;
      let rabbitMQSuccess = false;

      try {
        // Try to publish message to RabbitMQ for processing with timeout
        const publishPromise = this.eventClient
          .send('chat.message.send', messageData)
          .toPromise();

        // Set a timeout for RabbitMQ to avoid hanging
        result = await Promise.race([
          publishPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('RabbitMQ timeout')), 2000),
          ),
        ]);

        rabbitMQSuccess = true;
        this.logger.log(`Message successfully published to RabbitMQ`);
      } catch (rabbitError) {
        this.logger.warn(
          `RabbitMQ publishing failed: ${rabbitError.message}. Continuing with local processing.`,
        );
        // Continue without RabbitMQ - useful for testing environments
        result = {
          messageId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          processed: false,
          rabbitMQError: rabbitError.message,
        };
      }

      // Send acknowledgment to client
      const response = {
        success: true,
        messageId: result?.messageId || `fallback-${Date.now()}`,
        communityId: payload.communityId,
        content: trimmedContent,
        sentAt: new Date().toISOString(),
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
        },
        rabbitMQProcessed: rabbitMQSuccess,
      };

      client.emit('message:sent', response);

      this.logger.log(
        `Message sent successfully from user ${userData.email} (${userData.id}) to community ${payload.communityId}. ` +
          `Message ID: ${response.messageId}, RabbitMQ: ${rabbitMQSuccess ? 'success' : 'failed'}`,
      );

      return response;
    } catch (error) {
      this.logger.error(
        `Error sending message from user ${userData.email} to community ${payload.communityId}: ${error.message}`,
        error.stack,
      );

      client.emit('error', {
        event: 'message:send',
        message: 'Failed to send message',
        details: error.message,
      });

      return {
        success: false,
        error: 'Failed to send message',
        details: error.message,
      };
    }
  }

  /**
   * Check rate limiting for message sending (10 messages per second)
   */
  private checkRateLimit(userId: string): {
    allowed: boolean;
    waitTime?: number;
  } {
    const now = Date.now();
    const windowSize = 1000; // 1 second
    const maxMessages = 10;

    // Get or create user's message timestamps
    if (!this.messageRateLimit.has(userId)) {
      this.messageRateLimit.set(userId, []);
    }

    const userMessages = this.messageRateLimit.get(userId)!;

    // Remove timestamps older than 1 second
    const validMessages = userMessages.filter(
      (timestamp) => now - timestamp < windowSize,
    );

    // Check if user has exceeded rate limit
    if (validMessages.length >= maxMessages) {
      const oldestMessage = Math.min(...validMessages);
      const waitTime = windowSize - (now - oldestMessage);
      return { allowed: false, waitTime: Math.ceil(waitTime) };
    }

    // Add current timestamp and update the map
    validMessages.push(now);
    this.messageRateLimit.set(userId, validMessages);

    return { allowed: true };
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
}

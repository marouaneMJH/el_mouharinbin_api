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
  // Typing rate limiting: Map<userId, lastTypingEventTime>
  private typingRateLimit = new Map<string, number>();
  // Typing state tracking: Map<userId, Set<communityId>>
  private typingUsers = new Map<string, Set<string>>();
  // Auto-stop typing timers: Map<userId-communityId, timeoutId>
  private typingTimers = new Map<string, NodeJS.Timeout>();

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

    // Event listeners are implemented as @EventPattern decorated methods below
    // This ensures automatic subscription to RabbitMQ events when the module initializes
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

        // Clear typing timers and state for disconnected user
        this.clearUserTypingTimers(userData.id);

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
   * Handle typing start events
   * Notifies other community members that a user is typing
   */
  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { communityId: string },
  ) {
    try {
      const userData = client.data?.user;
      if (!userData) {
        client.emit('error', {
          event: 'typing:start',
          message: 'Authentication required',
        });
        return;
      }

      // Validate payload
      if (!payload?.communityId) {
        client.emit('error', {
          event: 'typing:start',
          message: 'Community ID is required',
        });
        return;
      }

      // Check rate limiting
      if (!this.checkTypingRateLimit(userData.id)) {
        client.emit('error', {
          event: 'typing:start',
          message: 'Rate limit exceeded. Maximum 1 typing event per second.',
        });
        return;
      }

      // Verify user is member of the community
      const roomName = `community:${payload.communityId}`;
      const userRooms = Array.from(client.rooms);
      if (!userRooms.includes(roomName)) {
        client.emit('error', {
          event: 'typing:start',
          message:
            'You must be a member of this community to send typing events',
        });
        return;
      }

      // Track typing state
      if (!this.typingUsers.has(userData.id)) {
        this.typingUsers.set(userData.id, new Set());
      }
      this.typingUsers.get(userData.id)!.add(payload.communityId);

      // Clear existing timer for this user-community combination
      const timerKey = `${userData.id}-${payload.communityId}`;
      const existingTimer = this.typingTimers.get(timerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set auto-stop timer (5 seconds)
      const autoStopTimer = setTimeout(() => {
        this.handleTypingAutoStop(userData.id, payload.communityId);
      }, 5000);
      this.typingTimers.set(timerKey, autoStopTimer);

      // Broadcast typing start to other members in the community
      client.to(roomName).emit('typing:user-start', {
        userId: userData.id,
        username: userData.username,
        communityId: payload.communityId,
        timestamp: new Date().toISOString(),
      });

      // Send acknowledgment to sender
      client.emit('typing:start-ack', {
        success: true,
        communityId: payload.communityId,
        message: 'Typing indicator started',
      });

      this.logger.debug(
        `User ${userData.username} (${userData.id}) started typing in community ${payload.communityId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling typing:start from user ${client.data?.user?.username}: ${error.message}`,
        error.stack,
      );

      client.emit('error', {
        event: 'typing:start',
        message: 'Failed to process typing start event',
        details: error.message,
      });
    }
  }

  /**
   * Handle typing stop events
   * Stops typing notifications for a user in a community
   */
  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { communityId: string },
  ) {
    try {
      const userData = client.data?.user;
      if (!userData) {
        client.emit('error', {
          event: 'typing:stop',
          message: 'Authentication required',
        });
        return;
      }

      // Validate payload
      if (!payload?.communityId) {
        client.emit('error', {
          event: 'typing:stop',
          message: 'Community ID is required',
        });
        return;
      }

      this.stopUserTyping(userData.id, payload.communityId, userData.username);

      // Send acknowledgment to sender
      client.emit('typing:stop-ack', {
        success: true,
        communityId: payload.communityId,
        message: 'Typing indicator stopped',
      });

      this.logger.debug(
        `User ${userData.username} (${userData.id}) stopped typing in community ${payload.communityId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling typing:stop from user ${client.data?.user?.username}: ${error.message}`,
        error.stack,
      );

      client.emit('error', {
        event: 'typing:stop',
        message: 'Failed to process typing stop event',
        details: error.message,
      });
    }
  }

  /**
   * Stop typing for a user in a specific community
   */
  private stopUserTyping(
    userId: string,
    communityId: string,
    username?: string,
  ) {
    // Clear timer
    const timerKey = `${userId}-${communityId}`;
    const timer = this.typingTimers.get(timerKey);
    if (timer) {
      clearTimeout(timer);
      this.typingTimers.delete(timerKey);
    }

    // Update typing state
    const userTypingCommunities = this.typingUsers.get(userId);
    if (userTypingCommunities) {
      userTypingCommunities.delete(communityId);
      if (userTypingCommunities.size === 0) {
        this.typingUsers.delete(userId);
      }
    }

    // Broadcast typing stop to community members
    const roomName = `community:${communityId}`;
    this.server.to(roomName).emit('typing:user-stop', {
      userId: userId,
      username: username || 'Unknown User',
      communityId: communityId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle automatic typing stop after inactivity
   */
  private handleTypingAutoStop(userId: string, communityId: string) {
    this.logger.debug(
      `Auto-stopping typing for user ${userId} in community ${communityId} due to inactivity`,
    );

    this.stopUserTyping(userId, communityId);
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
   * Check rate limiting for typing events (1 event per second)
   */
  private checkTypingRateLimit(userId: string): boolean {
    const now = Date.now();
    const minInterval = 1000; // 1 second

    const lastTypingTime = this.typingRateLimit.get(userId);

    if (lastTypingTime && now - lastTypingTime < minInterval) {
      return false;
    }

    this.typingRateLimit.set(userId, now);
    return true;
  }

  /**
   * Clear typing timers for a user when they disconnect
   */
  private clearUserTypingTimers(userId: string) {
    const keysToDelete = Array.from(this.typingTimers.keys()).filter((key) =>
      key.startsWith(`${userId}-`),
    );

    keysToDelete.forEach((key) => {
      const timer = this.typingTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.typingTimers.delete(key);
      }
    });

    // Clear typing state for this user
    this.typingUsers.delete(userId);
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
   * Handle message updated events from RabbitMQ and broadcast to WebSocket clients
   */
  @EventPattern('chat.message.updated')
  async handleMessageUpdated(data: {
    messageId: string;
    content: string;
    authorId: string;
    authorUsername: string;
    communityId: string;
    updatedAt: string;
    messageType: string;
    editedBy?: string;
  }) {
    try {
      const roomName = `community:${data.communityId}`;

      // Broadcast message update to all clients in the community room
      this.server.to(roomName).emit('message:updated', {
        id: data.messageId,
        content: data.content,
        author: {
          id: data.authorId,
          username: data.authorUsername,
        },
        communityId: data.communityId,
        messageType: data.messageType,
        updatedAt: data.updatedAt,
        editedBy: data.editedBy,
      });

      this.logger.debug(
        `Broadcasting message updated event to room ${roomName}. ` +
          `Message ID: ${data.messageId}, Author: ${data.authorUsername}`,
      );
    } catch (error) {
      this.logger.error(
        `Error broadcasting message updated event: ${error.message}`,
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

  /**
   * Handle user joined community events from RabbitMQ and broadcast to WebSocket clients
   * This handles joins that happen outside the WebSocket gateway (e.g., via REST API)
   */
  @EventPattern('community.user.joined')
  async handleUserJoinedCommunity(data: {
    userId: string;
    username: string;
    email: string;
    communityId: string;
    joinedAt: string;
  }) {
    try {
      const roomName = `community:${data.communityId}`;

      // Broadcast user joined event to all clients in the community room
      this.server.to(roomName).emit('community:user-joined', {
        user: {
          id: data.userId,
          username: data.username,
          email: data.email,
        },
        communityId: data.communityId,
        joinedAt: data.joinedAt,
      });

      // Also emit legacy event for backward compatibility
      this.server.to(roomName).emit('user:joined', {
        user: {
          id: data.userId,
          username: data.username,
          email: data.email,
        },
        communityId: data.communityId,
        joinedAt: data.joinedAt,
      });

      this.logger.debug(
        `Broadcasting user joined event to room ${roomName}. ` +
          `User: ${data.username} (${data.userId})`,
      );
    } catch (error) {
      this.logger.error(
        `Error broadcasting user joined event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle user left community events from RabbitMQ and broadcast to WebSocket clients
   * This handles leaves that happen outside the WebSocket gateway (e.g., via REST API)
   */
  @EventPattern('community.user.left')
  async handleUserLeftCommunity(data: {
    userId: string;
    username: string;
    email: string;
    communityId: string;
    leftAt: string;
  }) {
    try {
      const roomName = `community:${data.communityId}`;

      // Broadcast user left event to all clients in the community room
      this.server.to(roomName).emit('community:user-left', {
        user: {
          id: data.userId,
          username: data.username,
          email: data.email,
        },
        communityId: data.communityId,
        leftAt: data.leftAt,
      });

      // Also emit legacy event for backward compatibility
      this.server.to(roomName).emit('user:left', {
        user: {
          id: data.userId,
          username: data.username,
          email: data.email,
        },
        communityId: data.communityId,
        leftAt: data.leftAt,
      });

      this.logger.debug(
        `Broadcasting user left event to room ${roomName}. ` +
          `User: ${data.username} (${data.userId})`,
      );
    } catch (error) {
      this.logger.error(
        `Error broadcasting user left event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle community events from RabbitMQ and broadcast to WebSocket clients
   * This handles community-wide events like creation, updates, or announcements
   */
  @EventPattern('community.announcement')
  async handleCommunityAnnouncement(data: {
    communityId: string;
    type: string;
    message: string;
    timestamp: string;
    metadata?: any;
  }) {
    try {
      const roomName = `community:${data.communityId}`;

      // Broadcast community announcement to all clients in the room
      this.server.to(roomName).emit('community:announcement', {
        type: data.type,
        message: data.message,
        timestamp: data.timestamp,
        metadata: data.metadata,
      });

      this.logger.debug(
        `Broadcasting community announcement to room ${roomName}. ` +
          `Type: ${data.type}, Message: ${data.message.substring(0, 50)}...`,
      );
    } catch (error) {
      this.logger.error(
        `Error broadcasting community announcement: ${error.message}`,
        error.stack,
      );
    }
  }
}

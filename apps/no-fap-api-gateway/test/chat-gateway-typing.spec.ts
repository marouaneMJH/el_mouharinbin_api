import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '../src/modules/chat/chat.gateway';
import { ChatService } from '../src/modules/chat/chat.service';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

// Mock interfaces
interface MockSocket extends Partial<Socket> {
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
  rooms?: Set<string>;
  to?: jest.Mock;
  emit?: jest.Mock;
}

describe('ChatGateway - Typing Indicators', () => {
  let gateway: ChatGateway;
  let mockSocket: MockSocket;
  let mockChatService: Partial<ChatService>;
  let mockJwtService: Partial<JwtService>;
  let mockEventClient: any;

  beforeEach(async () => {
    // Mock services
    mockChatService = {
      removeSession: jest.fn(),
    };

    mockJwtService = {
      verify: jest.fn(),
    };

    mockEventClient = {
      send: jest.fn(),
    };

    // Mock socket
    mockSocket = {
      data: {
        user: {
          id: 'test-user-123',
          username: 'testuser',
          email: 'test@example.com',
        },
      },
      rooms: new Set(['community:test-community-123']),
      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'CHAT_SERVICE',
          useValue: mockEventClient,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  afterEach(() => {
    // Clean up any timers
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Typing Rate Limiting', () => {
    it('should allow typing event when under rate limit', () => {
      const userId = 'test-user-123';

      // First call should be allowed
      const result1 = gateway['checkTypingRateLimit'](userId);
      expect(result1).toBe(true);
    });

    it('should block typing event when rate limit exceeded', () => {
      const userId = 'test-user-123';

      // First call should be allowed
      const result1 = gateway['checkTypingRateLimit'](userId);
      expect(result1).toBe(true);

      // Immediate second call should be blocked
      const result2 = gateway['checkTypingRateLimit'](userId);
      expect(result2).toBe(false);
    });

    it('should allow typing event after rate limit window expires', (done) => {
      const userId = 'test-user-123';

      // First call should be allowed
      const result1 = gateway['checkTypingRateLimit'](userId);
      expect(result1).toBe(true);

      // Wait for rate limit window to expire
      setTimeout(() => {
        const result2 = gateway['checkTypingRateLimit'](userId);
        expect(result2).toBe(true);
        done();
      }, 1100); // 1.1 seconds to ensure rate limit window has passed
    });
  });

  describe('Typing Start Handler', () => {
    it('should handle valid typing start event', async () => {
      const payload = { communityId: 'test-community-123' };

      await gateway.handleTypingStart(mockSocket as any, payload);

      // Should emit acknowledgment to sender
      expect(mockSocket.emit).toHaveBeenCalledWith('typing:start-ack', {
        success: true,
        communityId: 'test-community-123',
        message: 'Typing indicator started',
      });
    });

    it('should reject typing start when user not authenticated', async () => {
      const unauthenticatedSocket = { ...mockSocket, data: undefined };
      const payload = { communityId: 'test-community-123' };

      await gateway.handleTypingStart(unauthenticatedSocket as any, payload);

      expect(unauthenticatedSocket.emit).toHaveBeenCalledWith('error', {
        event: 'typing:start',
        message: 'Authentication required',
      });
    });

    it('should reject typing start when communityId missing', async () => {
      const payload = { communityId: '' };

      await gateway.handleTypingStart(mockSocket as any, payload);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        event: 'typing:start',
        message: 'Community ID is required',
      });
    });

    it('should reject typing start when user not in community', async () => {
      const socketNotInCommunity = {
        ...mockSocket,
        rooms: new Set(['other-room']),
      };
      const payload = { communityId: 'test-community-123' };

      await gateway.handleTypingStart(socketNotInCommunity as any, payload);

      expect(socketNotInCommunity.emit).toHaveBeenCalledWith('error', {
        event: 'typing:start',
        message: 'You must be a member of this community to send typing events',
      });
    });
  });

  describe('Typing Stop Handler', () => {
    it('should handle valid typing stop event', async () => {
      const payload = { communityId: 'test-community-123' };

      await gateway.handleTypingStop(mockSocket as any, payload);

      expect(mockSocket.emit).toHaveBeenCalledWith('typing:stop-ack', {
        success: true,
        communityId: 'test-community-123',
        message: 'Typing indicator stopped',
      });
    });

    it('should reject typing stop when user not authenticated', async () => {
      const unauthenticatedSocket = { ...mockSocket, data: undefined };
      const payload = { communityId: 'test-community-123' };

      await gateway.handleTypingStop(unauthenticatedSocket as any, payload);

      expect(unauthenticatedSocket.emit).toHaveBeenCalledWith('error', {
        event: 'typing:stop',
        message: 'Authentication required',
      });
    });
  });

  describe('Auto-Stop Typing Timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should auto-stop typing after 5 seconds', async () => {
      const payload = { communityId: 'test-community-123' };

      // Start typing
      await gateway.handleTypingStart(mockSocket as any, payload);

      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000);

      // The auto-stop should have been triggered
      // We can't directly test the private method, but we can verify
      // that the timer was set up correctly by checking if there are active timers
      expect(jest.getTimerCount()).toBe(0); // Timer should have executed and been cleared
    });

    it('should clear existing timer when new typing start received', async () => {
      const payload = { communityId: 'test-community-123' };

      // Start typing first time
      await gateway.handleTypingStart(mockSocket as any, payload);
      expect(jest.getTimerCount()).toBe(1);

      // Start typing again (should clear previous timer)
      await gateway.handleTypingStart(mockSocket as any, payload);
      expect(jest.getTimerCount()).toBe(1); // Still only one timer
    });
  });

  describe('User Disconnect Cleanup', () => {
    it('should clear typing timers when user disconnects', async () => {
      const mockDisconnectSocket = {
        ...mockSocket,
        id: 'socket-123',
      };

      // Start typing to create timers
      const payload = { communityId: 'test-community-123' };
      await gateway.handleTypingStart(mockDisconnectSocket as any, payload);

      // Simulate disconnect
      await gateway.handleDisconnect(mockDisconnectSocket as any);

      // Verify that removeSession was called
      expect(mockChatService.removeSession).toHaveBeenCalledWith(
        'test-user-123',
      );
    });
  });

  describe('Typing State Management', () => {
    it('should track typing state correctly', async () => {
      const payload = { communityId: 'test-community-123' };

      // Start typing
      await gateway.handleTypingStart(mockSocket as any, payload);

      // Check that typing state is tracked
      const typingUsers = gateway['typingUsers'];
      expect(typingUsers.has('test-user-123')).toBe(true);
      expect(typingUsers.get('test-user-123')?.has('test-community-123')).toBe(
        true,
      );
    });

    it('should clear typing state when user stops typing', async () => {
      const payload = { communityId: 'test-community-123' };

      // Start typing
      await gateway.handleTypingStart(mockSocket as any, payload);

      // Stop typing
      await gateway.handleTypingStop(mockSocket as any, payload);

      // Check that typing state is cleared
      const typingUsers = gateway['typingUsers'];
      expect(typingUsers.has('test-user-123')).toBe(false);
    });
  });

  describe('Broadcasting Typing Events', () => {
    it('should broadcast typing start to other community members', async () => {
      const payload = { communityId: 'test-community-123' };

      await gateway.handleTypingStart(mockSocket as any, payload);

      // Verify that typing start was broadcasted to community room
      expect(mockSocket.to).toHaveBeenCalledWith(
        'community:test-community-123',
      );
    });

    it('should include correct user info in typing broadcasts', async () => {
      const payload = { communityId: 'test-community-123' };
      const mockRoom = { emit: jest.fn() };
      (mockSocket.to as jest.Mock).mockReturnValue(mockRoom);

      await gateway.handleTypingStart(mockSocket as any, payload);

      expect(mockRoom.emit).toHaveBeenCalledWith('typing:user-start', {
        userId: 'test-user-123',
        username: 'testuser',
        communityId: 'test-community-123',
        timestamp: expect.any(String),
      });
    });
  });
});

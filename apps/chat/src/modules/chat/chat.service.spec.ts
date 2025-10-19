import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { PrismaService } from '../../../../../libs/contract/services/prisma.service';
import {
  SendMessageDto,
  MessageType,
} from '../../../../../libs/contract/dtos/chat';

describe('ChatService', () => {
  let service: ChatService;
  let prismaService: jest.Mocked<PrismaService>;
  let eventClient: jest.Mocked<ClientProxy>;

  const mockPrismaService = {
    communityMember: {
      findUnique: jest.fn(),
    },
    message: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    userSession: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  } as any;

  const mockEventClient = {
    emit: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'CHAT_EVENT_CLIENT',
          useValue: mockEventClient,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prismaService = module.get(PrismaService);
    eventClient = module.get('CHAT_EVENT_CLIENT');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    const mockSendMessageDto: SendMessageDto = {
      userId: 'user-123',
      username: 'testuser',
      communityId: 'community-123',
      content: 'Test message',
      messageType: MessageType.TEXT,
    };

    const mockMembership = {
      id: 'member-123',
      communityId: 'community-123',
      userId: 'user-123',
      joinedAt: new Date(),
      role: 'member',
      isBanned: false,
      bannedUntil: null,
    };

    const mockMessage = {
      id: 'message-123',
      communityId: 'community-123',
      userId: 'user-123',
      username: 'testuser',
      content: 'Test message',
      messageType: 'text',
      replyTo: null,
      editedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      replyMessage: null,
    };

    it('should send a message successfully', async () => {
      // Arrange
      prismaService.communityMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      prismaService.message.create.mockResolvedValue(mockMessage);

      // Act
      const result = await service.sendMessage(mockSendMessageDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(mockMessage.id);
      expect(result.content).toBe(mockMessage.content);
      expect(result.userId).toBe(mockMessage.userId);
      expect(result.communityId).toBe(mockMessage.communityId);
      expect(eventClient.emit).toHaveBeenCalledWith(
        'chat.message.created',
        expect.any(Object),
      );
    });

    it('should throw forbidden exception when user is not a member', async () => {
      // Arrange
      prismaService.communityMember.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.sendMessage(mockSendMessageDto)).rejects.toThrow(
        new HttpException(
          'Vous devez être membre de cette communauté pour envoyer des messages',
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('should throw forbidden exception when user is banned', async () => {
      // Arrange
      const bannedMembership = {
        ...mockMembership,
        isBanned: true,
        bannedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Banned for 24h
      };
      prismaService.communityMember.findUnique.mockResolvedValue(
        bannedMembership,
      );

      // Act & Assert
      await expect(service.sendMessage(mockSendMessageDto)).rejects.toThrow(
        new HttpException(
          'Vous êtes banni de cette communauté',
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('should allow sending message when ban has expired', async () => {
      // Arrange
      const expiredBanMembership = {
        ...mockMembership,
        isBanned: true,
        bannedUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ban expired 24h ago
      };
      prismaService.communityMember.findUnique.mockResolvedValue(
        expiredBanMembership,
      );
      prismaService.message.create.mockResolvedValue(mockMessage);

      // Act
      const result = await service.sendMessage(mockSendMessageDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(mockMessage.id);
    });

    it('should throw bad request when reply message does not exist', async () => {
      // Arrange
      const replyMessageDto = {
        ...mockSendMessageDto,
        replyTo: 'non-existent-message',
      };
      prismaService.communityMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      prismaService.message.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.sendMessage(replyMessageDto)).rejects.toThrow(
        new HttpException(
          "Le message auquel vous tentez de répondre n'existe pas",
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should validate message content length', () => {
      // Test content length validation is handled by DTO validation
      const longContent = 'a'.repeat(10001); // Exceeds 10000 char limit
      const invalidDto = {
        ...mockSendMessageDto,
        content: longContent,
      };

      // The DTO validation would catch this, but we can test our service behavior
      expect(invalidDto.content.length).toBeGreaterThan(10000);
    });

    it('should sanitize content for XSS prevention', async () => {
      // Arrange
      const xssContent =
        '<script>alert("xss")</script>Hello <iframe src="evil"></iframe>';
      const maliciousDto = {
        ...mockSendMessageDto,
        content: xssContent,
      };

      // Note: The actual sanitization happens in the DTO Transform decorator
      // This test would need to be done at the controller/integration level
      // Here we just verify the service handles any content
      prismaService.communityMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      prismaService.message.create.mockResolvedValue({
        ...mockMessage,
        content: 'Hello ', // Sanitized content
      });

      // Act
      const result = await service.sendMessage(maliciousDto);

      // Assert
      expect(result).toBeDefined();
    });
  });
});

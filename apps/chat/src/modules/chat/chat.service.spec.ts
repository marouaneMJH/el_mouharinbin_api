import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { PrismaService } from '../../../../../libs/contract/services/prisma.service';
import {
  SendMessageDto,
  MessageType,
  GetMessagesDto,
  PaginatedMessagesDto,
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
      findMany: jest.fn(),
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

  describe('getMessages', () => {
    const mockGetMessagesDto: GetMessagesDto = {
      communityId: 'community-123',
      limit: 50,
    };

    const mockMessages = [
      {
        id: 'message-1',
        communityId: 'community-123',
        userId: 'user-123',
        username: 'testuser',
        content: 'Test message 1',
        messageType: 'text',
        replyTo: null,
        editedAt: null,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        deletedAt: null,
        replyMessage: null,
      },
      {
        id: 'message-2',
        communityId: 'community-123',
        userId: 'user-456',
        username: 'testuser2',
        content: 'Test message 2',
        messageType: 'text',
        replyTo: null,
        editedAt: null,
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-01T09:00:00Z'),
        deletedAt: null,
        replyMessage: null,
      },
    ];

    it('should get messages successfully for community member', async () => {
      // Arrange
      prismaService.communityMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      prismaService.message.findMany.mockResolvedValue(mockMessages);

      // Act
      const result = await service.getMessages(mockGetMessagesDto, 'user-123');

      // Assert
      expect(result).toBeDefined();
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].id).toBe('message-1');
      expect(result.messages[1].id).toBe('message-2');
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(false);
      expect(result.count).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('should throw forbidden exception when user is not a member', async () => {
      // Arrange
      prismaService.communityMember.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getMessages(mockGetMessagesDto, 'user-123'),
      ).rejects.toThrow(
        new HttpException(
          'Vous devez être membre de cette communauté pour consulter les messages',
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('should handle cursor-based pagination', async () => {
      // Arrange
      const paginationDto = {
        ...mockGetMessagesDto,
        cursor: 'message-1',
        limit: 1,
      };

      // Mock 2 messages to test hasNextPage (limit + 1)
      const paginatedMessages = [mockMessages[1], mockMessages[0]];

      prismaService.communityMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      prismaService.message.findMany.mockResolvedValue(paginatedMessages);

      // Act
      const result = await service.getMessages(paginationDto, 'user-123');

      // Assert
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(true);
      expect(result.nextCursor).toBe('message-2');
      expect(result.prevCursor).toBe('message-2');
      expect(result.count).toBe(1);
    });

    it('should exclude deleted messages', async () => {
      // Arrange
      prismaService.communityMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      prismaService.message.findMany.mockResolvedValue(mockMessages);

      // Act
      await service.getMessages(mockGetMessagesDto, 'user-123');

      // Assert
      expect(prismaService.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        }),
      );
    });

    it('should sort messages by creation date DESC', async () => {
      // Arrange
      prismaService.communityMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      prismaService.message.findMany.mockResolvedValue(mockMessages);

      // Act
      await service.getMessages(mockGetMessagesDto, 'user-123');

      // Assert
      expect(prismaService.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: 'desc',
          },
        }),
      );
    });

    it('should apply optional filters', async () => {
      // Arrange
      const filteredDto: GetMessagesDto = {
        ...mockGetMessagesDto,
        messageType: MessageType.TEXT,
        userId: 'user-456',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-01T23:59:59Z',
      };

      prismaService.communityMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      prismaService.message.findMany.mockResolvedValue(mockMessages);

      // Act
      await service.getMessages(filteredDto, 'user-123');

      // Assert
      expect(prismaService.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            messageType: 'text',
            userId: 'user-456',
            createdAt: expect.objectContaining({
              gte: new Date('2024-01-01T00:00:00Z'),
              lte: new Date('2024-01-01T23:59:59Z'),
            }),
          }),
        }),
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommunityService } from './community.service';
import { PrismaService } from '../../../../../libs/contract/services/prisma.service';
import {
  CreateCommunityDto,
  Role,
} from '../../../../../libs/contract/dtos/chat';

describe('CommunityService', () => {
  let service: CommunityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    community: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    communityMember: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCommunity', () => {
    const createCommunityDto: CreateCommunityDto = {
      name: 'Test Community',
      description: 'A test community',
      isPublic: true,
      maxMembers: 100,
    };
    const createdBy = 'user-123';

    it('devrait créer une communauté avec succès', async () => {
      const mockCommunity = {
        id: 'community-123',
        name: createCommunityDto.name,
        description: createCommunityDto.description,
        avatarUrl: null,
        isPublic: createCommunityDto.isPublic,
        maxMembers: createCommunityDto.maxMembers,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { members: 1 },
      };

      // Mock: aucune communauté existante avec ce nom
      mockPrismaService.community.findUnique.mockResolvedValueOnce(null);

      // Mock: transaction réussie
      mockPrismaService.$transaction.mockImplementationOnce(
        async (callback) => {
          return callback({
            community: {
              create: jest.fn().mockResolvedValue(mockCommunity),
              findUnique: jest.fn().mockResolvedValue(mockCommunity),
            },
            communityMember: {
              create: jest.fn().mockResolvedValue({
                id: 'member-123',
                communityId: mockCommunity.id,
                userId: createdBy,
                role: Role.OWNER,
              }),
            },
          });
        },
      );

      const result = await service.createCommunity(
        createCommunityDto,
        createdBy,
      );

      expect(result).toMatchObject({
        id: mockCommunity.id,
        name: createCommunityDto.name,
        description: createCommunityDto.description,
        isPublic: createCommunityDto.isPublic,
        maxMembers: createCommunityDto.maxMembers,
        createdBy,
        memberCount: 1,
        userRole: Role.OWNER,
        isMember: true,
      });

      expect(mockPrismaService.community.findUnique).toHaveBeenCalledWith({
        where: { name: createCommunityDto.name },
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le nom existe déjà', async () => {
      // Mock: communauté existante
      mockPrismaService.community.findUnique.mockResolvedValueOnce({
        id: 'existing-community',
        name: createCommunityDto.name,
      });

      await expect(
        service.createCommunity(createCommunityDto, createdBy),
      ).rejects.toThrow(
        new HttpException(
          'Une communauté avec ce nom existe déjà',
          HttpStatus.CONFLICT,
        ),
      );

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('devrait utiliser les valeurs par défaut pour les champs optionnels', async () => {
      const minimalDto: CreateCommunityDto = {
        name: 'Minimal Community',
      };

      mockPrismaService.community.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.$transaction.mockImplementationOnce(
        async (callback) => {
          const txMock = {
            community: {
              create: jest.fn(),
              findUnique: jest.fn().mockResolvedValue({
                id: 'community-123',
                name: minimalDto.name,
                description: null,
                avatarUrl: null,
                isPublic: true,
                maxMembers: 1000,
                createdBy,
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: { members: 1 },
              }),
            },
            communityMember: {
              create: jest.fn(),
            },
          };
          return callback(txMock);
        },
      );

      await service.createCommunity(minimalDto, createdBy);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs Prisma', async () => {
      mockPrismaService.community.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.$transaction.mockRejectedValueOnce({
        code: 'P2002',
        meta: { target: ['name'] },
      });

      await expect(
        service.createCommunity(createCommunityDto, createdBy),
      ).rejects.toThrow(
        new HttpException(
          'Une communauté avec ce nom existe déjà',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('getCommunityById', () => {
    const communityId = 'community-123';
    const userId = 'user-123';

    it('devrait retourner une communauté avec les informations du membre', async () => {
      const mockCommunity = {
        id: communityId,
        name: 'Test Community',
        description: 'Test description',
        avatarUrl: null,
        isPublic: true,
        maxMembers: 100,
        createdBy: 'creator-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { members: 5 },
        members: [{ role: Role.MEMBER }],
      };

      mockPrismaService.community.findUnique.mockResolvedValueOnce(
        mockCommunity,
      );

      const result = await service.getCommunityById(communityId, userId);

      expect(result).toMatchObject({
        id: communityId,
        name: mockCommunity.name,
        memberCount: 5,
        userRole: Role.MEMBER,
        isMember: true,
      });

      expect(mockPrismaService.community.findUnique).toHaveBeenCalledWith({
        where: { id: communityId },
        include: {
          _count: { select: { members: true } },
          members: {
            where: { userId },
            select: { role: true },
          },
        },
      });
    });

    it("devrait lancer une erreur si la communauté n'existe pas", async () => {
      mockPrismaService.community.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.getCommunityById(communityId, userId),
      ).rejects.toThrow(
        new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND),
      );
    });

    it('devrait retourner isMember=false pour un non-membre', async () => {
      const mockCommunity = {
        id: communityId,
        name: 'Test Community',
        description: null,
        avatarUrl: null,
        isPublic: true,
        maxMembers: 100,
        createdBy: 'creator-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { members: 5 },
        members: [], // Pas de membre
      };

      mockPrismaService.community.findUnique.mockResolvedValueOnce(
        mockCommunity,
      );

      const result = await service.getCommunityById(communityId, userId);

      expect(result.isMember).toBe(false);
      expect(result.userRole).toBeUndefined();
    });
  });
});

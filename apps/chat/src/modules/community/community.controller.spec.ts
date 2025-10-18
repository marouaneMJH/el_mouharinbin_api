import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { PrismaService } from '../../../../../libs/contract/services/prisma.service';
import { JwtAuthGuard } from '../../../../../libs/contract/guards/jwt.guard';
import {
  CreateCommunityDto,
  Role,
} from '../../../../../libs/contract/dtos/chat';

describe('CommunityController (Integration)', () => {
  let app: INestApplication;
  let communityService: CommunityService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'user',
    status: 'active',
  };

  const mockJwtGuard = {
    canActivate: jest.fn(() => true),
    handleRequest: jest.fn((err, user) => user || mockUser),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        CommunityService,
        {
          provide: PrismaService,
          useValue: {
            community: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            communityMember: {
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    communityService = moduleFixture.get<CommunityService>(CommunityService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/communities', () => {
    const validCommunityDto: CreateCommunityDto = {
      name: 'Test Community',
      description: 'A test community for unit tests',
      isPublic: true,
      maxMembers: 100,
    };

    it('devrait créer une communauté avec des données valides', async () => {
      const expectedCommunity = {
        id: 'community-123',
        name: validCommunityDto.name,
        description: validCommunityDto.description,
        avatarUrl: null,
        isPublic: validCommunityDto.isPublic,
        maxMembers: validCommunityDto.maxMembers,
        createdBy: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { members: 1 },
      };

      // Mock de la transaction Prisma
      (prismaService.$transaction as jest.Mock).mockImplementationOnce(
        async (callback) => {
          return callback({
            community: {
              create: jest.fn().mockResolvedValue({
                ...expectedCommunity,
                _count: undefined,
              }),
              findUnique: jest.fn().mockResolvedValue(expectedCommunity),
            },
            communityMember: {
              create: jest.fn().mockResolvedValue({
                id: 'member-123',
                communityId: expectedCommunity.id,
                userId: mockUser.id,
                role: Role.OWNER,
                joinedAt: new Date(),
              }),
            },
          });
        },
      );

      (prismaService.community.findUnique as jest.Mock).mockResolvedValueOnce(
        null,
      );

      const response = await request(app.getHttpServer())
        .post('/api/communities')
        .send(validCommunityDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        id: expectedCommunity.id,
        name: validCommunityDto.name,
        description: validCommunityDto.description,
        isPublic: validCommunityDto.isPublic,
        maxMembers: validCommunityDto.maxMembers,
        createdBy: mockUser.id,
        memberCount: 1,
        userRole: Role.OWNER,
        isMember: true,
      });
    });

    it('devrait retourner 400 pour des données invalides', async () => {
      const invalidDto = {
        name: 'A', // Trop court
        description: 'A'.repeat(501), // Trop long
      };

      await request(app.getHttpServer())
        .post('/api/communities')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('devrait retourner 409 si une communauté avec le même nom existe', async () => {
      (prismaService.community.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'existing-community',
        name: validCommunityDto.name,
      });

      await request(app.getHttpServer())
        .post('/api/communities')
        .send(validCommunityDto)
        .expect(HttpStatus.CONFLICT);
    });

    it('devrait retourner 401 sans authentification', async () => {
      // Override le guard pour simuler un utilisateur non authentifié
      mockJwtGuard.canActivate.mockReturnValueOnce(false);

      await request(app.getHttpServer())
        .post('/api/communities')
        .send(validCommunityDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('devrait valider les champs requis', async () => {
      const incompleteDto = {
        description: 'Test without name',
      };

      const response = await request(app.getHttpServer())
        .post('/api/communities')
        .send(incompleteDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('name');
    });

    it('devrait valider la longueur du nom', async () => {
      const dtoWithShortName = {
        ...validCommunityDto,
        name: 'AB', // Trop court (minimum 3)
      };

      const response = await request(app.getHttpServer())
        .post('/api/communities')
        .send(dtoWithShortName)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('au moins 3 caractères');
    });

    it('devrait valider la longueur de la description', async () => {
      const dtoWithLongDescription = {
        ...validCommunityDto,
        description: 'A'.repeat(501), // Trop long (maximum 500)
      };

      const response = await request(app.getHttpServer())
        .post('/api/communities')
        .send(dtoWithLongDescription)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('500 caractères');
    });
  });
});

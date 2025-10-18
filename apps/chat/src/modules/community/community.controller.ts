import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';
import { CommunityService } from './community.service';
import {
  CreateCommunityDto,
  CommunityResponseDto,
} from '../../../../../libs/contract/dtos/chat';
import { JwtAuthGuard } from '../../../../../libs/contract/guards/jwt.guard';
import JwtPayloadI from '../../../../../libs/contract/interfaces/jwt-paylaod.interface';

interface AuthenticatedRequest extends Request {
  user: JwtPayloadI;
}

@ApiTags('Communities')
@ApiBearerAuth()
@Controller('api/communities')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  /**
   * Créer une nouvelle communauté
   * L'utilisateur authentifié devient automatiquement propriétaire et membre
   */
  @Post()
  @ApiOperation({
    summary: 'Créer une nouvelle communauté',
    description:
      'Permet à un utilisateur authentifié de créer une nouvelle communauté. Le créateur devient automatiquement propriétaire et membre de la communauté.',
  })
  @ApiResponse({
    status: 201,
    description: 'Communauté créée avec succès',
    type: CommunityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['Le nom doit contenir au moins 3 caractères'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Une communauté avec ce nom existe déjà',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example: 'Une communauté avec ce nom existe déjà',
        },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async createCommunity(
    @Body() createCommunityDto: CreateCommunityDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<CommunityResponseDto> {
    try {
      const userId = req.user.id;

      if (!userId) {
        throw new HttpException(
          'Utilisateur non authentifié',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.communityService.createCommunity(
        createCommunityDto,
        userId,
      );
    } catch (error) {
      // Si c'est déjà une HttpException, on la relance
      if (error instanceof HttpException) {
        throw error;
      }

      // Gestion des erreurs Prisma spécifiques
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new HttpException(
          'Une communauté avec ce nom existe déjà',
          HttpStatus.CONFLICT,
        );
      }

      // Erreur générique
      throw new HttpException(
        'Erreur lors de la création de la communauté',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== GESTIONNAIRES DE MESSAGES RABBITMQ =====

  /**
   * Gestionnaire RabbitMQ pour créer une communauté
   */
  @MessagePattern('community.create')
  async handleCreateCommunity(data: CreateCommunityDto & { userId: string }) {
    try {
      const { userId, ...createCommunityDto } = data;

      // Simuler un objet Request avec l'utilisateur
      const mockRequest = {
        user: { id: userId },
      } as AuthenticatedRequest;

      return await this.communityService.createCommunity(
        createCommunityDto,
        userId,
      );
    } catch (error) {
      console.error(
        'Erreur RabbitMQ lors de la création de communauté:',
        error,
      );
      throw error;
    }
  }

  /**
   * Gestionnaire RabbitMQ pour obtenir les communautés publiques
   */
  @MessagePattern('community.findPublic')
  async handleFindPublicCommunities() {
    try {
      return await this.communityService.findPublicCommunities();
    } catch (error) {
      console.error(
        'Erreur RabbitMQ lors de la récupération des communautés publiques:',
        error,
      );
      throw error;
    }
  }

  /**
   * Gestionnaire RabbitMQ pour obtenir les communautés d'un utilisateur
   */
  @MessagePattern('community.findByUser')
  async handleFindCommunitiesByUser(data: { userId: string }) {
    try {
      return await this.communityService.findCommunitiesByUser(data.userId);
    } catch (error) {
      console.error(
        'Erreur RabbitMQ lors de la récupération des communautés utilisateur:',
        error,
      );
      throw error;
    }
  }
}

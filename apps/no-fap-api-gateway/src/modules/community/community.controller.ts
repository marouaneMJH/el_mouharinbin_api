import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateCommunityDto,
  CommunityResponseDto,
  CommunityDetailResponseDto,
  CommunityPaginationDto,
  PaginatedCommunitiesDto,
  GetMembersDto,
  PaginatedMembersDto,
  GetMessagesDto,
  PaginatedMessagesDto,
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
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatClient: ClientProxy,
  ) {}

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
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 409,
    description: 'Une communauté avec ce nom existe déjà',
  })
  async createCommunity(
    @Body() createCommunityDto: CreateCommunityDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<CommunityResponseDto> {
    try {
      // Envoyer la requête au service Chat via RabbitMQ
      return await firstValueFrom(
        this.chatClient.send('community.create', {
          ...createCommunityDto,
          userId: req.user.id,
        }),
      );
      // return { id: 'ddd', name: 'sss' } as CommunityResponseDto;
    } catch (error) {
      console.error('Erreur lors de la création de la communauté:', error);

      if (error.statusCode) {
        throw new HttpException(error.message, error.statusCode);
      }

      throw new HttpException(
        'Erreur interne lors de la création de la communauté',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupérer la liste des communautés publiques avec pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Lister les communautés publiques',
    description:
      'Récupère la liste des communautés publiques avec pagination. Les communautés sont triées par date de création (plus récentes en premier).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre maximum de communautés à retourner (1-100)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Nombre de communautés à ignorer pour la pagination',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des communautés publiques récupérée avec succès',
    type: PaginatedCommunitiesDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Paramètres de pagination invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async getPublicCommunities(
    @Query() paginationDto: CommunityPaginationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaginatedCommunitiesDto> {
    try {
      const userId = req.user?.id; // Optional user ID for membership info

      const result = await firstValueFrom(
        this.chatClient.send('community.findPublic', {
          ...paginationDto,
          userId,
        }),
      );

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des communautés:', error);

      if (error.statusCode) {
        throw new HttpException(error.message, error.statusCode);
      }

      throw new HttpException(
        'Erreur interne lors de la récupération des communautés',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupérer les détails d'une communauté par son ID
   */
  @Get(':id')
  @ApiOperation({
    summary: "Récupérer les détails d'une communauté",
    description:
      "Récupère les détails complets d'une communauté, incluant les informations du propriétaire et le nombre de membres. Retourne 404 si la communauté n'existe pas, 403 si elle est privée et l'utilisateur n'est pas membre.",
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant unique de la communauté',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de la communauté récupérés avec succès',
    type: CommunityDetailResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - Communauté privée et utilisateur non membre',
  })
  @ApiResponse({
    status: 404,
    description: 'Communauté non trouvée',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async getCommunityDetails(
    @Param('id') communityId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<CommunityDetailResponseDto> {
    try {
      const userId = req.user?.id;

      const result = await firstValueFrom(
        this.chatClient.send('community.findById', {
          id: communityId,
          userId,
        }),
      );

      return result;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des détails de la communauté:',
        error,
      );

      if (error.statusCode) {
        throw new HttpException(error.message, error.statusCode);
      }

      throw new HttpException(
        'Erreur interne lors de la récupération des détails de la communauté',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtenir les communautés de l'utilisateur connecté
   */
  @Get('my-communities')
  @ApiOperation({
    summary: 'Obtenir mes communautés',
    description:
      "Récupère la liste des communautés dont l'utilisateur est membre.",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des communautés de l'utilisateur récupérée avec succès",
    type: [CommunityResponseDto],
  })
  async getMyCommunities(
    @Request() req: AuthenticatedRequest,
  ): Promise<CommunityResponseDto[]> {
    try {
      const result = await firstValueFrom(
        this.chatClient.send('community.findByUser', {
          userId: req.user.id,
        }),
      );

      return result;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des communautés utilisateur:',
        error,
      );

      throw new HttpException(
        'Erreur interne lors de la récupération des communautés',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Rejoindre une communauté
   * En tant qu'utilisateur authentifié
   * Je veux rejoindre une communauté
   * Afin de participer aux discussions
   */
  @Post(':id/join')
  @ApiOperation({
    summary: 'Rejoindre une communauté',
    description:
      "Permet à un utilisateur authentifié de rejoindre une communauté existante. L'utilisateur devient membre de la communauté.",
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant unique de la communauté à rejoindre',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur ajouté à la communauté avec succès',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Vous avez rejoint la communauté avec succès',
        },
        communityId: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        membershipStatus: { type: 'string', example: 'MEMBER' },
        joinedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Utilisateur déjà membre ou communauté pleine',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          examples: [
            'Vous êtes déjà membre de cette communauté',
            'La communauté a atteint le nombre maximum de membres',
          ],
        },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Communauté non trouvée',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Communauté non trouvée' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async joinCommunity(
    @Param('id') communityId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    communityId: string;
    userId: string;
    membershipStatus: string;
    joinedAt: string;
  }> {
    try {
      const result = await firstValueFrom(
        this.chatClient.send('community.join', {
          communityId,
          userId: req.user.id,
          userEmail: req.user.email,
        }),
      );

      return result;
    } catch (error) {
      console.error('Erreur lors de la jonction à la communauté:', error);

      if (error.statusCode) {
        throw new HttpException(error.message, error.statusCode);
      }

      // Map specific errors
      if (error.message?.includes('déjà membre')) {
        throw new HttpException(
          'Vous êtes déjà membre de cette communauté',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        error.message?.includes('pleine') ||
        error.message?.includes('maximum')
      ) {
        throw new HttpException(
          'La communauté a atteint le nombre maximum de membres',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        error.message?.includes('non trouvée') ||
        error.message?.includes('not found')
      ) {
        throw new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'Erreur interne lors de la jonction à la communauté',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Quitter une communauté
   * En tant qu'utilisateur membre d'une communauté
   * Je veux quitter la communauté
   * Afin de ne plus recevoir les messages
   */
  @Post(':id/leave')
  @ApiOperation({
    summary: 'Quitter une communauté',
    description:
      'Permet à un utilisateur authentifié de quitter une communauté dont il est membre. Le propriétaire peut quitter uniquement si un autre admin existe ou si la communauté est vide.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant unique de la communauté à quitter',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur retiré de la communauté avec succès',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Vous avez quitté la communauté avec succès',
        },
        communityId: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        leftAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Utilisateur non membre ou conditions de sortie non respectées',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          examples: [
            "Vous n'êtes pas membre de cette communauté",
            'Le propriétaire ne peut pas quitter une communauté avec des membres sans désigner un autre admin',
          ],
        },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Communauté non trouvée',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Communauté non trouvée' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async leaveCommunity(
    @Param('id') communityId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    communityId: string;
    userId: string;
    leftAt: string;
  }> {
    try {
      const result = await firstValueFrom(
        this.chatClient.send('community.leave', {
          communityId,
          userId: req.user.id,
          userEmail: req.user.email,
        }),
      );

      return result;
    } catch (error) {
      console.error('Erreur lors de la sortie de la communauté:', error);

      if (error.statusCode) {
        throw new HttpException(error.message, error.statusCode);
      }

      // Map specific errors
      if (
        error.message?.includes('pas membre') ||
        error.message?.includes('not a member')
      ) {
        throw new HttpException(
          "Vous n'êtes pas membre de cette communauté",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        error.message?.includes('propriétaire') ||
        error.message?.includes('owner')
      ) {
        throw new HttpException(
          'Le propriétaire ne peut pas quitter une communauté avec des membres sans désigner un autre admin',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        error.message?.includes('non trouvée') ||
        error.message?.includes('not found')
      ) {
        throw new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'Erreur interne lors de la sortie de la communauté',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupérer la liste des membres d'une communauté
   * Seuls les membres peuvent voir cette liste
   */
  @Get(':id/members')
  @ApiOperation({
    summary: "Lister les membres d'une communauté",
    description:
      "Récupère la liste des membres d'une communauté avec pagination. Seuls les membres de la communauté peuvent accéder à cette liste. Les informations incluent le rôle, la date d'adhésion et le statut en ligne.",
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la communauté',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre maximum de membres à retourner (1-100)',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Nombre de membres à ignorer pour la pagination',
    example: 0,
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['owner', 'admin', 'moderator', 'member'],
    description: 'Filtrer par rôle',
    example: 'member',
  })
  @ApiQuery({
    name: 'isBanned',
    required: false,
    type: Boolean,
    description: 'Filtrer par statut de bannissement',
    example: false,
  })
  @ApiQuery({
    name: 'isOnline',
    required: false,
    type: Boolean,
    description: 'Filtrer par statut en ligne',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des membres récupérée avec succès',
    type: PaginatedMembersDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description:
      'Vous devez être membre de cette communauté pour voir la liste des membres',
  })
  @ApiResponse({
    status: 404,
    description: 'Communauté non trouvée',
  })
  async getCommunityMembers(
    @Param('id') communityId: string,
    @Query() getMembersDto: GetMembersDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaginatedMembersDto> {
    try {
      const userId = req.user.id;

      // Définir l'ID de la communauté dans le DTO
      getMembersDto.communityId = communityId;

      const result = await firstValueFrom(
        this.chatClient.send('community.getMembers', {
          communityId,
          userId,
          getMembersDto,
        }),
      );

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);

      if (error.statusCode) {
        throw new HttpException(error.message, error.statusCode);
      }

      // Map specific errors
      if (
        error.message?.includes('pas membre') ||
        error.message?.includes('not a member') ||
        error.message?.includes('devez être membre')
      ) {
        throw new HttpException(
          'Vous devez être membre de cette communauté pour voir la liste des membres',
          HttpStatus.FORBIDDEN,
        );
      }

      if (
        error.message?.includes('non trouvée') ||
        error.message?.includes('not found')
      ) {
        throw new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'Erreur interne lors de la récupération des membres',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupérer l'historique des messages d'une communauté
   */
  @Get(':id/messages')
  @ApiOperation({
    summary: "Récupérer l'historique des messages d'une communauté",
    description:
      'Permet aux membres de consulter les messages précédents avec pagination cursor-based',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la communauté',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Nombre maximum de messages à retourner',
    required: false,
    example: 50,
  })
  @ApiQuery({
    name: 'cursor',
    description: 'ID du message pour la pagination cursor-based',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiQuery({
    name: 'messageType',
    description: 'Filtrer par type de message',
    required: false,
    enum: ['text', 'image', 'file', 'system'],
  })
  @ApiQuery({
    name: 'userId',
    description: 'Filtrer par utilisateur',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Date de début pour la recherche (ISO 8601)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Date de fin pour la recherche (ISO 8601)',
    required: false,
    example: '2024-12-31T23:59:59.000Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Historique des messages récupéré avec succès',
    type: PaginatedMessagesDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - utilisateur non membre de la communauté',
  })
  @ApiResponse({
    status: 404,
    description: 'Communauté non trouvée',
  })
  async getCommunityMessages(
    @Param('id') communityId: string,
    @Query() query: GetMessagesDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaginatedMessagesDto> {
    try {
      const getMessagesDto = {
        ...query,
        communityId,
        requesterId: req.user.id,
      };

      const result = await firstValueFrom(
        this.chatClient.send('chat.message.get', getMessagesDto),
      );

      return result;
    } catch (error: any) {
      if (
        error.message?.includes('membre') ||
        error.message?.includes('member')
      ) {
        throw new HttpException(
          'Vous devez être membre de cette communauté pour consulter les messages',
          HttpStatus.FORBIDDEN,
        );
      }

      if (
        error.message?.includes('non trouvée') ||
        error.message?.includes('not found')
      ) {
        throw new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'Erreur interne lors de la récupération des messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Get,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
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
      const result = await firstValueFrom(
        this.chatClient.send('community.create', {
          ...createCommunityDto,
          userId: req.user.id,
        }),
      );

      return result;
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
   * Obtenir toutes les communautés publiques
   */
  @Get()
  @ApiOperation({
    summary: 'Obtenir toutes les communautés publiques',
    description:
      'Récupère la liste de toutes les communautés publiques disponibles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des communautés récupérée avec succès',
    type: [CommunityResponseDto],
  })
  async getPublicCommunities(): Promise<CommunityResponseDto[]> {
    try {
      const result = await firstValueFrom(
        this.chatClient.send('community.findPublic', {}),
      );

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des communautés:', error);

      throw new HttpException(
        'Erreur interne lors de la récupération des communautés',
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
}

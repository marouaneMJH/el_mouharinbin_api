import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommunityService } from './community.service';
import {
  CreateCommunityDto,
  CommunityDetailResponseDto,
  CommunityPaginationDto,
  PaginatedCommunitiesDto,
} from '../../../../../libs/contract/dtos/chat';

@Controller()
export class CommunityController {
  private readonly logger = new Logger(CommunityController.name);
  constructor(private readonly communityService: CommunityService) {}

  // ===== GESTIONNAIRES DE MESSAGES RABBITMQ =====

  /**
   * Gestionnaire RabbitMQ pour créer une communauté
   */
  @MessagePattern('community.create')
  async handleCreateCommunity(data: CreateCommunityDto & { userId: string }) {
    this.logger.debug('Creating community with data: ' + JSON.stringify(data));
    try {
      const { userId, ...createCommunityDto } = data;
      this.logger.debug(
        'Creating community with data: ' + JSON.stringify(data),
      );
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
   * Gestionnaire RabbitMQ pour obtenir les communautés publiques avec pagination
   */
  @MessagePattern('community.findPublic')
  async handleFindPublicCommunities(
    data: CommunityPaginationDto & { userId?: string },
  ) {
    try {
      const { userId, ...paginationDto } = data;
      return await this.communityService.findPublicCommunitiesWithPagination(
        paginationDto,
        userId,
      );
    } catch (error) {
      console.error(
        'Erreur RabbitMQ lors de la récupération des communautés publiques:',
        error,
      );
      throw error;
    }
  }

  /**
   * Gestionnaire RabbitMQ pour obtenir les détails d'une communauté
   */
  @MessagePattern('community.findById')
  async handleFindCommunityById(data: {
    id: string;
    userId: string;
  }): Promise<CommunityDetailResponseDto> {
    try {
      return await this.communityService.getCommunityDetails(
        data.id,
        data.userId,
      );
    } catch (error) {
      console.error(
        'Erreur RabbitMQ lors de la récupération des détails de la communauté:',
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

  /**
   * Gestionnaire RabbitMQ pour rejoindre une communauté
   */
  @MessagePattern('community.join')
  async handleJoinCommunity(data: {
    communityId: string;
    userId: string;
    userEmail: string;
  }) {
    try {
      return await this.communityService.joinCommunity(
        data.communityId,
        data.userId,
        data.userEmail,
      );
    } catch (error) {
      console.error(
        'Erreur RabbitMQ lors de la jonction à la communauté:',
        error,
      );
      throw error;
    }
  }

  /**
   * Gestionnaire RabbitMQ pour quitter une communauté
   */
  @MessagePattern('community.leave')
  async handleLeaveCommunity(data: {
    communityId: string;
    userId: string;
    userEmail: string;
  }) {
    try {
      return await this.communityService.leaveCommunity(
        data.communityId,
        data.userId,
        data.userEmail,
      );
    } catch (error) {
      console.error(
        'Erreur RabbitMQ lors de la sortie de la communauté:',
        error,
      );
      throw error;
    }
  }
}

import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../libs/contract/services/prisma.service';
import {
  CreateCommunityDto,
  CommunityResponseDto,
  CommunityDetailResponseDto,
  CommunityPaginationDto,
  PaginatedCommunitiesDto,
  Role,
  GetMembersDto,
  CommunityMemberResponseDto,
  PaginatedMembersDto,
} from '../../../../../libs/contract/dtos/chat';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Convertit un rôle de base de données en enum Role
   */
  private mapDbRoleToEnum(dbRole: string): Role {
    switch (dbRole) {
      case 'member':
        return Role.MEMBER;
      case 'moderator':
        return Role.MODERATOR;
      case 'admin':
        return Role.ADMIN;
      case 'owner':
        return Role.OWNER;
      default:
        return Role.MEMBER;
    }
  }

  /**
   * Créer une nouvelle communauté avec le créateur comme propriétaire
   * @param createCommunityDto - Données de la communauté à créer
   * @param createdBy - ID de l'utilisateur créateur
   * @returns La communauté créée avec les informations du membre
   */
  async createCommunity(
    createCommunityDto: CreateCommunityDto,
    createdBy: string,
  ): Promise<CommunityResponseDto> {
    this.logger.debug(
      'Création de la communauté avec les données:',
      createCommunityDto,
    );
    try {
      // Vérifier si une communauté avec ce nom existe déjà
      const existingCommunity = await this.prisma.community.findUnique({
        where: { name: createCommunityDto.name },
      });

      if (existingCommunity) {
        throw new HttpException(
          'Une communauté avec ce nom existe déjà',
          HttpStatus.CONFLICT,
        );
      }

      // Créer la communauté et le membre propriétaire en une transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Créer la communauté
        const community = await tx.community.create({
          data: {
            name: createCommunityDto.name,
            description: createCommunityDto.description,
            avatarUrl: createCommunityDto.avatarUrl,
            isPublic: createCommunityDto.isPublic ?? true,
            maxMembers: createCommunityDto.maxMembers ?? 1000,
            createdBy,
          },
        });

        // Ajouter le créateur comme membre propriétaire
        await tx.communityMember.create({
          data: {
            communityId: community.id,
            userId: createdBy,
            role: Role.OWNER,
            joinedAt: new Date(),
          },
        });

        // Retourner la communauté avec le compte de membres
        const communityWithMemberCount = await tx.community.findUnique({
          where: { id: community.id },
          include: {
            _count: {
              select: { members: true },
            },
          },
        });

        return communityWithMemberCount;
      });

      // Vérifier que la communauté a été créée
      if (!result) {
        throw new HttpException(
          'Erreur lors de la création de la communauté',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Mapper vers le DTO de réponse
      const response: CommunityResponseDto = {
        id: result.id,
        name: result.name,
        description: result.description || undefined,
        avatarUrl: result.avatarUrl || undefined,
        isPublic: result.isPublic,
        maxMembers: result.maxMembers,
        createdBy: result.createdBy,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        memberCount: result._count.members,
        userRole: Role.OWNER,
        isMember: true,
      };

      return response;
    } catch (error) {
      // Si c'est déjà une HttpException, on la relance
      if (error instanceof HttpException) {
        throw error;
      }

      // Gestion des erreurs Prisma
      if (error.code === 'P2002') {
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

  /**
   * Récupérer une communauté par son ID
   * @param id - ID de la communauté
   * @param userId - ID de l'utilisateur pour vérifier l'appartenance
   * @returns La communauté avec les informations du membre
   */
  async getCommunityById(
    id: string,
    userId?: string,
  ): Promise<CommunityResponseDto> {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
        members: userId
          ? {
              where: { userId },
              select: { role: true },
            }
          : false,
      },
    });

    if (!community) {
      throw new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND);
    }

    const userMember = Array.isArray(community.members)
      ? community.members[0]
      : null;

    const response: CommunityResponseDto = {
      id: community.id,
      name: community.name,
      description: community.description || undefined,
      avatarUrl: community.avatarUrl || undefined,
      isPublic: community.isPublic,
      maxMembers: community.maxMembers,
      createdBy: community.createdBy,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      memberCount: community._count.members,
      userRole: userMember ? this.mapDbRoleToEnum(userMember.role) : undefined,
      isMember: !!userMember,
    };

    return response;
  }

  /**
   * Récupérer les détails complets d'une communauté avec informations du propriétaire
   * @param id - ID de la communauté
   * @param userId - ID de l'utilisateur pour vérifier l'appartenance et les droits d'accès
   * @returns Les détails de la communauté avec informations du propriétaire
   */
  async getCommunityDetails(
    id: string,
    userId: string,
  ): Promise<CommunityDetailResponseDto> {
    // D'abord vérifier si la communauté existe
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    if (!community) {
      throw new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND);
    }

    // Vérifier les droits d'accès pour les communautés privées
    const userMember = Array.isArray(community.members)
      ? community.members[0]
      : null;

    if (!community.isPublic && !userMember) {
      throw new HttpException(
        'Accès refusé à cette communauté privée',
        HttpStatus.FORBIDDEN,
      );
    }

    // Récupérer les informations du propriétaire depuis la base de données
    // Ici on fait une requête pour récupérer les infos basiques du propriétaire
    let owner;
    try {
      // Note: Dans un vrai projet, ceci devrait être fait via un service users
      // ou une API call au microservice users. Pour l'instant, on simule avec des données basiques.
      owner = {
        id: community.createdBy,
        username: `user_${community.createdBy.slice(0, 8)}`, // Simplification temporaire
        email: undefined, // Pas exposé pour la sécurité
        avatarUrl: undefined, // À récupérer depuis le service users
      };
    } catch (error) {
      // Si on ne peut pas récupérer les infos du propriétaire, on met des valeurs par défaut
      owner = {
        id: community.createdBy,
        username: 'Utilisateur inconnu',
        email: undefined,
        avatarUrl: undefined,
      };
    }

    const response: CommunityDetailResponseDto = {
      id: community.id,
      name: community.name,
      description: community.description || undefined,
      avatarUrl: community.avatarUrl || undefined,
      isPublic: community.isPublic,
      maxMembers: community.maxMembers,
      createdBy: community.createdBy,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      memberCount: community._count.members,
      userRole: userMember ? this.mapDbRoleToEnum(userMember.role) : undefined,
      isMember: !!userMember,
      owner,
    };

    return response;
  }

  /**
   * Récupérer toutes les communautés publiques avec pagination
   * @param paginationDto - Paramètres de pagination
   * @param userId - ID de l'utilisateur pour vérifier l'appartenance (optionnel)
   * @returns Liste paginée des communautés publiques
   */
  async findPublicCommunitiesWithPagination(
    paginationDto: CommunityPaginationDto,
    userId?: string,
  ): Promise<PaginatedCommunitiesDto> {
    try {
      const { limit = 20, offset = 0 } = paginationDto;

      // Compter le nombre total de communautés publiques
      const total = await this.prisma.community.count({
        where: {
          isPublic: true,
        },
      });

      // Récupérer les communautés avec pagination
      const communities = await this.prisma.community.findMany({
        where: {
          isPublic: true,
        },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
          // Inclure les informations de membership si un userId est fourni
          ...(userId && {
            members: {
              where: { userId },
              select: { role: true },
            },
          }),
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création descendante
        },
        take: limit,
        skip: offset,
      });

      // Mapper les communautés vers le DTO de réponse
      const communityDtos: CommunityResponseDto[] = communities.map(
        (community) => {
          const userMember =
            userId && Array.isArray(community.members)
              ? community.members[0]
              : null;

          return {
            id: community.id,
            name: community.name,
            description: community.description || undefined,
            avatarUrl: community.avatarUrl || undefined,
            isPublic: community.isPublic,
            maxMembers: community.maxMembers,
            createdBy: community.createdBy,
            createdAt: community.createdAt,
            updatedAt: community.updatedAt,
            memberCount: community._count.members,
            userRole: userMember
              ? this.mapDbRoleToEnum(userMember.role)
              : undefined,
            isMember: !!userMember,
          };
        },
      );

      // Construire la réponse paginée
      const response: PaginatedCommunitiesDto = {
        communities: communityDtos,
        total,
        count: communityDtos.length,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      };

      return response;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des communautés publiques avec pagination:',
        error,
      );
      throw new HttpException(
        'Erreur lors de la récupération des communautés publiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupérer toutes les communautés publiques
   * @returns Liste des communautés publiques
   */
  async findPublicCommunities(): Promise<CommunityResponseDto[]> {
    try {
      const communities = await this.prisma.community.findMany({
        where: {
          isPublic: true,
        },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return communities.map((community) => ({
        id: community.id,
        name: community.name,
        description: community.description || undefined,
        avatarUrl: community.avatarUrl || undefined,
        isPublic: community.isPublic,
        maxMembers: community.maxMembers,
        createdBy: community.createdBy,
        createdAt: community.createdAt,
        updatedAt: community.updatedAt,
        memberCount: community._count.members,
        userRole: undefined, // Non applicable pour les communautés publiques sans contexte utilisateur
        isMember: false, // Non applicable pour les communautés publiques sans contexte utilisateur
      }));
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des communautés publiques:',
        error,
      );
      throw new HttpException(
        'Erreur lors de la récupération des communautés publiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupérer les communautés d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Liste des communautés dont l'utilisateur est membre
   */
  async findCommunitiesByUser(userId: string): Promise<CommunityResponseDto[]> {
    try {
      const communities = await this.prisma.community.findMany({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
          members: {
            where: {
              userId: userId,
            },
            select: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return communities.map((community) => ({
        id: community.id,
        name: community.name,
        description: community.description || undefined,
        avatarUrl: community.avatarUrl || undefined,
        isPublic: community.isPublic,
        maxMembers: community.maxMembers,
        createdBy: community.createdBy,
        createdAt: community.createdAt,
        updatedAt: community.updatedAt,
        memberCount: community._count.members,
        userRole: community.members[0]
          ? this.mapDbRoleToEnum(community.members[0].role)
          : undefined,
        isMember: true, // Forcément true car on filtre par membership
      }));
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des communautés utilisateur:',
        error,
      );
      throw new HttpException(
        'Erreur lors de la récupération des communautés utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Rejoindre une communauté existante
   * @param communityId - ID de la communauté à rejoindre
   * @param userId - ID de l'utilisateur qui veut rejoindre
   * @param userEmail - Email de l'utilisateur (pour l'événement)
   * @returns Informations de membership
   */
  async joinCommunity(
    communityId: string,
    userId: string,
    userEmail: string,
  ): Promise<{
    message: string;
    communityId: string;
    userId: string;
    membershipStatus: string;
    joinedAt: string;
  }> {
    try {
      // Vérifier si la communauté existe
      const community = await this.prisma.community.findUnique({
        where: { id: communityId },
        include: {
          _count: {
            select: { members: true },
          },
        },
      });

      if (!community) {
        throw new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND);
      }

      // Vérifier si l'utilisateur est déjà membre
      const existingMembership = await this.prisma.communityMember.findFirst({
        where: {
          AND: [{ communityId }, { userId }],
        },
      });

      if (existingMembership) {
        throw new HttpException(
          'Vous êtes déjà membre de cette communauté',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Vérifier si la communauté a atteint le nombre maximum de membres
      if (community._count.members >= community.maxMembers) {
        throw new HttpException(
          'La communauté a atteint le nombre maximum de membres',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Créer le membership
      const newMember = await this.prisma.communityMember.create({
        data: {
          userId,
          communityId,
          role: 'member', // Using string literal instead of enum
          joinedAt: new Date(),
        },
      });

      // TODO: Publier l'événement RabbitMQ (chat.user.joined)
      // Cette partie sera implémentée quand le service d'événements sera disponible
      /*
      try {
        await this.eventService.publishUserJoinedEvent({
          communityId,
          userId,
          userEmail,
          communityName: community.name,
          joinedAt: newMember.joinedAt,
        });
      } catch (eventError) {
        console.warn('Erreur lors de la publication de l\'événement:', eventError);
        // Ne pas faire échouer la jonction pour un problème d'événement
      }
      */

      return {
        message: 'Vous avez rejoint la communauté avec succès',
        communityId,
        userId,
        membershipStatus: newMember.role,
        joinedAt: newMember.joinedAt.toISOString(),
      };
    } catch (error) {
      // Re-throw HttpExceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Erreur lors de la jonction à la communauté:', error);
      throw new HttpException(
        'Erreur interne lors de la jonction à la communauté',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Quitter une communauté existante
   * @param communityId - ID de la communauté à quitter
   * @param userId - ID de l'utilisateur qui veut quitter
   * @param userEmail - Email de l'utilisateur (pour l'événement)
   * @returns Informations de sortie
   */
  async leaveCommunity(
    communityId: string,
    userId: string,
    userEmail: string,
  ): Promise<{
    message: string;
    communityId: string;
    userId: string;
    leftAt: string;
  }> {
    try {
      // Vérifier si la communauté existe
      const community = await this.prisma.community.findUnique({
        where: { id: communityId },
        include: {
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
          _count: {
            select: { members: true },
          },
        },
      });

      if (!community) {
        throw new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND);
      }

      // Vérifier si l'utilisateur est membre
      const userMembership = await this.prisma.communityMember.findFirst({
        where: {
          AND: [{ communityId }, { userId }],
        },
      });

      if (!userMembership) {
        throw new HttpException(
          "Vous n'êtes pas membre de cette communauté",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Vérifier les conditions de sortie pour le propriétaire
      if (userMembership.role === 'owner') {
        // Le propriétaire peut quitter si:
        // 1. La communauté est vide (lui seul)
        // 2. Il existe au moins un autre admin

        if (community._count.members > 1) {
          const hasOtherAdmin = community.members.some(
            (member) =>
              member.userId !== userId &&
              (member.role === 'admin' || member.role === 'owner'),
          );

          if (!hasOtherAdmin) {
            throw new HttpException(
              'Le propriétaire ne peut pas quitter une communauté avec des membres sans désigner un autre admin',
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      // Supprimer le membership
      await this.prisma.communityMember.deleteMany({
        where: {
          AND: [{ communityId }, { userId }],
        },
      });

      const leftAt = new Date();

      // TODO: Publier l'événement RabbitMQ (chat.user.left)
      // Cette partie sera implémentée quand le service d'événements sera disponible
      /*
      try {
        await this.eventService.publishUserLeftEvent({
          communityId,
          userId,
          userEmail,
          communityName: community.name,
          leftAt,
          wasOwner: userMembership.role === 'owner',
        });
      } catch (eventError) {
        console.warn('Erreur lors de la publication de l\'événement:', eventError);
        // Ne pas faire échouer la sortie pour un problème d'événement
      }
      */

      return {
        message: 'Vous avez quitté la communauté avec succès',
        communityId,
        userId,
        leftAt: leftAt.toISOString(),
      };
    } catch (error) {
      // Re-throw HttpExceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Erreur lors de la sortie de la communauté:', error);
      throw new HttpException(
        'Erreur interne lors de la sortie de la communauté',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupérer les membres d'une communauté avec pagination
   * @param communityId - ID de la communauté
   * @param userId - ID de l'utilisateur qui fait la demande (pour vérifier l'appartenance)
   * @param getMembersDto - Paramètres de pagination et filtres
   * @returns Liste paginée des membres avec leurs informations
   */
  async getCommunityMembers(
    communityId: string,
    userId: string,
    getMembersDto: GetMembersDto,
  ): Promise<PaginatedMembersDto> {
    try {
      // Vérifier si la communauté existe
      const community = await this.prisma.community.findUnique({
        where: { id: communityId },
      });

      if (!community) {
        throw new HttpException('Communauté non trouvée', HttpStatus.NOT_FOUND);
      }

      // Vérifier si l'utilisateur est membre de la communauté
      const userMembership = await this.prisma.communityMember.findFirst({
        where: {
          AND: [{ communityId }, { userId }],
        },
      });

      if (!userMembership) {
        throw new HttpException(
          'Vous devez être membre de cette communauté pour voir la liste des membres',
          HttpStatus.FORBIDDEN,
        );
      }

      const {
        limit = 50,
        offset = 0,
        role,
        isBanned,
        isOnline,
      } = getMembersDto;

      // Construire les filtres
      const whereClause: any = {
        communityId,
      };

      if (role) {
        whereClause.role = role.toLowerCase();
      }

      if (typeof isBanned === 'boolean') {
        whereClause.isBanned = isBanned;
      }

      // Compter le nombre total de membres avec les filtres
      const total = await this.prisma.communityMember.count({
        where: whereClause,
      });

      // Récupérer les membres avec pagination
      const members = await this.prisma.communityMember.findMany({
        where: whereClause,
        include: {
          // Récupérer les sessions utilisateur pour déterminer le statut en ligne et la dernière activité
          community: {
            select: {
              sessions: {
                where: {
                  userId: { in: [] }, // Will be populated below
                  isActive: true,
                },
                select: {
                  userId: true,
                  lastActivity: true,
                  isActive: true,
                },
              },
            },
          },
        },
        orderBy: [
          { role: 'asc' }, // Propriétaires et admins en premier
          { joinedAt: 'desc' }, // Plus récents en premier
        ],
        take: limit,
        skip: offset,
      });

      // Récupérer les sessions actives pour tous les membres
      const memberUserIds = members.map((member) => member.userId);
      const activeSessions = await this.prisma.userSession.findMany({
        where: {
          userId: { in: memberUserIds },
          isActive: true,
        },
        select: {
          userId: true,
          lastActivity: true,
        },
        orderBy: {
          lastActivity: 'desc',
        },
      });

      // Créer un map pour un accès rapide aux dernières activités
      const lastActivityMap = new Map<string, Date>();
      const onlineUserIds = new Set<string>();

      activeSessions.forEach((session) => {
        if (!lastActivityMap.has(session.userId)) {
          lastActivityMap.set(session.userId, session.lastActivity);
        }
        onlineUserIds.add(session.userId);
      });

      // Mapper les membres vers le DTO de réponse
      const memberDtos: CommunityMemberResponseDto[] = members
        .filter((member) => {
          // Filtrer par statut en ligne si spécifié
          if (typeof isOnline === 'boolean') {
            return isOnline === onlineUserIds.has(member.userId);
          }
          return true;
        })
        .map((member) => ({
          id: member.id,
          communityId: member.communityId,
          userId: member.userId,
          // Note: username et avatarUrl nécessiteraient un join avec la table User
          // Pour l'instant, on les laisse undefined car ils ne sont pas disponibles dans le schéma actuel
          username: undefined,
          avatarUrl: undefined,
          joinedAt: member.joinedAt,
          role: this.mapDbRoleToEnum(member.role),
          isBanned: member.isBanned,
          bannedUntil: member.bannedUntil || undefined,
          isOnline: onlineUserIds.has(member.userId),
          lastActivity: lastActivityMap.get(member.userId),
        }));

      // Construire la réponse paginée
      const response: PaginatedMembersDto = {
        members: memberDtos,
        total,
        count: memberDtos.length,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      };

      return response;
    } catch (error) {
      // Re-throw HttpExceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        'Erreur lors de la récupération des membres de la communauté:',
        error,
      );
      throw new HttpException(
        'Erreur interne lors de la récupération des membres',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

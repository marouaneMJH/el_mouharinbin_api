import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../../../../../libs/contract/services/prisma.service';
import {
  SendMessageDto,
  MessageResponseDto,
  ChatEventType,
  GetMessagesDto,
  PaginatedMessagesDto,
  DeleteMessageDto,
} from '../../../../../libs/contract/dtos/chat';
import {
  MessageCreatedEvent,
  MessageDeletedEvent,
} from '../../../../../libs/contract/interfaces/chat/chat-events.interface';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('CHAT_EVENT_CLIENT') private readonly eventClient: ClientProxy,
  ) {}

  async createSession({
    userId,
    username,
    socketId,
  }: {
    userId: string;
    username: string;
    socketId: string;
  }) {
    // Create or update session for user
    await this.prisma.userSession.upsert({
      where: { id: userId }, // Assuming `id` is the unique field
      update: { username, connectedAt: new Date() },
      create: { userId, username, socketId, connectedAt: new Date() },
    });
  }

  async removeSession(userId: string) {
    await this.prisma.userSession.deleteMany({ where: { userId } });
  }

  test() {
    return 'Chat service is running';
  }

  /**
   * Envoyer un message dans une communauté
   * @param sendMessageDto - Données du message à envoyer
   * @returns Le message créé
   */
  async sendMessage(
    sendMessageDto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    this.logger.debug('Envoi du message avec les données:', {
      ...sendMessageDto,
      content: sendMessageDto.content.substring(0, 50) + '...',
    });

    // Vérifier si l'utilisateur est membre de la communauté
    const membership = await this.prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: sendMessageDto.communityId,
          userId: sendMessageDto.userId,
        },
      },
    });

    if (!membership) {
      this.logger.warn(
        `Tentative d'envoi de message par un non-membre. User: ${sendMessageDto.userId}, Community: ${sendMessageDto.communityId}`,
      );
      throw new HttpException(
        'Vous devez être membre de cette communauté pour envoyer des messages',
        HttpStatus.FORBIDDEN,
      );
    }

    // Vérifier si l'utilisateur est banni
    if (membership.isBanned) {
      const now = new Date();
      if (!membership.bannedUntil || membership.bannedUntil > now) {
        this.logger.warn(
          `Tentative d'envoi de message par un utilisateur banni. User: ${sendMessageDto.userId}`,
        );
        throw new HttpException(
          'Vous êtes banni de cette communauté',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // Vérifier si le message de réponse existe (si spécifié)
    if (sendMessageDto.replyTo) {
      const replyMessage = await this.prisma.message.findFirst({
        where: {
          id: sendMessageDto.replyTo,
          communityId: sendMessageDto.communityId,
          deletedAt: null,
        },
      });

      if (!replyMessage) {
        throw new HttpException(
          "Le message auquel vous tentez de répondre n'existe pas",
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Créer le message en base de données
    const message = await this.prisma.message.create({
      data: {
        communityId: sendMessageDto.communityId,
        userId: sendMessageDto.userId,
        username: sendMessageDto.username,
        content: sendMessageDto.content,
        messageType: sendMessageDto.messageType || 'text',
        replyTo: sendMessageDto.replyTo,
      },
      include: {
        replyMessage: {
          include: {
            replyMessage: false, // Éviter la récursion infinie
          },
        },
      },
    });

    this.logger.log(
      `Message créé avec succès. ID: ${message.id}, Community: ${message.communityId}`,
    );

    // Créer l'objet de réponse
    const messageResponse: MessageResponseDto = {
      id: message.id,
      communityId: message.communityId,
      userId: message.userId,
      username: message.username,
      content: message.content,
      messageType: message.messageType as any,
      replyTo: message.replyTo || undefined,
      replyMessage: message.replyMessage
        ? {
            id: message.replyMessage.id,
            communityId: message.replyMessage.communityId,
            userId: message.replyMessage.userId,
            username: message.replyMessage.username,
            content: message.replyMessage.content,
            messageType: message.replyMessage.messageType as any,
            replyTo: message.replyMessage.replyTo || undefined,
            editedAt: message.replyMessage.editedAt || undefined,
            createdAt: message.replyMessage.createdAt,
            updatedAt: message.replyMessage.updatedAt,
            deletedAt: message.replyMessage.deletedAt || undefined,
            isEdited: !!message.replyMessage.editedAt,
            isDeleted: !!message.replyMessage.deletedAt,
          }
        : undefined,
      editedAt: message.editedAt || undefined,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt || undefined,
      isEdited: !!message.editedAt,
      isDeleted: !!message.deletedAt,
    };

    // Publier l'événement de création de message
    const messageCreatedEvent: MessageCreatedEvent = {
      eventType: ChatEventType.MESSAGE_CREATED,
      timestamp: new Date(),
      userId: message.userId,
      communityId: message.communityId,
      message: messageResponse,
      metadata: {
        messageType: message.messageType,
        hasReply: !!message.replyTo,
      },
    };

    try {
      // Publier l'événement via RabbitMQ
      this.eventClient.emit('chat.message.created', messageCreatedEvent);
      this.logger.debug(
        `Événement 'chat.message.created' publié pour le message ${message.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la publication de l'événement pour le message ${message.id}:`,
        error,
      );
      // Ne pas faire échouer la création du message si l'événement échoue
    }

    return messageResponse;
  }

  /**
   * Récupérer l'historique des messages d'une communauté avec pagination cursor-based
   * @param getMessagesDto - Paramètres de récupération des messages
   * @param userId - ID de l'utilisateur qui fait la demande
   * @returns Liste paginée des messages
   */
  async getMessages(
    getMessagesDto: GetMessagesDto,
    userId: string,
  ): Promise<PaginatedMessagesDto> {
    this.logger.debug('Récupération des messages avec les paramètres:', {
      ...getMessagesDto,
      userId,
    });

    // Vérifier si l'utilisateur est membre de la communauté
    const membership = await this.prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: getMessagesDto.communityId,
          userId: userId,
        },
      },
    });

    if (!membership) {
      this.logger.warn(
        `Tentative d'accès à l'historique par un non-membre. User: ${userId}, Community: ${getMessagesDto.communityId}`,
      );
      throw new HttpException(
        'Vous devez être membre de cette communauté pour consulter les messages',
        HttpStatus.FORBIDDEN,
      );
    }

    const limit = getMessagesDto.limit || 50;
    const cursorCondition = getMessagesDto.cursor
      ? {
          id: {
            lt: getMessagesDto.cursor,
          },
        }
      : {};

    // Construire les filtres
    const where: any = {
      communityId: getMessagesDto.communityId,
      deletedAt: null, // Exclure les messages supprimés
      ...cursorCondition,
    };

    // Ajouter des filtres optionnels
    if (getMessagesDto.messageType) {
      where.messageType = getMessagesDto.messageType;
    }

    if (getMessagesDto.userId) {
      where.userId = getMessagesDto.userId;
    }

    if (getMessagesDto.startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(getMessagesDto.startDate),
      };
    }

    if (getMessagesDto.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(getMessagesDto.endDate),
      };
    }

    // Récupérer les messages avec un message de plus pour déterminer s'il y a une page suivante
    const messages = await this.prisma.message.findMany({
      where,
      include: {
        replyMessage: {
          select: {
            id: true,
            userId: true,
            username: true,
            content: true,
            messageType: true,
            createdAt: true,
            deletedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1, // +1 pour déterminer hasNextPage
    });

    // Séparer les messages à retourner et vérifier s'il y a une page suivante
    const hasNextPage = messages.length > limit;
    const messagesToReturn = hasNextPage ? messages.slice(0, limit) : messages;

    // Vérifier s'il y a une page précédente
    const hasPrevPage = !!getMessagesDto.cursor;

    // Déterminer les curseurs pour la navigation
    const nextCursor = hasNextPage
      ? messagesToReturn[messagesToReturn.length - 1]?.id
      : undefined;
    const prevCursor =
      messagesToReturn.length > 0 ? messagesToReturn[0]?.id : undefined;

    // Transformer les messages en DTOs
    const messageResponses: MessageResponseDto[] = messagesToReturn.map(
      (message) => ({
        id: message.id,
        communityId: message.communityId,
        userId: message.userId,
        username: message.username,
        content: message.content,
        messageType: message.messageType as any,
        replyTo: message.replyTo || undefined,
        replyMessage: message.replyMessage
          ? {
              id: message.replyMessage.id,
              communityId: message.communityId,
              userId: message.replyMessage.userId,
              username: message.replyMessage.username,
              content: message.replyMessage.content,
              messageType: message.replyMessage.messageType as any,
              replyTo: undefined,
              editedAt: undefined,
              createdAt: message.replyMessage.createdAt,
              updatedAt: message.replyMessage.createdAt,
              deletedAt: message.replyMessage.deletedAt || undefined,
              isEdited: false,
              isDeleted: !!message.replyMessage.deletedAt,
            }
          : undefined,
        editedAt: message.editedAt || undefined,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        deletedAt: message.deletedAt || undefined,
        isEdited: !!message.editedAt,
        isDeleted: !!message.deletedAt,
      }),
    );

    this.logger.log(
      `Récupération de ${messageResponses.length} messages pour la communauté ${getMessagesDto.communityId}`,
    );

    return {
      messages: messageResponses,
      hasNextPage,
      hasPrevPage,
      nextCursor,
      prevCursor,
      count: messageResponses.length,
      limit,
    };
  }

  /**
   * Supprimer un message (soft delete)
   * @param deleteMessageDto - Données de suppression du message
   * @returns Le message supprimé
   */
  async deleteMessage(
    deleteMessageDto: DeleteMessageDto,
  ): Promise<MessageResponseDto> {
    this.logger.debug('Suppression du message avec les données:', {
      ...deleteMessageDto,
      reason: deleteMessageDto.reason?.substring(0, 50) + '...',
    });

    // Récupérer le message à supprimer
    const message = await this.prisma.message.findUnique({
      where: {
        id: deleteMessageDto.messageId,
      },
      include: {
        replyMessage: {
          select: {
            id: true,
            userId: true,
            username: true,
            content: true,
            messageType: true,
            createdAt: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!message) {
      this.logger.warn(
        `Tentative de suppression d'un message inexistant. Message ID: ${deleteMessageDto.messageId}`,
      );
      throw new HttpException('Message non trouvé', HttpStatus.NOT_FOUND);
    }

    // Vérifier si le message est déjà supprimé
    if (message.deletedAt) {
      this.logger.warn(
        `Tentative de suppression d'un message déjà supprimé. Message ID: ${deleteMessageDto.messageId}`,
      );
      throw new HttpException(
        'Ce message a déjà été supprimé',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Vérifier les permissions : auteur ou modérateur/admin
    const isAuthor = message.userId === deleteMessageDto.deletedBy;

    if (!isAuthor) {
      // Si ce n'est pas l'auteur, vérifier si c'est un modérateur/admin de la communauté
      const membership = await this.prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: message.communityId,
            userId: deleteMessageDto.deletedBy,
          },
        },
      });

      if (!membership) {
        this.logger.warn(
          `Tentative de suppression par un non-membre. User: ${deleteMessageDto.deletedBy}, Message: ${deleteMessageDto.messageId}`,
        );
        throw new HttpException(
          'Vous devez être membre de cette communauté',
          HttpStatus.FORBIDDEN,
        );
      }

      // Vérifier si l'utilisateur a les permissions de modération
      const hasModeratorPermissions =
        membership.role === 'moderator' ||
        membership.role === 'admin' ||
        membership.role === 'owner';

      if (!hasModeratorPermissions) {
        this.logger.warn(
          `Tentative de suppression sans permissions suffisantes. User: ${deleteMessageDto.deletedBy}, Role: ${membership.role}`,
        );
        throw new HttpException(
          "Vous n'avez pas les permissions pour supprimer ce message",
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // Effectuer la suppression logique (soft delete)
    const deletedMessage = await this.prisma.message.update({
      where: {
        id: deleteMessageDto.messageId,
      },
      data: {
        deletedAt: new Date(),
        // Optionnel : stocker qui a supprimé et pourquoi dans un champ metadata
        content: message.content, // Garder le contenu original pour les logs
      },
      include: {
        replyMessage: {
          select: {
            id: true,
            userId: true,
            username: true,
            content: true,
            messageType: true,
            createdAt: true,
            deletedAt: true,
          },
        },
      },
    });

    this.logger.log(
      `Message supprimé avec succès. ID: ${deletedMessage.id}, Supprimé par: ${deleteMessageDto.deletedBy}`,
    );

    // Créer l'objet de réponse
    const messageResponse: MessageResponseDto = {
      id: deletedMessage.id,
      communityId: deletedMessage.communityId,
      userId: deletedMessage.userId,
      username: deletedMessage.username,
      content: deletedMessage.content,
      messageType: deletedMessage.messageType as any,
      replyTo: deletedMessage.replyTo || undefined,
      replyMessage: deletedMessage.replyMessage
        ? {
            id: deletedMessage.replyMessage.id,
            communityId: deletedMessage.communityId,
            userId: deletedMessage.replyMessage.userId,
            username: deletedMessage.replyMessage.username,
            content: deletedMessage.replyMessage.content,
            messageType: deletedMessage.replyMessage.messageType as any,
            replyTo: undefined,
            editedAt: undefined,
            createdAt: deletedMessage.replyMessage.createdAt,
            updatedAt: deletedMessage.replyMessage.createdAt,
            deletedAt: deletedMessage.replyMessage.deletedAt || undefined,
            isEdited: false,
            isDeleted: !!deletedMessage.replyMessage.deletedAt,
          }
        : undefined,
      editedAt: deletedMessage.editedAt || undefined,
      createdAt: deletedMessage.createdAt,
      updatedAt: deletedMessage.updatedAt,
      deletedAt: deletedMessage.deletedAt || undefined,
      isEdited: !!deletedMessage.editedAt,
      isDeleted: !!deletedMessage.deletedAt,
    };

    // Publier l'événement de suppression de message
    const messageDeletedEvent: MessageDeletedEvent = {
      eventType: ChatEventType.MESSAGE_DELETED,
      timestamp: new Date(),
      userId: deletedMessage.userId,
      communityId: deletedMessage.communityId,
      messageId: deletedMessage.id,
      deletedBy: deleteMessageDto.deletedBy,
      metadata: {
        reason: deleteMessageDto.reason,
        deletedByUsername: deleteMessageDto.deletedByUsername,
        wasAuthorDeletion: isAuthor,
        originalContent: deletedMessage.content,
      },
    };

    try {
      // Publier l'événement via RabbitMQ
      this.eventClient.emit('chat.message.deleted', messageDeletedEvent);
      this.logger.debug(
        `Événement 'chat.message.deleted' publié pour le message ${deletedMessage.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la publication de l'événement pour le message supprimé ${deletedMessage.id}:`,
        error,
      );
      // Ne pas faire échouer la suppression si l'événement échoue
    }

    return messageResponse;
  }
}

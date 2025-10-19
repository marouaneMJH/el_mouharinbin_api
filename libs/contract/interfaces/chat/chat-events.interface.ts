import { MessageResponseDto } from '../../dtos/chat/message.dto';
import { CommunityResponseDto } from '../../dtos/chat/community.dto';
import { CommunityMemberResponseDto } from '../../dtos/chat/member.dto';
import { UserSessionResponseDto } from '../../dtos/chat/session.dto';
import {
  ChatEventType,
  Role,
  MessageType,
  ConnectionStatus,
} from '../../enums/chat.enum';

/**
 * Interface de base pour tous les événements RabbitMQ du chat
 */
export interface BaseChatEvent {
  /**
   * Type d'événement
   */
  eventType: ChatEventType;

  /**
   * Timestamp de l'événement
   */
  timestamp: Date;

  /**
   * ID de l'utilisateur qui a déclenché l'événement
   */
  userId: string;

  /**
   * ID de la communauté concernée (optionnel)
   */
  communityId?: string;

  /**
   * Métadonnées additionnelles
   */
  metadata?: Record<string, any>;
}

/**
 * Événement de création de message
 */
export interface MessageCreatedEvent extends BaseChatEvent {
  eventType: ChatEventType.MESSAGE_CREATED;
  message: MessageResponseDto;
  communityId: string;
}

/**
 * Événement de mise à jour de message
 */
export interface MessageUpdatedEvent extends BaseChatEvent {
  eventType: ChatEventType.MESSAGE_UPDATED;
  message: MessageResponseDto;
  previousContent: string;
  communityId: string;
}

/**
 * Événement de suppression de message
 */
export interface MessageDeletedEvent extends BaseChatEvent {
  eventType: ChatEventType.MESSAGE_DELETED;
  messageId: string;
  communityId: string;
  deletedBy: string;
}

/**
 * Événement d'utilisateur qui rejoint une communauté
 */
export interface UserJoinedEvent extends BaseChatEvent {
  eventType: ChatEventType.USER_JOINED;
  member: CommunityMemberResponseDto;
  communityId: string;
  invitedBy?: string;
}

/**
 * Événement d'utilisateur qui quitte une communauté
 */
export interface UserLeftEvent extends BaseChatEvent {
  eventType: ChatEventType.USER_LEFT;
  memberId: string;
  username: string;
  communityId: string;
  reason?: 'voluntary' | 'banned' | 'kicked';
}

/**
 * Événement d'utilisateur qui commence à écrire
 */
export interface UserTypingEvent extends BaseChatEvent {
  eventType: ChatEventType.USER_TYPING;
  username: string;
  communityId: string;
}

/**
 * Événement d'utilisateur qui arrête d'écrire
 */
export interface UserStopTypingEvent extends BaseChatEvent {
  eventType: ChatEventType.USER_STOP_TYPING;
  username: string;
  communityId: string;
}

/**
 * Événement de changement de statut utilisateur
 */
export interface UserStatusChangedEvent extends BaseChatEvent {
  eventType: ChatEventType.USER_STATUS_CHANGED;
  username: string;
  previousStatus: ConnectionStatus;
  newStatus: ConnectionStatus;
  communityId?: string;
}

/**
 * Union de tous les types d'événements chat
 */
export type ChatEvent =
  | MessageCreatedEvent
  | MessageUpdatedEvent
  | MessageDeletedEvent
  | UserJoinedEvent
  | UserLeftEvent
  | UserTypingEvent
  | UserStopTypingEvent
  | UserStatusChangedEvent;

/**
 * Patterns RabbitMQ pour les événements chat
 */
export const CHAT_MESSAGE_PATTERNS = {
  // Messages
  SEND_MESSAGE: 'chat.message.send',
  CREATE_MESSAGE: 'chat.message.create',
  UPDATE_MESSAGE: 'chat.message.update',
  DELETE_MESSAGE: 'chat.message.delete',
  GET_MESSAGES: 'chat.message.get',
  SEARCH_MESSAGES: 'chat.message.search',

  // Communautés
  CREATE_COMMUNITY: 'chat.community.create',
  UPDATE_COMMUNITY: 'chat.community.update',
  DELETE_COMMUNITY: 'chat.community.delete',
  GET_COMMUNITY: 'chat.community.get',
  SEARCH_COMMUNITIES: 'chat.community.search',

  // Membres
  JOIN_COMMUNITY: 'chat.member.join',
  LEAVE_COMMUNITY: 'chat.member.leave',
  UPDATE_MEMBER_ROLE: 'chat.member.update_role',
  BAN_MEMBER: 'chat.member.ban',
  UNBAN_MEMBER: 'chat.member.unban',
  GET_MEMBERS: 'community.getMembers',

  // Sessions
  CONNECT_SOCKET: 'chat.session.connect',
  DISCONNECT_SOCKET: 'chat.session.disconnect',
  UPDATE_STATUS: 'chat.session.update_status',
  GET_ACTIVE_SESSIONS: 'chat.session.get_active',
  USER_ACTIVITY: 'chat.session.activity',

  // Événements temps réel
  BROADCAST_EVENT: 'chat.event.broadcast',
  ROOM_EVENT: 'chat.event.room',
} as const;

/**
 * Interface pour les réponses RabbitMQ standardisées
 */
export interface ChatServiceResponse<T = any> {
  /**
   * Succès de l'opération
   */
  success: boolean;

  /**
   * Données de réponse
   */
  data?: T;

  /**
   * Message d'erreur (si échec)
   */
  error?: string;

  /**
   * Code d'erreur (si échec)
   */
  errorCode?: string;

  /**
   * Métadonnées additionnelles
   */
  metadata?: Record<string, any>;
}

/**
 * Interface pour les requêtes avec pagination
 */
export interface PaginatedRequest {
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Interface pour les réponses paginées
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
  limit: number;
  offset: number;
}

/**
 * Interface pour les événements WebSocket
 */
export interface WebSocketEvent {
  /**
   * Type d'événement WebSocket
   */
  type: string;

  /**
   * Données de l'événement
   */
  data: any;

  /**
   * ID de la room/communauté (optionnel)
   */
  room?: string;

  /**
   * ID de l'utilisateur émetteur
   */
  userId?: string;

  /**
   * Timestamp
   */
  timestamp: Date;
}

/**
 * Interface pour les notifications push
 */
export interface ChatNotification {
  /**
   * Type de notification
   */
  type: 'message' | 'mention' | 'community_invite' | 'role_update' | 'system';

  /**
   * Titre de la notification
   */
  title: string;

  /**
   * Corps de la notification
   */
  body: string;

  /**
   * ID de l'utilisateur destinataire
   */
  userId: string;

  /**
   * ID de la communauté (si applicable)
   */
  communityId?: string;

  /**
   * Données additionnelles
   */
  data?: Record<string, any>;

  /**
   * Priorité (high, normal, low)
   */
  priority?: 'high' | 'normal' | 'low';
}

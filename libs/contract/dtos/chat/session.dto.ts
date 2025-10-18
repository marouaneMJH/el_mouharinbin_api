import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConnectionStatus } from '../../enums/chat.enum';

/**
 * DTO pour connecter un socket utilisateur
 */
export class ConnectSocketDto {
  /**
   * ID de l'utilisateur qui se connecte
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide" })
  @IsNotEmpty()
  userId: string;

  /**
   * Nom d'utilisateur
   * @example "john_doe"
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(2, {
    message: "Le nom d'utilisateur doit contenir au moins 2 caractères",
  })
  @MaxLength(100, {
    message: "Le nom d'utilisateur ne peut pas dépasser 100 caractères",
  })
  username: string;

  /**
   * ID de la socket
   * @example "socket_123456789"
   */
  @IsString()
  @IsNotEmpty()
  socketId: string;

  /**
   * ID de la communauté (optionnel si connexion globale)
   * @example "123e4567-e89b-12d3-a456-426614174001"
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsOptional()
  communityId?: string;
}

/**
 * DTO pour déconnecter un socket utilisateur
 */
export class DisconnectSocketDto {
  /**
   * ID de la socket à déconnecter
   */
  @IsString()
  @IsNotEmpty()
  socketId: string;

  /**
   * ID de l'utilisateur (optionnel pour validation)
   */
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide" })
  @IsOptional()
  userId?: string;
}

/**
 * DTO pour mettre à jour le statut de connexion
 */
export class UpdateConnectionStatusDto {
  /**
   * Nouveau statut de connexion
   */
  @IsEnum(ConnectionStatus, { message: 'Statut de connexion invalide' })
  @IsNotEmpty()
  status: ConnectionStatus;

  /**
   * ID de la communauté (optionnel)
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsOptional()
  communityId?: string;
}

/**
 * DTO de réponse pour une session utilisateur
 */
export class UserSessionResponseDto {
  /**
   * Identifiant unique de la session
   */
  id: string;

  /**
   * ID de l'utilisateur
   */
  userId: string;

  /**
   * Nom d'utilisateur
   */
  username: string;

  /**
   * ID de la socket
   */
  socketId: string;

  /**
   * ID de la communauté (si applicable)
   */
  communityId?: string;

  /**
   * Date de connexion
   */
  connectedAt: Date;

  /**
   * Dernière activité
   */
  lastActivity: Date;

  /**
   * Statut de connexion actuel
   */
  isActive: boolean;

  /**
   * Statut de présence
   */
  connectionStatus?: ConnectionStatus;
}

/**
 * DTO pour obtenir les sessions actives
 */
export class GetActiveSessionsDto {
  /**
   * ID de la communauté (optionnel pour sessions globales)
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsOptional()
  communityId?: string;

  /**
   * Filtrer par statut de connexion
   */
  @IsEnum(ConnectionStatus, { message: 'Statut de connexion invalide' })
  @IsOptional()
  status?: ConnectionStatus;

  /**
   * Filtrer par utilisateur spécifique
   */
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide" })
  @IsOptional()
  userId?: string;

  /**
   * Inclure uniquement les sessions actives
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  activeOnly?: boolean = true;
}

/**
 * DTO pour signaler une activité utilisateur
 */
export class UserActivityDto {
  /**
   * Type d'activité
   */
  @IsString()
  @IsNotEmpty()
  activityType: 'typing' | 'stop_typing' | 'message_read' | 'presence_update';

  /**
   * ID de la communauté où l'activité a lieu
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsOptional()
  communityId?: string;

  /**
   * Données additionnelles pour l'activité
   */
  @IsOptional()
  metadata?: {
    messageId?: string;
    targetUserId?: string;
    [key: string]: any;
  };
}

/**
 * DTO pour les statistiques de sessions
 */
export class SessionStatsDto {
  /**
   * Nombre total de sessions actives
   */
  totalActiveSessions: number;

  /**
   * Sessions par communauté
   */
  sessionsByCommunity: Record<string, number>;

  /**
   * Sessions par statut
   */
  sessionsByStatus: {
    [ConnectionStatus.ONLINE]: number;
    [ConnectionStatus.AWAY]: number;
    [ConnectionStatus.OFFLINE]: number;
  };

  /**
   * Durée moyenne des sessions (en minutes)
   */
  averageSessionDuration: number;

  /**
   * Pic de connexions simultanées aujourd'hui
   */
  peakConcurrentSessions: number;
}

/**
 * DTO pour rejoindre/quitter une communauté via socket
 */
export class JoinLeaveRoomDto {
  /**
   * ID de la communauté
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsNotEmpty()
  communityId: string;

  /**
   * Action à effectuer
   */
  @IsString()
  @IsNotEmpty()
  action: 'join' | 'leave';
}

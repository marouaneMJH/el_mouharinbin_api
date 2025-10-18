import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../../enums/chat.enum';

/**
 * DTO pour créer un nouveau message
 */
export class CreateMessageDto {
  /**
   * ID de la communauté où envoyer le message
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsNotEmpty()
  communityId: string;

  /**
   * Contenu du message
   * @example "Bonjour tout le monde !"
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Le message ne peut pas être vide' })
  @MaxLength(2000, {
    message: 'Le message ne peut pas dépasser 2000 caractères',
  })
  content: string;

  /**
   * Type de message
   * @default MessageType.TEXT
   */
  @IsEnum(MessageType, { message: 'Type de message invalide' })
  @IsOptional()
  messageType?: MessageType = MessageType.TEXT;

  /**
   * ID du message auquel ce message répond (optionnel)
   * @example "123e4567-e89b-12d3-a456-426614174001"
   */
  @IsUUID('4', {
    message: "L'ID du message de réponse doit être un UUID valide",
  })
  @IsOptional()
  replyTo?: string;
}

/**
 * DTO pour mettre à jour un message existant
 */
export class UpdateMessageDto {
  /**
   * Nouveau contenu du message
   * @example "Message modifié"
   */
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Le message ne peut pas être vide' })
  @MaxLength(2000, {
    message: 'Le message ne peut pas dépasser 2000 caractères',
  })
  content?: string;

  /**
   * Nouveau type de message
   */
  @IsEnum(MessageType, { message: 'Type de message invalide' })
  @IsOptional()
  messageType?: MessageType;
}

/**
 * DTO de réponse pour un message
 */
export class MessageResponseDto {
  /**
   * Identifiant unique du message
   */
  id: string;

  /**
   * ID de la communauté
   */
  communityId: string;

  /**
   * ID de l'utilisateur qui a envoyé le message
   */
  userId: string;

  /**
   * Nom d'utilisateur de l'expéditeur
   */
  username: string;

  /**
   * Contenu du message
   */
  content: string;

  /**
   * Type de message
   */
  messageType: MessageType;

  /**
   * ID du message auquel celui-ci répond
   */
  replyTo?: string;

  /**
   * Message auquel celui-ci répond (si applicable)
   */
  replyMessage?: MessageResponseDto;

  /**
   * Date de modification (si modifié)
   */
  editedAt?: Date;

  /**
   * Date de création
   */
  createdAt: Date;

  /**
   * Date de dernière mise à jour
   */
  updatedAt: Date;

  /**
   * Date de suppression (si supprimé)
   */
  deletedAt?: Date;

  /**
   * Indique si le message a été modifié
   */
  isEdited?: boolean;

  /**
   * Indique si le message a été supprimé
   */
  isDeleted?: boolean;

  /**
   * Nombre de réponses à ce message
   */
  replyCount?: number;
}

/**
 * DTO pour les filtres de récupération des messages
 */
export class GetMessagesDto {
  /**
   * ID de la communauté
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsNotEmpty()
  communityId: string;

  /**
   * Nombre maximum de messages à retourner
   */
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;

  /**
   * ID du message à partir duquel commencer (pour la pagination)
   */
  @IsUUID('4', { message: "L'ID du curseur doit être un UUID valide" })
  @IsOptional()
  cursor?: string;

  /**
   * Filtrer par type de message
   */
  @IsEnum(MessageType, { message: 'Type de message invalide' })
  @IsOptional()
  messageType?: MessageType;

  /**
   * Filtrer par utilisateur
   */
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide" })
  @IsOptional()
  userId?: string;

  /**
   * Date de début pour la recherche
   */
  @IsDateString({}, { message: 'La date de début doit être valide' })
  @IsOptional()
  startDate?: string;

  /**
   * Date de fin pour la recherche
   */
  @IsDateString({}, { message: 'La date de fin doit être valide' })
  @IsOptional()
  endDate?: string;
}

/**
 * DTO pour la recherche de messages
 */
export class SearchMessagesDto {
  /**
   * ID de la communauté où chercher
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsNotEmpty()
  communityId: string;

  /**
   * Terme de recherche
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(2, {
    message: 'Le terme de recherche doit contenir au moins 2 caractères',
  })
  @MaxLength(100, {
    message: 'Le terme de recherche ne peut pas dépasser 100 caractères',
  })
  query: string;

  /**
   * Nombre maximum de résultats
   */
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  /**
   * Décalage pour la pagination
   */
  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;
}

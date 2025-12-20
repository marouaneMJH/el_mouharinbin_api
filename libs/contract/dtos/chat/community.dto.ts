import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../enums/chat.enum';

/**
 * DTO pour créer une nouvelle communauté
 */
export class CreateCommunityDto {
  /**
   * Nom de la communauté (unique)
   * @example "No Fap Support Group"
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Le nom doit contenir au moins 3 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  name: string;

  /**
   * Description optionnelle de la communauté
   * @example "Une communauté de soutien pour les personnes en sevrage"
   */
  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'La description ne peut pas dépasser 500 caractères',
  })
  description?: string;

  /**
   * URL de l'avatar de la communauté
   * @example "https://example.com/avatar.jpg"
   */
  @IsUrl({}, { message: "L'URL de l'avatar doit être valide" })
  @IsOptional()
  @MaxLength(500, { message: "L'URL ne peut pas dépasser 500 caractères" })
  avatarUrl?: string;

  /**
   * Indique si la communauté est publique
   * @default true
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublic?: boolean = true;

  /**
   * Nombre maximum de membres autorisés
   * @default 1000
   */
  @IsInt()
  @IsOptional()
  @Min(2, { message: 'Une communauté doit avoir au moins 2 membres' })
  @Max(10000, {
    message: 'Une communauté ne peut pas avoir plus de 10000 membres',
  })
  @Type(() => Number)
  maxMembers?: number = 1000;
}

/**
 * DTO pour mettre à jour une communauté existante
 */
export class UpdateCommunityDto {
  /**
   * Nouveau nom de la communauté
   * @example "Support Group Updated"
   */
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Le nom doit contenir au moins 3 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  name?: string;

  /**
   * Nouvelle description
   */
  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'La description ne peut pas dépasser 500 caractères',
  })
  description?: string;

  /**
   * Nouvelle URL d'avatar
   */
  @IsUrl({}, { message: "L'URL de l'avatar doit être valide" })
  @IsOptional()
  @MaxLength(500, { message: "L'URL ne peut pas dépasser 500 caractères" })
  avatarUrl?: string;

  /**
   * Mise à jour du statut public/privé
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublic?: boolean;

  /**
   * Nouveau nombre maximum de membres
   */
  @IsInt()
  @IsOptional()
  @Min(2, { message: 'Une communauté doit avoir au moins 2 membres' })
  @Max(10000, {
    message: 'Une communauté ne peut pas avoir plus de 10000 membres',
  })
  @Type(() => Number)
  maxMembers?: number;
}

/**
 * DTO de réponse pour une communauté
 */
export class CommunityResponseDto {
  /**
   * Identifiant unique de la communauté
   */
  id: string;

  /**
   * Nom de la communauté
   */
  name: string;

  /**
   * Description de la communauté
   */
  description?: string;

  /**
   * URL de l'avatar
   */
  avatarUrl?: string;

  /**
   * Statut public/privé
   */
  isPublic: boolean;

  /**
   * Nombre maximum de membres
   */
  maxMembers: number;

  /**
   * ID du créateur de la communauté
   */
  createdBy: string;

  /**
   * Date de création
   */
  createdAt: Date;

  /**
   * Date de dernière mise à jour
   */
  updatedAt: Date;

  /**
   * Nombre actuel de membres
   */
  memberCount?: number;

  /**
   * Rôle de l'utilisateur actuel dans cette communauté
   */
  userRole?: Role;

  /**
   * Indique si l'utilisateur actuel est membre
   */
  isMember?: boolean;
}

/**
 * DTO de réponse détaillée pour une communauté avec informations du propriétaire
 */
export class CommunityDetailResponseDto extends CommunityResponseDto {
  /**
   * Informations du propriétaire de la communauté
   */
  owner: {
    id: string;
    username: string;
    email?: string;
    avatarUrl?: string;
  };
}

/**
 * DTO pour les filtres de recherche de communautés
 */
export class CommunitySearchDto {
  /**
   * Terme de recherche pour le nom ou la description
   */
  @IsString()
  @IsOptional()
  @MinLength(2, {
    message: 'Le terme de recherche doit contenir au moins 2 caractères',
  })
  search?: string;

  /**
   * Filtrer par statut public/privé
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublic?: boolean;

  /**
   * Nombre maximum de résultats
   */
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  /**
   * Décalage pour la pagination
   */
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

/**
 * DTO pour les paramètres de pagination des communautés
 */
export class CommunityPaginationDto {
  /**
   * Nombre maximum de résultats par page
   * @default 20
   */
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'La limite doit être au moins 1' })
  @Max(100, { message: 'La limite ne peut pas dépasser 100' })
  @Type(() => Number)
  limit?: number = 20;

  /**
   * Décalage pour la pagination (nombre d'éléments à ignorer)
   * @default 0
   */
  @IsInt()
  @IsOptional()
  @Min(0, { message: "L'offset doit être positif ou nul" })
  @Type(() => Number)
  offset?: number = 0;
}

/**
 * DTO de réponse paginée pour les communautés
 */
export class PaginatedCommunitiesDto {
  /**
   * Liste des communautés
   */
  communities: CommunityResponseDto[];

  /**
   * Nombre total de communautés disponibles
   */
  total: number;

  /**
   * Nombre de communautés dans cette page
   */
  count: number;

  /**
   * Limite utilisée pour cette requête
   */
  limit: number;

  /**
   * Offset utilisé pour cette requête
   */
  offset: number;

  /**
   * Indique s'il y a une page suivante
   */
  hasNext: boolean;

  /**
   * Indique s'il y a une page précédente
   */
  hasPrevious: boolean;
}

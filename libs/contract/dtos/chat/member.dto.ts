import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../enums/chat.enum';

/**
 * DTO pour rejoindre une communauté
 */
export class JoinCommunityDto {
  /**
   * ID de la communauté à rejoindre
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsNotEmpty()
  communityId: string;
}

/**
 * DTO pour mettre à jour un membre de communauté
 */
export class UpdateMemberDto {
  /**
   * Nouveau rôle du membre
   */
  @IsEnum(Role, { message: 'Rôle invalide' })
  @IsOptional()
  role?: Role;

  /**
   * Statut de bannissement
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isBanned?: boolean;

  /**
   * Date de fin de bannissement (si applicable)
   */
  @IsDateString(
    {},
    { message: 'La date de fin de bannissement doit être valide' },
  )
  @IsOptional()
  bannedUntil?: string;
}

/**
 * DTO de réponse pour un membre de communauté
 */
export class CommunityMemberResponseDto {
  /**
   * Identifiant unique du membre
   */
  id: string;

  /**
   * ID de la communauté
   */
  communityId: string;

  /**
   * ID de l'utilisateur
   */
  userId: string;

  /**
   * Nom d'utilisateur
   */
  username?: string;

  /**
   * Avatar de l'utilisateur
   */
  avatarUrl?: string;

  /**
   * Date d'adhésion à la communauté
   */
  joinedAt: Date;

  /**
   * Rôle dans la communauté
   */
  role: Role;

  /**
   * Statut de bannissement
   */
  isBanned: boolean;

  /**
   * Date de fin de bannissement
   */
  bannedUntil?: Date;

  /**
   * Indique si le membre est actuellement en ligne
   */
  isOnline?: boolean;

  /**
   * Dernière activité
   */
  lastActivity?: Date;
}

/**
 * DTO pour obtenir les membres d'une communauté
 */
export class GetMembersDto {
  /**
   * ID de la communauté
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsNotEmpty()
  communityId: string;

  /**
   * Filtrer par rôle
   */
  @IsEnum(Role, { message: 'Rôle invalide' })
  @IsOptional()
  role?: Role;

  /**
   * Filtrer par statut de bannissement
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isBanned?: boolean;

  /**
   * Filtrer par statut en ligne
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isOnline?: boolean;

  /**
   * Nombre maximum de membres à retourner
   */
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 50;

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
 * DTO pour bannir un membre
 */
export class BanMemberDto {
  /**
   * ID du membre à bannir
   */
  @IsUUID('4', { message: "L'ID du membre doit être un UUID valide" })
  @IsNotEmpty()
  memberId: string;

  /**
   * Date de fin du bannissement (optionnel, permanent si non spécifié)
   */
  @IsDateString(
    {},
    { message: 'La date de fin de bannissement doit être valide' },
  )
  @IsOptional()
  bannedUntil?: string;

  /**
   * Raison du bannissement (optionnel)
   */
  @IsOptional()
  reason?: string;
}

/**
 * DTO pour lever le bannissement d'un membre
 */
export class UnbanMemberDto {
  /**
   * ID du membre à débannir
   */
  @IsUUID('4', { message: "L'ID du membre doit être un UUID valide" })
  @IsNotEmpty()
  memberId: string;
}

/**
 * DTO pour promouvoir/rétrograder un membre
 */
export class UpdateMemberRoleDto {
  /**
   * ID du membre
   */
  @IsUUID('4', { message: "L'ID du membre doit être un UUID valide" })
  @IsNotEmpty()
  memberId: string;

  /**
   * Nouveau rôle
   */
  @IsEnum(Role, { message: 'Rôle invalide' })
  @IsNotEmpty()
  role: Role;
}

/**
 * DTO pour quitter une communauté
 */
export class LeaveCommunityDto {
  /**
   * ID de la communauté à quitter
   */
  @IsUUID('4', { message: "L'ID de la communauté doit être un UUID valide" })
  @IsNotEmpty()
  communityId: string;
}

/**
 * DTO pour les statistiques des membres
 */
export class MemberStatsDto {
  /**
   * Nombre total de membres
   */
  totalMembers: number;

  /**
   * Membres en ligne
   */
  onlineMembers: number;

  /**
   * Membres par rôle
   */
  membersByRole: {
    [Role.OWNER]: number;
    [Role.ADMIN]: number;
    [Role.MODERATOR]: number;
    [Role.MEMBER]: number;
  };

  /**
   * Membres bannis
   */
  bannedMembers: number;

  /**
   * Nouveaux membres cette semaine
   */
  newMembersThisWeek: number;
}

/**
 * DTO de réponse paginée pour les membres d'une communauté
 */
export class PaginatedMembersDto {
  /**
   * Liste des membres
   */
  members: CommunityMemberResponseDto[];

  /**
   * Nombre total de membres dans la communauté
   */
  total: number;

  /**
   * Nombre de membres dans cette page
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

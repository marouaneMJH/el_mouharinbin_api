/**
 * Énumérations pour le système de chat
 * Définit les rôles et types de messages utilisés dans les communautés
 */

/**
 * Rôles disponibles pour les membres d'une communauté
 * @enum {string}
 */
export enum Role {
  /** Membre standard de la communauté */
  MEMBER = 'member',
  /** Modérateur avec permissions étendues */
  MODERATOR = 'moderator',
  /** Administrateur avec permissions avancées */
  ADMIN = 'admin',
  /** Propriétaire de la communauté avec tous les droits */
  OWNER = 'owner',
}

/**
 * Types de messages supportés dans le chat
 * @enum {string}
 */
export enum MessageType {
  /** Message texte standard */
  TEXT = 'text',
  /** Message contenant une image */
  IMAGE = 'image',
  /** Message contenant un fichier */
  FILE = 'file',
  /** Message système automatique */
  SYSTEM = 'system',
}

/**
 * États de connexion pour les sessions utilisateur
 * @enum {string}
 */
export enum ConnectionStatus {
  /** Utilisateur connecté et actif */
  ONLINE = 'online',
  /** Utilisateur absent temporairement */
  AWAY = 'away',
  /** Utilisateur hors ligne */
  OFFLINE = 'offline',
}

/**
 * Types d'événements pour les notifications en temps réel
 * @enum {string}
 */
export enum ChatEventType {
  /** Nouveau message dans une communauté */
  MESSAGE_CREATED = 'message.created',
  /** Message modifié */
  MESSAGE_UPDATED = 'message.updated',
  /** Message supprimé */
  MESSAGE_DELETED = 'message.deleted',
  /** Utilisateur a rejoint la communauté */
  USER_JOINED = 'user.joined',
  /** Utilisateur a quitté la communauté */
  USER_LEFT = 'user.left',
  /** Utilisateur commence à écrire */
  USER_TYPING = 'user.typing',
  /** Utilisateur arrête d'écrire */
  USER_STOP_TYPING = 'user.stop_typing',
  /** Statut de connexion modifié */
  USER_STATUS_CHANGED = 'user.status_changed',
}

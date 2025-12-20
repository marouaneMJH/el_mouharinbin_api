# DTOs et Interfaces Chat

Ce dossier contient tous les DTOs (Data Transfer Objects) et interfaces partagés pour le système de chat de l'application No Fap API.

## 📁 Structure

```
libs/contract/
├── enums/
│   ├── chat.enum.ts         # Énumérations pour le chat
│   └── index.ts             # Export des enums
├── dtos/chat/
│   ├── community.dto.ts     # DTOs pour les communautés
│   ├── message.dto.ts       # DTOs pour les messages
│   ├── member.dto.ts        # DTOs pour les membres
│   ├── session.dto.ts       # DTOs pour les sessions
│   └── index.ts             # Export des DTOs
└── interfaces/chat/
    ├── chat-events.interface.ts  # Interfaces RabbitMQ
    └── index.ts             # Export des interfaces
```

## 🏷️ Énumérations

### Role

- `MEMBER` - Membre standard
- `MODERATOR` - Modérateur avec permissions étendues
- `ADMIN` - Administrateur
- `OWNER` - Propriétaire de la communauté

### MessageType

- `TEXT` - Message texte standard
- `IMAGE` - Message avec image
- `FILE` - Message avec fichier
- `SYSTEM` - Message système automatique

### ConnectionStatus

- `ONLINE` - Utilisateur connecté et actif
- `AWAY` - Utilisateur absent temporairement
- `OFFLINE` - Utilisateur hors ligne

### ChatEventType

Événements pour les notifications temps réel :

- `MESSAGE_CREATED`, `MESSAGE_UPDATED`, `MESSAGE_DELETED`
- `USER_JOINED`, `USER_LEFT`
- `USER_TYPING`, `USER_STOP_TYPING`
- `USER_STATUS_CHANGED`

## 📝 DTOs Principaux

### Community DTOs

- `CreateCommunityDto` - Création d'une communauté
- `UpdateCommunityDto` - Mise à jour d'une communauté
- `CommunityResponseDto` - Réponse avec données de communauté
- `CommunitySearchDto` - Filtres de recherche

### Message DTOs

- `CreateMessageDto` - Envoi d'un nouveau message
- `UpdateMessageDto` - Modification d'un message
- `MessageResponseDto` - Réponse avec données de message
- `GetMessagesDto` - Filtres pour récupérer les messages
- `SearchMessagesDto` - Recherche textuelle dans les messages

### Member DTOs

- `JoinCommunityDto` - Rejoindre une communauté
- `UpdateMemberDto` - Mise à jour d'un membre
- `CommunityMemberResponseDto` - Données d'un membre
- `BanMemberDto`, `UnbanMemberDto` - Gestion des bannissements
- `UpdateMemberRoleDto` - Modification des rôles

### Session DTOs

- `ConnectSocketDto` - Connexion WebSocket
- `DisconnectSocketDto` - Déconnexion
- `UserSessionResponseDto` - Données de session
- `UserActivityDto` - Activités utilisateur (typing, etc.)

## 🔌 Interfaces RabbitMQ

### Événements

Toutes les interfaces héritent de `BaseChatEvent` :

- `MessageCreatedEvent` - Nouveau message
- `UserJoinedEvent` - Utilisateur rejoint
- `UserTypingEvent` - Utilisateur écrit
- etc.

### Patterns de messages

Constantes pour les patterns RabbitMQ :

```typescript
CHAT_MESSAGE_PATTERNS = {
  CREATE_MESSAGE: 'chat.message.create',
  JOIN_COMMUNITY: 'chat.member.join',
  BROADCAST_EVENT: 'chat.event.broadcast',
  // ...
};
```

### Réponses standardisées

```typescript
ChatServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  metadata?: Record<string, any>;
}
```

## 🚀 Utilisation

### Import des DTOs

```typescript
// Import de tous les DTOs chat
import {
  CreateMessageDto,
  MessageResponseDto,
  Role,
  MessageType,
} from '@libs/contract/dtos/chat';

// Import des interfaces
import {
  MessageCreatedEvent,
  CHAT_MESSAGE_PATTERNS,
} from '@libs/contract/interfaces/chat';
```

### Validation automatique

Tous les DTOs utilisent `class-validator` :

```typescript
@IsString()
@IsNotEmpty()
@MinLength(1)
@MaxLength(2000)
content: string;
```

### Exemple d'utilisation dans un contrôleur

```typescript
@Controller('chat')
export class ChatController {
  @Post('messages')
  async createMessage(
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    return this.chatService.createMessage(dto);
  }
}
```

### Exemple d'événement RabbitMQ

```typescript
@MessagePattern(CHAT_MESSAGE_PATTERNS.CREATE_MESSAGE)
async handleCreateMessage(dto: CreateMessageDto): Promise<ChatServiceResponse<MessageResponseDto>> {
  try {
    const message = await this.messageService.create(dto);

    // Émettre l'événement
    const event: MessageCreatedEvent = {
      eventType: ChatEventType.MESSAGE_CREATED,
      timestamp: new Date(),
      userId: dto.userId,
      communityId: dto.communityId,
      message,
    };

    return { success: true, data: message };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## 📋 Validation

### Règles de validation communes

- **UUIDs** : Validation avec `@IsUUID('4')`
- **Textes** : Longueurs min/max définies
- **Énums** : Validation avec `@IsEnum()`
- **Optionnels** : Marqués `@IsOptional()`
- **Transformation** : `@Type()` pour les nombres et booléens

### Messages d'erreur personnalisés

```typescript
@MinLength(3, { message: 'Le nom doit contenir au moins 3 caractères' })
@MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
name: string;
```

## 🔧 Maintenance

### Ajout d'un nouveau DTO

1. Créer le fichier dans le bon dossier
2. Ajouter les validations appropriées
3. Documenter avec JSDoc
4. Exporter dans `index.ts`
5. Mettre à jour cette documentation

### Modification d'un enum

1. Modifier l'enum dans `enums/chat.enum.ts`
2. Vérifier les usages dans les DTOs
3. Mettre à jour les interfaces si nécessaire
4. Tester la compatibilité ascendante

## 📚 Références

- [class-validator](https://github.com/typestack/class-validator) - Validation
- [class-transformer](https://github.com/typestack/class-transformer) - Transformation
- [NestJS Validation](https://docs.nestjs.com/techniques/validation) - Guide officiel

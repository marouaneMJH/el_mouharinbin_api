# Service Chat - Configuration et Utilisation

## 📋 Vue d'ensemble

Le service Chat est un microservice NestJS configuré avec RabbitMQ pour la communication asynchrone et Socket.IO pour les communications en temps réel.

## 🚀 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez les variables suivantes :

```bash
# Configuration RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
CHAT_QUEUE_NAME=chat_queue

# Configuration du service
CHAT_SERVICE_PORT=3003
NODE_ENV=development
```

### Dépendances installées

- `@nestjs/websockets` - Support WebSocket
- `@nestjs/microservices` - Support microservice
- `@nestjs/platform-socket.io` - Intégration Socket.IO
- `socket.io` - Communications temps réel

## 🏗️ Architecture

```
apps/chat/
├── src/
│   ├── main.ts                    # Point d'entrée du microservice
│   ├── app.chat.module.ts         # Module principal
│   ├── config/
│   │   └── rabbitmq.config.ts     # Configuration RabbitMQ
│   └── modules/
│       └── chat/
│           ├── chat.module.ts     # Module Chat
│           ├── chat.controller.ts # Contrôleur Chat
│           └── chat.service.ts    # Service Chat
└── prisma/
    └── chat.prisma               # Schéma base de données
```

## 🔧 Commandes

### Développement

```bash
# Démarrer en mode développement
npm run start:chat:dev

# Compilation
npm run build chat

# Tests
npm run test:chat
```

### Production

```bash
# Démarrer en production
npm run start:chat
```

## 🐰 Configuration RabbitMQ

Le service utilise RabbitMQ pour la communication inter-services :

- **Queue**: `chat_queue` (durable)
- **Transport**: AMQP
- **Reconnexion automatique**: Activée

### Démarrer RabbitMQ localement

```bash
# Avec Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Accès à l'interface web: http://localhost:15672
# Utilisateur: guest / Mot de passe: guest
```

## 🔌 Socket.IO Configuration

Le service est configuré pour supporter Socket.IO pour les communications temps réel.

## 📡 Utilisation

### Messages RabbitMQ

Le service écoute les messages sur la queue `chat_queue` et peut traiter les patterns suivants :

```typescript
// Exemple de pattern de message
@MessagePattern('chat.send')
async sendMessage(data: { userId: string, message: string }) {
  // Logique de traitement
}
```

### WebSocket Events

```typescript
// Exemple d'événements WebSocket
@SubscribeMessage('message')
handleMessage(client: Socket, payload: any) {
  // Logique de traitement temps réel
}
```

## 🧪 Tests

Pour vérifier que la configuration est correcte :

```bash
./test-chat-config.sh
```

## 🐛 Dépannage

### Service ne démarre pas

1. Vérifiez que RabbitMQ est en cours d'exécution
2. Vérifiez les variables d'environnement
3. Vérifiez les logs avec `npm run start:chat:dev`

### Erreurs de connexion RabbitMQ

- Vérifiez la connectivité : `telnet localhost 5672`
- Vérifiez les credentials dans `.env`
- Vérifiez que la queue existe

## 📝 Prochaines étapes

1. Implémenter les contrôleurs et services Chat
2. Ajouter la gestion des salles de discussion
3. Implémenter la persistance des messages
4. Ajouter les tests unitaires et d'intégration

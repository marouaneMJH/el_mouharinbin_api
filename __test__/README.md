# WebSocket Community Tests

Ce répertoire contient les tests pour les fonctionnalités WebSocket de communauté, spécifiquement pour les événements `community:join` et `community:leave`.

## Configuration

### Fichier .env.test.local

Créer un fichier `.env.test.local` à la racine du projet avec la configuration suivante :

```bash
# JWT Token for authentication (remplacer avec un token valide)
JWT_TOKEN=your_valid_jwt_token_here

# WebSocket URL (optional, default: http://localhost:3000)
WEBSOCKET_URL=http://localhost:3000

# Test Community IDs
TEST_COMMUNITY_ID=test-community-123
TEST_COMMUNITY_ID_2=test-community-456

# Other test configurations...
```

## Tests Disponibles

### 1. Tests Unitaires

- **`test-community-leave-unit.js`** : Tests unitaires pour la logique de sortie de communauté
  - Validation de la structure des événements
  - Validation de la gestion d'erreurs
  - Validation de la structure des réponses

### 2. Tests d'Intégration

- **`test-community-leave.js`** : Tests d'intégration complets pour `community:leave`
  - Connexion WebSocket
  - Join puis leave d'une communauté
  - Accusés de réception
  - Notifications aux membres
  - Gestion d'erreurs

### 3. Scripts Shell

- **`test-community-leave.sh`** : Script pour exécuter les tests de sortie de communauté
- **`run-community-tests.sh`** : Script master pour exécuter tous les tests

## Exécution des Tests

### Méthode 1: Script Master (Recommandé)

```bash
# Exécuter tous les tests
./__test__/run-community-tests.sh
```

### Méthode 2: Tests Individuels

```bash
# Tests unitaires uniquement
node __test__/test-community-leave-unit.js

# Tests d'intégration (serveur requis)
node __test__/test-community-leave.js

# Via script shell
./__test__/test-community-leave.sh
```

## Prérequis

### 1. Serveur WebSocket

Pour les tests d'intégration, le serveur WebSocket doit être en cours d'exécution :

```bash
npm run start:dev
```

### 2. Dépendances

Les tests installeront automatiquement `socket.io-client` si nécessaire.

### 3. Token JWT Valide

Un token JWT valide doit être configuré dans `.env.test.local`. Vous pouvez en générer un en utilisant l'API d'authentification ou utiliser celui fourni dans les exemples.

## Structure des Tests

### Tests de Fonctionnalité community:leave

Les tests vérifient tous les critères d'acceptation :

- ✅ **L'événement 'community:leave' permet de quitter la room**
- ✅ **Le socket quitte la room Socket.IO**
- ✅ **Un accusé de réception est envoyé**
- ✅ **Les autres membres sont notifiés du départ**

### Événements Testés

#### Événements Client → Serveur

- `community:leave` - Nouveau événement pour quitter une communauté
- `leave-community` - Événement legacy (rétrocompatibilité)

#### Événements Serveur → Client

- `community:left` - Accusé de réception de sortie
- `community:user-left` - Notification aux autres membres
- `error` - Gestion d'erreurs
- `left-community` - Événement legacy (rétrocompatibilité)
- `user:left` - Notification legacy (rétrocompatibilité)

## Résultats des Tests

Les tests fournissent un rapport détaillé avec :

- ✅/❌ Status de chaque test
- 📊 Résumé des résultats
- 🐛 Messages d'erreur détaillés
- 📋 Liste des fonctionnalités vérifiées

## Dépannage

### Erreur de Connexion

```
❌ Connection failed: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution** : Vérifier que le serveur WebSocket est en cours d'exécution avec `npm run start:dev`

### Token JWT Invalide

```
❌ Connection rejected: Invalid token
```

**Solution** : Vérifier que le `JWT_TOKEN` dans `.env.test.local` est valide et non expiré

### Module socket.io-client Non Trouvé

```
Error: Cannot find module 'socket.io-client'
```

**Solution** : Les scripts l'installeront automatiquement, ou exécuter manuellement :

```bash
npm install --no-save socket.io-client
```

## Contributions

Lors de l'ajout de nouveaux tests :

1. Suivre la structure existante
2. Utiliser `.env.test.local` pour la configuration
3. Inclure à la fois les tests unitaires et d'intégration
4. Mettre à jour cette documentation
5. Vérifier que tous les critères d'acceptation sont couverts

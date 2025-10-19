# WebSocket Gateway Implementation

## Overview

The WebSocket Gateway provides real-time communication capabilities for the chat system. It uses Socket.IO for WebSocket connections and integrates with RabbitMQ for event broadcasting across microservices.

## Features

### 🔐 JWT Authentication

- Token-based authentication for WebSocket connections
- Support for multiple token sources (auth, query, headers)
- Automatic token expiration handling
- Enhanced connection logging

### 🏠 Community Rooms

- Join/leave community rooms functionality
- Room-based message broadcasting
- User presence notifications
- Real-time member tracking

### 📡 Real-time Event Broadcasting

- Message creation events
- Message deletion events
- User join/leave events
- Automatic RabbitMQ integration

## API Reference

### Connection

Connect to WebSocket Gateway:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

### Events

#### Client Events (Emit)

##### `community:join`

Join a community chat room with membership verification.

```javascript
socket.emit('community:join', {
  communityId: 'community-uuid',
});
```

##### `join-community` (Legacy)

Legacy event for backward compatibility.

```javascript
socket.emit('join-community', {
  communityId: 'community-uuid',
});
```

##### `community:leave`

Leave a community chat room with acknowledgment.

```javascript
socket.emit('community:leave', {
  communityId: 'community-uuid',
});
```

##### `leave-community` (Legacy)

Legacy event for backward compatibility.

```javascript
socket.emit('leave-community', {
  communityId: 'community-uuid',
});
```

#### Server Events (Listen)

##### `connected`

Emitted when connection is successful.

```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // {
  //   user: { id, username, email },
  //   connectedAt: "2024-01-15T10:30:00Z",
  //   clientId: "socket-id"
  // }
});
```

##### `community:joined`

Emitted when successfully joined a community using the new event.

```javascript
socket.on('community:joined', (data) => {
  console.log('Joined community:', data);
  // {
  //   success: true,
  //   communityId: "community-uuid",
  //   roomName: "community:community-uuid",
  //   joinedAt: "2024-01-15T10:30:00Z",
  //   user: { id: "user-uuid", username: "john_doe", email: "john@example.com" }
  // }
});
```

##### `joined-community` (Legacy)

Legacy event for backward compatibility.

```javascript
socket.on('joined-community', (data) => {
  console.log('Joined:', data);
  // {
  //   communityId: "community-uuid",
  //   roomName: "community:community-uuid",
  //   joinedAt: "2024-01-15T10:30:00Z"
  // }
});
```

##### `community:left`

Emitted when successfully left a community using the new event.

```javascript
socket.on('community:left', (data) => {
  console.log('Left community:', data);
  // {
  //   success: true,
  //   communityId: "community-uuid",
  //   roomName: "community:community-uuid",
  //   leftAt: "2024-01-15T10:30:00Z",
  //   user: { id: "user-uuid", username: "john_doe", email: "john@example.com" }
  // }
});
```

##### `left-community` (Legacy)

Legacy event for backward compatibility.

```javascript
socket.on('left-community', (data) => {
  console.log('Left:', data);
  // {
  //   communityId: "community-uuid",
  //   roomName: "community:community-uuid",
  //   leftAt: "2024-01-15T10:30:00Z"
  // }
});
```

##### `message:created`

Emitted when a new message is created in a community.

```javascript
socket.on('message:created', (data) => {
  console.log('New message:', data);
  // {
  //   id: "message-uuid",
  //   content: "Hello world!",
  //   author: { id: "user-uuid", username: "john_doe" },
  //   communityId: "community-uuid",
  //   messageType: "TEXT",
  //   createdAt: "2024-01-15T10:30:00Z"
  // }
});
```

##### `message:deleted`

Emitted when a message is deleted.

```javascript
socket.on('message:deleted', (data) => {
  console.log('Message deleted:', data);
  // {
  //   messageId: "message-uuid",
  //   communityId: "community-uuid",
  //   deletedBy: "user-uuid",
  //   deletedAt: "2024-01-15T10:30:00Z"
  // }
});
```

##### `community:user-joined`

Emitted when a user joins a community using the new event system.

```javascript
socket.on('community:user-joined', (data) => {
  console.log('User joined community:', data);
  // {
  //   user: { id: "user-uuid", username: "jane_doe", email: "jane@example.com" },
  //   communityId: "community-uuid",
  //   joinedAt: "2024-01-15T10:30:00Z"
  // }
});
```

##### `user:joined` (Legacy)

Legacy event for backward compatibility.

```javascript
socket.on('user:joined', (data) => {
  console.log('User joined:', data);
  // {
  //   user: { id: "user-uuid", username: "jane_doe", email: "jane@example.com" },
  //   communityId: "community-uuid",
  //   joinedAt: "2024-01-15T10:30:00Z"
  // }
});
```

##### `community:user-left`

Emitted when a user leaves a community using the new event system.

```javascript
socket.on('community:user-left', (data) => {
  console.log('User left community:', data);
  // {
  //   user: { id: "user-uuid", username: "jane_doe", email: "jane@example.com" },
  //   communityId: "community-uuid",
  //   leftAt: "2024-01-15T10:30:00Z"
  // }
});
```

##### `user:left` (Legacy)

Legacy event for backward compatibility.

```javascript
socket.on('user:left', (data) => {
  console.log('User left:', data);
  // {
  //   user: { id: "user-uuid", username: "jane_doe", email: "jane@example.com" },
  //   communityId: "community-uuid",
  //   leftAt: "2024-01-15T10:30:00Z"
  // }
});
```

##### Error Events

```javascript
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

socket.on('token:expired', (data) => {
  console.error('Token expired:', data);
});
```

## CORS Configuration

The WebSocket Gateway is configured with CORS support for:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`

## RabbitMQ Integration

The gateway listens for RabbitMQ events and broadcasts them to connected clients:

### Event Patterns

- `chat.message.created` → `message:created` WebSocket event
- `chat.message.deleted` → `message:deleted` WebSocket event

### Event Flow

1. Chat service publishes event to RabbitMQ
2. WebSocket Gateway receives event via `@EventPattern`
3. Gateway broadcasts event to appropriate community room
4. All connected clients in room receive real-time update

## Security

### Authentication

- JWT token required for connection
- Token validated on connection
- Invalid/expired tokens result in immediate disconnection
- Token expiration auto-disconnect

### Authorization

- User session tracking
- Community room access control
- Proper error handling and logging

## Testing

Use the provided test script to verify functionality:

```bash
# Install Socket.IO client
npm install socket.io-client

# Run WebSocket test
node test-websocket-connection.js YOUR_JWT_TOKEN
```

## Architecture

```
Client Browser
    ↓ WebSocket
WebSocket Gateway
    ↓ RabbitMQ Events
Chat Microservice
    ↓ Database
PostgreSQL
```

## Environment Variables

Required environment variables:

- `JWT_SECRET`: Secret key for JWT token verification
- `RABBITMQ_URL`: RabbitMQ connection string (handled by service configuration)

## Error Handling

The gateway includes comprehensive error handling:

- Connection authentication errors
- Token validation errors
- Room join/leave errors
- RabbitMQ event processing errors
- Graceful disconnection handling

All errors are logged with appropriate context for debugging and monitoring.

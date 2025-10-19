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

- **Message Events:** creation, updates, deletion
- **User Presence:** join/leave events from WebSocket and external services  
- **Community Events:** announcements and system notifications
- **Automatic RabbitMQ Integration:** Bidirectional event handling

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

##### `message:send`

Send a message to a community chat room with validation and rate limiting.

```javascript
socket.emit(
  'message:send',
  {
    communityId: 'community-uuid',
    content: 'Hello, world!',
  },
  (ack) => {
    if (ack.success) {
      console.log('Message sent:', ack);
    } else {
      console.error('Failed to send:', ack);
    }
  },
);
```

**Rate Limiting:** Maximum 10 messages per second per user.

**Response Parameters:**

- `success`: Boolean indicating if the message was sent successfully
- `messageId`: UUID of the created message (on success)
- `timestamp`: ISO timestamp of when the message was processed
- `error`: Error details (on failure)
- `waitTime`: Milliseconds to wait before next message (when rate limited)

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

##### `message:updated`

Emitted when a message is updated/edited.

```javascript
socket.on('message:updated', (data) => {
  console.log('Message updated:', data);
  // {
  //   id: "message-uuid",
  //   content: "Updated message content",
  //   author: { id: "user-uuid", username: "john_doe" },
  //   communityId: "community-uuid",
  //   messageType: "TEXT",
  //   updatedAt: "2024-01-15T10:35:00Z",
  //   editedBy: "user-uuid"
  // }
});
```

##### `message:sent`

Emitted as acknowledgment when a message is successfully sent.

```javascript
socket.on('message:sent', (data) => {
  console.log('Message sent confirmation:', data);
  // {
  //   success: true,
  //   messageId: "message-uuid",
  //   communityId: "community-uuid",
  //   content: "Hello, world!",
  //   timestamp: "2024-01-15T10:30:00Z",
  //   author: { id: "user-uuid", username: "john_doe" },
  //   rabbitMQProcessed: true
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

##### `community:announcement`

Emitted when community-wide announcements are made.

```javascript
socket.on('community:announcement', (data) => {
  console.log('Community announcement:', data);
  // {
  //   type: "system" | "admin" | "event",
  //   message: "Welcome to the community!",
  //   timestamp: "2024-01-15T10:30:00Z",
  //   metadata: { priority: "high", category: "welcome" }
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

The gateway both listens for RabbitMQ events and publishes new events:

### Incoming Event Patterns (Listen)

**Message Events:**
- `chat.message.created` → `message:created` WebSocket event
- `chat.message.updated` → `message:updated` WebSocket event  
- `chat.message.deleted` → `message:deleted` WebSocket event

**Community Events:**
- `community.user.joined` → `community:user-joined` WebSocket event
- `community.user.left` → `community:user-left` WebSocket event
- `community.announcement` → `community:announcement` WebSocket event

### Outgoing Event Patterns (Publish)

- `chat.message.send` - Published when user sends message via WebSocket

### Event Flow

**Incoming Messages:**

1. Chat service publishes event to RabbitMQ
2. WebSocket Gateway receives event via `@EventPattern`
3. Gateway broadcasts event to appropriate community room
4. All connected clients in room receive real-time update

**Outgoing Messages:**

1. Client emits `message:send` event via WebSocket
2. Gateway validates message content and rate limits
3. Gateway publishes `chat.message.send` event to RabbitMQ
4. Chat service processes the message and stores it
5. Chat service publishes `chat.message.created` back to RabbitMQ
6. Gateway receives and broadcasts to all room members

## Rate Limiting

### Message Send Rate Limiting

- **Limit:** 10 messages per second per user
- **Implementation:** In-memory Map tracking timestamps
- **Cleanup:** Automatic cleanup of expired rate limit entries
- **Response:** Returns `waitTime` in milliseconds when rate limited

```javascript
// Rate limit response example
{
  success: false,
  error: "Rate limit exceeded",
  waitTime: 856, // milliseconds to wait
  limit: "10 messages per second"
}
```

## Security

### Authentication

- JWT token required for connection
- Token validated on connection
- Invalid/expired tokens result in immediate disconnection
- Token expiration auto-disconnect

### Authorization

- User session tracking
- Community room access control
- Message content validation (1-1000 characters)
- Proper error handling and logging

### Validation

- All incoming payloads validated using DTOs
- Community ID format validation (UUID)
- Message content length validation
- Error responses with detailed information

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

# Complete API Documentation

## Overview

This document provides comprehensive documentation for the NoFap API, including both HTTP REST endpoints and WebSocket real-time communication.

## Table of Contents

1. [Authentication](#authentication)
2. [HTTP REST API](#http-rest-api)
3. [WebSocket API](#websocket-api)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Security](#security)

## Authentication

All API endpoints (except login/signup) require JWT authentication:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

**POST** `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciO...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

## HTTP REST API

The HTTP API is fully documented with OpenAPI/Swagger. Access the interactive documentation at:

**Swagger UI:** `http://localhost:3000/api/docs`

### Key Endpoints Summary

#### Authentication (`/api/auth`)

- `POST /login` - User login
- `POST /signup` - User registration
- `GET /activate/:token` - Account activation

#### Users (`/api/users`)

- `GET /` - List users (paginated)
- `GET /:id` - Get user by ID
- `PATCH /:id` - Update user
- `DELETE /:id` - Delete user
- `GET /active` - Get active users
- `PUT /:id/activate` - Activate user account

#### Communities (`/api/communities`)

- `POST /` - Create community
- `GET /` - List communities
- `GET /:id` - Get community details
- `POST /:id/join` - Join community
- `DELETE /:id/leave` - Leave community
- `GET /:id/members` - Get community members

#### Messages (`/api/messages`)

- `DELETE /:id` - Delete message (soft delete)

#### Mail Service (`/api/mail`)

- Email notification endpoints

## WebSocket API

The WebSocket API provides real-time communication for chat functionality.

### Connection

**URL:** `ws://localhost:3000`

**Authentication:** Include JWT token in connection query or headers

```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

### Events

#### Client → Server Events

##### `join-community`

Join a community chat room.

**Payload:**

```json
{
  "communityId": "community-123"
}
```

**Success Response:**

```json
{
  "status": "success",
  "message": "Successfully joined community",
  "data": {
    "communityId": "community-123",
    "communityName": "NoFap Support Group",
    "memberCount": 45
  }
}
```

**Error Response:**

```json
{
  "status": "error",
  "message": "Community not found or access denied",
  "error": "FORBIDDEN"
}
```

---

##### `leave-community`

Leave a community chat room.

**Payload:**

```json
{
  "communityId": "community-123"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Successfully left community"
}
```

---

##### `send-message`

Send a message to a community.

**Rate Limit:** 10 messages per second per user

**Payload:**

```json
{
  "communityId": "community-123",
  "content": "Hello everyone! Day 30 of my journey!"
}
```

**Success Response:**

```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "id": "message-456",
    "content": "Hello everyone! Day 30 of my journey!",
    "communityId": "community-123",
    "userId": "user-123",
    "username": "john_doe",
    "createdAt": "2024-01-15T14:30:00Z"
  }
}
```

**Rate Limit Error:**

```json
{
  "status": "error",
  "message": "Rate limit exceeded. Maximum 10 messages per second.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

---

##### `typing:start`

Start typing indicator in a community.

**Rate Limit:** 1 event per second per user

**Payload:**

```json
{
  "communityId": "community-123"
}
```

**Success Response:**

```json
{
  "status": "success",
  "message": "Typing indicator started"
}
```

**Rate Limit Error:**

```json
{
  "status": "error",
  "message": "Rate limit exceeded. Maximum 1 typing event per second.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

---

##### `typing:stop`

Stop typing indicator in a community.

**Payload:**

```json
{
  "communityId": "community-123"
}
```

**Success Response:**

```json
{
  "status": "success",
  "message": "Typing indicator stopped"
}
```

**Note:** Typing automatically stops after 5 seconds of inactivity.

#### Server → Client Events

##### `message-received`

Broadcasted when a new message is sent to a community.

**Payload:**

```json
{
  "id": "message-456",
  "content": "Hello everyone! Day 30 of my journey!",
  "communityId": "community-123",
  "userId": "user-789",
  "username": "jane_doe",
  "createdAt": "2024-01-15T14:30:00Z",
  "isEdited": false,
  "isDeleted": false
}
```

---

##### `message-updated`

Broadcasted when a message is edited.

**Payload:**

```json
{
  "id": "message-456",
  "content": "Hello everyone! Day 30 of my journey! (Updated)",
  "communityId": "community-123",
  "userId": "user-789",
  "username": "jane_doe",
  "createdAt": "2024-01-15T14:30:00Z",
  "updatedAt": "2024-01-15T14:35:00Z",
  "isEdited": true,
  "isDeleted": false
}
```

---

##### `message-deleted`

Broadcasted when a message is deleted.

**Payload:**

```json
{
  "id": "message-456",
  "content": "[Message deleted]",
  "communityId": "community-123",
  "deletedAt": "2024-01-15T14:40:00Z",
  "deletedBy": "user-123",
  "deletedByUsername": "moderator_user",
  "deletionReason": "Content violates community guidelines",
  "isDeleted": true
}
```

---

##### `community-joined`

Broadcasted when a user joins the community.

**Payload:**

```json
{
  "communityId": "community-123",
  "user": {
    "id": "user-999",
    "username": "new_member",
    "joinedAt": "2024-01-15T14:45:00Z"
  },
  "memberCount": 46
}
```

---

##### `community-left`

Broadcasted when a user leaves the community.

**Payload:**

```json
{
  "communityId": "community-123",
  "user": {
    "id": "user-999",
    "username": "former_member",
    "leftAt": "2024-01-15T14:50:00Z"
  },
  "memberCount": 45
}
```

---

##### `typing:user-start`

Broadcasted when a user starts typing in a community.

**Payload:**

```json
{
  "userId": "user-456",
  "username": "jane_doe",
  "communityId": "community-123",
  "timestamp": "2024-01-15T14:52:00Z"
}
```

---

##### `typing:user-stop`

Broadcasted when a user stops typing in a community.

**Payload:**

```json
{
  "userId": "user-456",
  "username": "jane_doe",
  "communityId": "community-123",
  "timestamp": "2024-01-15T14:52:30Z"
}
```

**Note:** This event is automatically sent after 5 seconds of typing inactivity.

---

##### `error`

Sent when an error occurs.

**Payload:**

```json
{
  "status": "error",
  "message": "Detailed error message",
  "error": "ERROR_CODE",
  "timestamp": "2024-01-15T14:55:00Z"
}
```

### WebSocket Connection Lifecycle

#### 1. Connection

```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: localStorage.getItem('jwt_token'),
  },
});

socket.on('connect', () => {
  console.log('Connected to server');
});
```

#### 2. Error Handling

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  // Handle authentication errors, network issues, etc.
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

#### 3. Joining Communities

```javascript
// Join a community when user navigates to chat
socket.emit('join-community', { communityId: 'community-123' });

// Listen for confirmation
socket.on('join-community-response', (response) => {
  if (response.status === 'success') {
    console.log('Successfully joined community:', response.data);
  }
});
```

#### 4. Sending Messages

```javascript
socket.emit('send-message', {
  communityId: 'community-123',
  content: 'Hello everyone!',
});

// Listen for confirmation
socket.on('send-message-response', (response) => {
  if (response.status === 'success') {
    console.log('Message sent:', response.data);
  } else {
    console.error('Failed to send message:', response.message);
  }
});
```

#### 5. Receiving Real-time Updates

```javascript
// Listen for new messages
socket.on('message-received', (message) => {
  addMessageToChat(message);
});

// Listen for message updates
socket.on('message-updated', (message) => {
  updateMessageInChat(message);
});

// Listen for message deletions
socket.on('message-deleted', (message) => {
  markMessageAsDeleted(message);
});

// Listen for community events
socket.on('community-joined', (event) => {
  updateMemberCount(event.memberCount);
  showNotification(`${event.user.username} joined the community`);
});

socket.on('community-left', (event) => {
  updateMemberCount(event.memberCount);
  showNotification(`${event.user.username} left the community`);
});

// Listen for typing indicators
socket.on('typing:user-start', (event) => {
  showTypingIndicator(event.userId, event.username, event.communityId);
});

socket.on('typing:user-stop', (event) => {
  hideTypingIndicator(event.userId, event.communityId);
});
```

#### 6. Typing Indicators

```javascript
// Start typing indicator
socket.emit('typing:start', { communityId: 'community-123' });

// Stop typing indicator
socket.emit('typing:stop', { communityId: 'community-123' });

// Auto-debounced typing implementation
let typingTimer;
function handleInputChange(communityId) {
  // Start typing
  socket.emit('typing:start', { communityId });

  // Clear existing timer
  clearTimeout(typingTimer);

  // Set auto-stop timer (user stopped typing)
  typingTimer = setTimeout(() => {
    socket.emit('typing:stop', { communityId });
  }, 2000); // Stop after 2 seconds of inactivity
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### WebSocket Error Codes

- `AUTHENTICATION_FAILED` - Invalid or missing JWT token
- `COMMUNITY_NOT_FOUND` - Community does not exist
- `ACCESS_DENIED` - No permission to access community
- `RATE_LIMIT_EXCEEDED` - Too many messages sent
- `INVALID_MESSAGE_CONTENT` - Message validation failed
- `MESSAGE_NOT_FOUND` - Message does not exist
- `INSUFFICIENT_PERMISSIONS` - Cannot perform action

## Rate Limiting

### WebSocket Rate Limits

- **Messages:** 10 per second per user
- **Community join/leave:** 5 per minute per user
- **General events:** 100 per minute per user

### HTTP Rate Limits

- **Authentication:** 5 attempts per minute per IP
- **API calls:** 1000 per hour per user
- **File uploads:** 10 per minute per user

## Security

### Authentication

- JWT tokens with 24-hour expiration
- Refresh token mechanism
- Secure token storage recommendations

### Authorization

- Role-based access control (RBAC)
- Community-specific permissions
- Message ownership validation

### Data Validation

- Input sanitization
- SQL injection prevention
- XSS protection
- Content filtering

### WebSocket Security

- JWT authentication required
- CORS configuration
- Rate limiting
- Message content validation

## Examples

### Complete Chat Implementation

```javascript
class ChatClient {
  constructor(token) {
    this.socket = io('ws://localhost:3000', {
      auth: { token },
    });
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('message-received', (message) => {
      this.displayMessage(message);
    });

    this.socket.on('message-deleted', (message) => {
      this.removeMessage(message.id);
    });

    this.socket.on('community-joined', (event) => {
      this.updateMembersList(event);
    });

    // Typing indicators
    this.socket.on('typing:user-start', (event) => {
      this.showTypingIndicator(event.userId, event.username);
    });

    this.socket.on('typing:user-stop', (event) => {
      this.hideTypingIndicator(event.userId);
    });
  }

  joinCommunity(communityId) {
    this.socket.emit('join-community', { communityId });
  }

  sendMessage(communityId, content) {
    this.socket.emit('send-message', { communityId, content });
  }

  leaveCommunity(communityId) {
    this.socket.emit('leave-community', { communityId });
  }

  // Typing indicators
  startTyping(communityId) {
    this.socket.emit('typing:start', { communityId });
  }

  stopTyping(communityId) {
    this.socket.emit('typing:stop', { communityId });
  }

  // Auto-debounced typing for input fields
  setupTypingDebounce(inputElement, communityId) {
    let typingTimer;
    inputElement.addEventListener('input', () => {
      this.startTyping(communityId);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        this.stopTyping(communityId);
      }, 2000);
    });
  }

  showTypingIndicator(userId, username) {
    const indicator = document.getElementById('typing-indicators');
    indicator.innerHTML += `<div id="typing-${userId}">${username} is typing...</div>`;
  }

  hideTypingIndicator(userId) {
    const indicator = document.getElementById(`typing-${userId}`);
    if (indicator) indicator.remove();
  }

  displayMessage(message) {
    // Update your chat UI
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `
      <strong>${message.username}:</strong>
      <span>${message.content}</span>
      <small>${new Date(message.createdAt).toLocaleTimeString()}</small>
    `;
    document.getElementById('chat-messages').appendChild(messageElement);
  }
}

// Usage
const token = localStorage.getItem('jwt_token');
const chat = new ChatClient(token);
chat.joinCommunity('community-123');
```

## Support

For API support and questions:

- Check the Swagger documentation at `/api/docs`
- Review the WebSocket implementation guide
- Contact the development team

---

_Last updated: January 2024_

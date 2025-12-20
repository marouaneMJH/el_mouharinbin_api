# 🚀 WebSocket Chat - Quick Start Guide

## 🎯 Implementation Complete!

All WebSocket chat features have been successfully implemented:

✅ **Community Join/Leave Events** - Users can join and leave community rooms  
✅ **Message Send Event** - Real-time messaging with rate limiting (10 msg/sec)  
✅ **JWT Authentication** - Secure WebSocket connections  
✅ **Rate Limiting** - 10 messages per second per user  
✅ **RabbitMQ Integration** - Event publishing to chat service  
✅ **Comprehensive Testing** - Unit and integration test suites

## 🏃‍♂️ Quick Test Run

### 1. Start the Server

Choose one of these options:

```bash
# Option 1: Development mode
npm run start:dev

# Option 2: Specific service
npm run start:no-fap-api-gateway

# Option 3: Docker (if configured)
docker-compose up -d
```

### 2. Run the Tests

```bash
# Run the complete test suite
./__test__/run-websocket-tests.sh

# Or run individual tests:
node __test__/test-websocket-basic.js          # Basic connectivity
node __test__/test-community-leave.js         # Community leave functionality
node __test__/test-message-send.js            # Message sending with rate limiting
```

### 3. Test Configuration

Make sure you have `.env.test.local` with:

```bash
JWT_TOKEN=your-jwt-token-here
WEBSOCKET_URL=http://localhost:3000
TEST_COMMUNITY_ID=test-community-123
```

## 🧪 Test Suite Overview

### Unit Tests ✅

- **Community Leave Logic** - Validation, error handling, response structure
- **Message Send Logic** - Rate limiting, payload validation, error responses

### Integration Tests ⚡

- **WebSocket Connectivity** - Connection, authentication, heartbeat
- **Community Management** - Join/leave rooms, member notifications
- **Message Functionality** - Send messages, rate limiting, acknowledgments

## 📡 WebSocket Events Reference

### Client → Server (Emit)

```javascript
// Join a community room
socket.emit('community:join', { communityId: 'uuid-here' });

// Leave a community room
socket.emit('community:leave', { communityId: 'uuid-here' });

// Send a message (rate limited: 10/sec)
socket.emit(
  'message:send',
  {
    communityId: 'uuid-here',
    content: 'Hello, world!',
  },
  (ack) => {
    console.log('Message result:', ack);
  },
);
```

### Server → Client (Listen)

```javascript
// Connection confirmation
socket.on('connected', (data) => console.log('Connected:', data));

// Community events
socket.on('community:joined', (data) => console.log('Joined:', data));
socket.on('community:left', (data) => console.log('Left:', data));

// Message events
socket.on('message:sent', (data) => console.log('Message sent:', data));
socket.on('message:created', (data) => console.log('New message:', data));

// Error handling
socket.on('error', (error) => console.error('Error:', error));
```

## 🛡️ Security & Rate Limiting

### Authentication

- JWT token required for all connections
- Token validation on connect
- Auto-disconnect on invalid/expired tokens

### Rate Limiting

- **10 messages per second** per user
- In-memory tracking with automatic cleanup
- Returns wait time when rate limited

### Validation

- Message content: 1-1000 characters
- Community ID: Valid UUID format
- Comprehensive error responses

## 🔧 Troubleshooting

### Common Issues

**1. Connection Failed**

```bash
# Check if server is running
curl http://localhost:3000

# Check JWT token in .env.test.local
cat .env.test.local | grep JWT_TOKEN
```

**2. Rate Limiting Issues**

- Wait time is returned in error response
- Rate resets every second (rolling window)
- Limit: 10 messages per second per user

**3. RabbitMQ Integration**

- Message send publishes to 'chat.message.send' pattern
- Chat service should be running to process messages
- Check RabbitMQ connection in gateway logs

### Test Failures

**Unit Tests Failing:**

- Check test logic in `__test__/*-unit.js` files
- Verify test data matches expected formats

**Integration Tests Failing:**

- Ensure server is running on correct port
- Verify JWT token is valid and not expired
- Check WebSocket URL in configuration

## 🎉 Next Steps

Your WebSocket chat implementation is ready! Consider these enhancements:

1. **Monitoring** - Add metrics for message rates and connection counts
2. **Scaling** - Use Redis for multi-instance rate limiting
3. **Features** - Add typing indicators, file uploads, message reactions
4. **Performance** - Implement message caching and optimization

## 📖 Documentation

- **Complete API Reference:** `docs/websocket-gateway.md`
- **Implementation Details:** `docs/websocket-implementation-complete.md`
- **Test Scripts:** `__test__/` directory

---

🎯 **Status: READY FOR PRODUCTION** ✅

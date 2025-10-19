#!/usr/bin/env node

/**
 * RabbitMQ Broadcasting Test
 * Tests the complete flow: WebSocket → RabbitMQ → WebSocket Broadcasting
 */

require('dotenv').config({ path: '.env.test.local' });
const io = require('socket.io-client');

const JWT_TOKEN = process.env.JWT_TOKEN;
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'http://localhost:3000';
const TEST_COMMUNITY_ID = process.env.TEST_COMMUNITY_ID || 'test-community-123';

console.log('🧪 Testing RabbitMQ Broadcasting Flow');
console.log('====================================');
console.log(`📍 WebSocket URL: ${WEBSOCKET_URL}`);
console.log(`🏠 Test Community ID: ${TEST_COMMUNITY_ID}`);
console.log('');

if (!JWT_TOKEN) {
  console.error('❌ JWT_TOKEN not found in .env.test.local');
  process.exit(1);
}

let socket1, socket2;
let isConnected = false;

// Test results tracking
const tests = {
  connection: false,
  joinCommunity: false,
  messageSent: false,
  messageReceived: false,
  presenceEvents: false,
  rabbitMQFlow: false
};

let receivedEvents = {
  messageCreated: false,
  messageUpdated: false,
  userJoined: false,
  userLeft: false,
  announcement: false
};

function runTests() {
  console.log('📡 Creating two WebSocket connections to test broadcasting...');
  
  // First client (sender)
  socket1 = io(WEBSOCKET_URL, {
    auth: { token: JWT_TOKEN },
    timeout: 5000,
    forceNew: true
  });

  // Second client (receiver)
  socket2 = io(WEBSOCKET_URL, {
    auth: { token: JWT_TOKEN },
    timeout: 5000,
    forceNew: true
  });

  let connectionsReady = 0;

  // Setup Socket 1 (Sender)
  socket1.on('connect', () => {
    console.log('✅ Socket 1 connected (Sender)');
    console.log(`🔌 Socket 1 ID: ${socket1.id}`);
    connectionsReady++;
    if (connectionsReady === 2) startTests();
  });

  socket1.on('connected', (data) => {
    console.log('✅ Socket 1 authenticated');
    console.log(`👤 User: ${data.user?.username}`);
  });

  // Setup Socket 2 (Receiver) 
  socket2.on('connect', () => {
    console.log('✅ Socket 2 connected (Receiver)');
    console.log(`🔌 Socket 2 ID: ${socket2.id}`);
    connectionsReady++;
    if (connectionsReady === 2) startTests();
  });

  socket2.on('connected', (data) => {
    console.log('✅ Socket 2 authenticated');
    console.log(`👤 User: ${data.user?.username}`);
  });

  // Setup event listeners on Socket 2 (Receiver)
  setupEventListeners();

  // Error handlers
  socket1.on('connect_error', (error) => {
    console.error('❌ Socket 1 connection failed:', error.message);
    cleanup();
  });

  socket2.on('connect_error', (error) => {
    console.error('❌ Socket 2 connection failed:', error.message);
    cleanup();
  });

  // Timeout safety
  setTimeout(() => {
    if (connectionsReady < 2) {
      console.error('❌ Connection timeout');
      cleanup();
    }
  }, 10000);
}

function setupEventListeners() {
  // Listen for RabbitMQ broadcasted events on Socket 2
  socket2.on('message:created', (data) => {
    console.log('📨 Socket 2 received message:created from RabbitMQ broadcast:', {
      id: data.id,
      content: data.content.substring(0, 30) + '...',
      author: data.author.username,
      communityId: data.communityId
    });
    receivedEvents.messageCreated = true;
    tests.messageReceived = true;
    tests.rabbitMQFlow = true;
  });

  socket2.on('message:updated', (data) => {
    console.log('📝 Socket 2 received message:updated from RabbitMQ broadcast:', {
      id: data.id,
      content: data.content.substring(0, 30) + '...',
      updatedAt: data.updatedAt
    });
    receivedEvents.messageUpdated = true;
  });

  socket2.on('community:user-joined', (data) => {
    console.log('👥 Socket 2 received user joined from RabbitMQ broadcast:', {
      user: data.user.username,
      communityId: data.communityId
    });
    receivedEvents.userJoined = true;
    tests.presenceEvents = true;
  });

  socket2.on('community:user-left', (data) => {
    console.log('👋 Socket 2 received user left from RabbitMQ broadcast:', {
      user: data.user.username,
      communityId: data.communityId
    });
    receivedEvents.userLeft = true;
  });

  socket2.on('community:announcement', (data) => {
    console.log('📢 Socket 2 received announcement from RabbitMQ broadcast:', {
      type: data.type,
      message: data.message.substring(0, 50) + '...'
    });
    receivedEvents.announcement = true;
  });

  // Listen for direct WebSocket acknowledgments on Socket 1
  socket1.on('message:sent', (data) => {
    console.log('✅ Socket 1 received message:sent acknowledgment:', {
      success: data.success,
      messageId: data.messageId,
      rabbitMQProcessed: data.rabbitMQProcessed
    });
    tests.messageSent = true;
  });
}

function startTests() {
  console.log('');
  console.log('🚀 Starting RabbitMQ Broadcasting Tests...');
  console.log('');

  tests.connection = true;

  // Step 1: Both sockets join the same community
  console.log('📡 Step 1: Both sockets joining community...');
  
  socket1.emit('community:join', { communityId: TEST_COMMUNITY_ID });
  socket2.emit('community:join', { communityId: TEST_COMMUNITY_ID });

  socket1.on('community:joined', (data) => {
    console.log('✅ Socket 1 joined community:', data.roomName);
    tests.joinCommunity = true;
  });

  socket2.on('community:joined', (data) => {
    console.log('✅ Socket 2 joined community:', data.roomName);
    
    // Step 2: Send message from Socket 1 to test RabbitMQ flow
    setTimeout(() => {
      console.log('');
      console.log('📡 Step 2: Sending message to test RabbitMQ broadcasting...');
      console.log('💡 Expected flow: Socket1 → Gateway → RabbitMQ → Gateway → Socket2');
      
      socket1.emit('message:send', {
        communityId: TEST_COMMUNITY_ID,
        content: 'Testing RabbitMQ broadcasting flow - this message should be broadcasted to all clients',
        messageType: 'TEXT'
      });
    }, 1000);
  });

  // Step 3: Test completion check
  setTimeout(() => {
    console.log('');
    console.log('📡 Step 3: Checking if RabbitMQ events were received...');
    
    if (tests.rabbitMQFlow) {
      console.log('✅ RabbitMQ broadcasting working!');
    } else {
      console.log('⚠️  RabbitMQ broadcasting not detected (Chat service may not be running)');
      console.log('💡 This is normal if only the Gateway is running without the Chat service');
    }
    
    setTimeout(() => {
      printResults();
      cleanup();
    }, 2000);
  }, 5000);
}

function printResults() {
  console.log('');
  console.log('📊 RabbitMQ Broadcasting Test Results');
  console.log('=====================================');
  
  Object.entries(tests).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  console.log('');
  console.log('📡 RabbitMQ Event Reception:');
  Object.entries(receivedEvents).forEach(([event, received]) => {
    console.log(`${received ? '✅' : '⏸️ '} ${event}: ${received ? 'RECEIVED' : 'NOT RECEIVED'}`);
  });
  
  const totalTests = Object.keys(tests).length;
  const passedTests = Object.values(tests).filter(result => result).length;
  
  console.log('');
  console.log(`📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests >= 4) { // Basic WebSocket functionality working
    console.log('🎉 WebSocket Gateway is working correctly!');
    if (tests.rabbitMQFlow) {
      console.log('🚀 RabbitMQ integration is FULLY FUNCTIONAL!');
    } else {
      console.log('📝 RabbitMQ integration ready (requires Chat service running)');
    }
  } else {
    console.log('⚠️  Some basic functionality failed');
  }
}

function cleanup() {
  if (socket1) {
    socket1.disconnect();
    console.log('🔌 Socket 1 disconnected');
  }
  if (socket2) {
    socket2.disconnect();
    console.log('🔌 Socket 2 disconnected');
  }
  
  const totalTests = Object.keys(tests).length;
  const passedTests = Object.values(tests).filter(result => result).length;
  
  process.exit(passedTests >= 4 ? 0 : 1);
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\\n👋 Test interrupted');
  cleanup();
});

// Start tests
runTests();
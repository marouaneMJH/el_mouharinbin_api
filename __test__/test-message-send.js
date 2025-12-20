#!/usr/bin/env node

/**
 * Test WebSocket Message Send Functionality
 * Tests the message:send event implementation
 *
 * Usage: node __test__/test-message-send.js
 */

require('dotenv').config({ path: '.env.test.local' });
const io = require('socket.io-client');

// Configuration from test environment
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || process.env.TEST_JWT_TOKEN;
const TEST_COMMUNITY_ID = process.env.TEST_COMMUNITY_ID || 'test-community-123';

console.log('🧪 Testing WebSocket Message Send Functionality');
console.log('📍 WebSocket URL:', WEBSOCKET_URL);
console.log('🏠 Test Community ID:', TEST_COMMUNITY_ID);
console.log('');

if (!JWT_TOKEN) {
  console.error('❌ No JWT_TOKEN found in .env.test.local');
  process.exit(1);
}

// Create WebSocket connection
const socket = io(WEBSOCKET_URL, {
  auth: {
    token: JWT_TOKEN,
  },
  transports: ['websocket'],
});

let testResults = {
  connection: false,
  communityJoin: false,
  messageSend: false,
  acknowledgment: false,
  validation: false,
  rateLimitSingle: false,
  rateLimitBurst: false,
  errorHandling: false,
};

let timeoutId;
let messagesSent = 0;

// Test timeout
timeoutId = setTimeout(() => {
  console.log('⏰ Test timeout reached');
  printResults();
  socket.disconnect();
  process.exit(1);
}, 45000);

// Connection successful
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket Gateway');
  console.log('🔌 Socket ID:', socket.id);
  testResults.connection = true;

  // First join the community to test message sending
  setTimeout(() => {
    console.log('');
    console.log('📡 Step 1: Joining community to test message sending...');
    socket.emit('community:join', { communityId: TEST_COMMUNITY_ID });
  }, 1000);
});

// Connection confirmation
socket.on('connected', (data) => {
  console.log('🎉 Connection confirmed with user data');
  console.log('👤 User:', data.user.username, '(' + data.user.email + ')');
});

// Joined community confirmation
socket.on('community:joined', (data) => {
  console.log('✅ Successfully joined community:', data.communityId);
  testResults.communityJoin = true;

  // Now test sending a message
  setTimeout(() => {
    console.log('');
    console.log('📡 Step 2: Testing message:send event...');
    socket.emit('message:send', {
      communityId: TEST_COMMUNITY_ID,
      content: 'Hello, this is a test message from WebSocket!',
      messageType: 'TEXT',
    });
  }, 2000);
});

// Message sent confirmation
// Listen for message sent confirmations (our custom acknowledgment)
socket.on('message:sent', (data) => {
  console.log('✅ Message sent confirmation received:', {
    success: data.success,
    messageId: data.messageId,
    communityId: data.communityId,
    content:
      data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
    rabbitMQProcessed: data.rabbitMQProcessed,
  });
  console.log('🆔 Message ID:', data.messageId);
  console.log(
    '📡 RabbitMQ Processed:',
    data.rabbitMQProcessed ? 'Yes' : 'No (normal in test env)',
  );

  testResults.messageSend = true;
  testResults.acknowledgment = true;
  messagesSent++;

  if (messagesSent === 1) {
    // Test validation with empty message
    setTimeout(() => {
      console.log('');
      console.log('📡 Step 3: Testing validation (empty message)...');
      socket.emit('message:send', {
        communityId: TEST_COMMUNITY_ID,
        content: '   ', // Only whitespace
        messageType: 'TEXT',
      });
    }, 1000);
  } else if (messagesSent === 2) {
    // Test rate limiting with multiple messages
    setTimeout(() => {
      console.log('');
      console.log(
        '📡 Step 4: Testing rate limiting (sending 12 messages quickly)...',
      );

      // Send multiple messages rapidly to test rate limiting
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          socket.emit('message:send', {
            communityId: TEST_COMMUNITY_ID,
            content: `Rate limit test message ${i + 1}`,
            messageType: 'TEXT',
          });
        }, i * 50); // Send every 50ms
      }
    }, 1000);
  }
});

// Listen for new message broadcasts (from other clients or our own)
socket.on('message:created', (data) => {
  console.log('📨 New message broadcast received:', {
    id: data.id,
    content: data.content,
    author: data.author.username,
    createdAt: data.createdAt,
  });
});

// Error handling
socket.on('error', (error) => {
  console.log('📋 Error event received:', error);
  console.log('📋 Error details:', {
    event: error.event,
    message: error.message,
    details: error.details,
    waitTime: error.waitTime,
  });

  if (error.event === 'message:send') {
    if (error.message.includes('empty')) {
      console.log('✅ Validation test passed: Empty message detected');
      testResults.validation = true;

      // Send a valid message after validation test
      setTimeout(() => {
        socket.emit('message:send', {
          communityId: TEST_COMMUNITY_ID,
          content: 'Valid message after validation test',
          messageType: 'TEXT',
        });
      }, 500);
    } else if (error.message.includes('Rate limit exceeded')) {
      console.log('✅ Rate limiting test passed: Rate limit detected');
      console.log('⏱️ Wait time:', error.waitTime || 'not specified', 'ms');
      testResults.rateLimitBurst = true;

      // Test error handling with missing community ID
      setTimeout(() => {
        console.log('');
        console.log(
          '📡 Step 5: Testing error handling (missing community ID)...',
        );
        socket.emit('message:send', {
          content: 'This message has no community ID',
          messageType: 'TEXT',
        });
      }, 2000);
    } else if (error.message.includes('Community ID is required')) {
      console.log(
        '✅ Error handling test passed: Missing community ID detected',
      );
      testResults.errorHandling = true;

      // All tests completed
      setTimeout(() => {
        console.log('');
        console.log('🎯 All tests completed!');
        printResults();
        cleanup();
      }, 1000);
    } else {
      console.log('❌ Unexpected error:', error.message);
      console.log('📋 Full error object:', JSON.stringify(error, null, 2));
    }
  } else {
    console.log('❌ Non-message error:', error);
  }
});

// Connection errors
socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  cleanup();
});

// Disconnection
socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

function printResults() {
  console.log('');
  console.log('📊 Test Results Summary:');
  console.log('========================');
  console.log('✅ Connection:', testResults.connection ? 'PASS' : '❌ FAIL');
  console.log(
    '✅ Community Join:',
    testResults.communityJoin ? 'PASS' : '❌ FAIL',
  );
  console.log('✅ Message Send:', testResults.messageSend ? 'PASS' : '❌ FAIL');
  console.log(
    '✅ Acknowledgment:',
    testResults.acknowledgment ? 'PASS' : '❌ FAIL',
  );
  console.log('✅ Validation:', testResults.validation ? 'PASS' : '❌ FAIL');
  console.log(
    '✅ Rate Limit Detection:',
    testResults.rateLimitBurst ? 'PASS' : '❌ FAIL',
  );
  console.log(
    '✅ Error Handling:',
    testResults.errorHandling ? 'PASS' : '❌ FAIL',
  );

  const passedTests = Object.values(testResults).filter(
    (result) => result,
  ).length;
  const totalTests = Object.keys(testResults).length;

  console.log('');
  console.log(`📈 Overall: ${passedTests}/${totalTests} tests passed`);
  console.log(`📨 Messages sent: ${messagesSent}`);

  if (passedTests === totalTests) {
    console.log(
      '🎉 All tests PASSED! Message send functionality is working correctly.',
    );
  } else {
    console.log('⚠️  Some tests FAILED. Please check the implementation.');
  }
}

function cleanup() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  socket.disconnect();
  const passed = Object.values(testResults).filter((result) => result).length;
  const total = Object.keys(testResults).length;
  process.exit(passed === total ? 0 : 1);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  cleanup();
});

process.on('SIGTERM', () => {
  console.log('\n👋 Test terminated');
  cleanup();
});

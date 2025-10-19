#!/usr/bin/env node

/**
 * Test WebSocket Community Leave Functionality
 * Tests the community:leave event implementation
 *
 * Usage: node __test__/test-community-leave.js
 */

require('dotenv').config({ path: '.env.test.local' });
const io = require('socket.io-client');

// Configuration from test environment
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || process.env.TEST_JWT_TOKEN;
const TEST_COMMUNITY_ID = process.env.TEST_COMMUNITY_ID || 'test-community-123';

console.log('🧪 Testing WebSocket Community Leave Functionality');
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
  communityLeave: false,
  acknowledgment: false,
  memberNotification: false,
  errorHandling: false,
};

let timeoutId;

// Test timeout
timeoutId = setTimeout(() => {
  console.log('⏰ Test timeout reached');
  printResults();
  socket.disconnect();
  process.exit(1);
}, 30000);

// Connection successful
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket Gateway');
  console.log('🔌 Socket ID:', socket.id);
  testResults.connection = true;

  // First join the community to test leaving
  setTimeout(() => {
    console.log('');
    console.log('📡 Step 1: Joining community to test leave functionality...');
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
  console.log('🏠 Room:', data.roomName);
  testResults.communityJoin = true;

  // Now test leaving the community
  setTimeout(() => {
    console.log('');
    console.log('📡 Step 2: Testing community:leave event...');
    socket.emit('community:leave', { communityId: TEST_COMMUNITY_ID });
  }, 2000);
});

// Community left confirmation (NEW EVENT)
socket.on('community:left', (data) => {
  console.log('✅ Successfully left community with new event:', data);
  console.log('🏠 Left Room:', data.roomName);
  console.log('⏰ Left At:', data.leftAt);

  testResults.communityLeave = true;
  testResults.acknowledgment = true;

  // Test error handling
  setTimeout(() => {
    console.log('');
    console.log('📡 Step 3: Testing error handling (missing community ID)...');
    socket.emit('community:leave', {}); // Missing communityId
  }, 1000);
});

// Listen for member notifications (should be received by other clients)
socket.on('community:user-left', (data) => {
  console.log('👤 User left notification (new event):', data.user.username);
  console.log('🏠 Community:', data.communityId);
  console.log('⏰ Left At:', data.leftAt);
  testResults.memberNotification = true;
});

// Legacy events for backward compatibility
socket.on('left-community', (data) => {
  console.log('✅ Successfully left community (legacy event):', data);
});

socket.on('user:left', (data) => {
  console.log('👤 User left notification (legacy event):', data.user.username);
});

// Error handling
socket.on('error', (error) => {
  console.log('📋 Error event received:', error);

  if (
    error.event === 'community:leave' &&
    error.message.includes('Community ID is required')
  ) {
    console.log('✅ Error handling test passed: Missing community ID detected');
    testResults.errorHandling = true;

    // All tests completed
    setTimeout(() => {
      console.log('');
      console.log('🎯 All tests completed!');
      printResults();
      cleanup();
    }, 1000);
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
  console.log(
    '✅ Community Leave:',
    testResults.communityLeave ? 'PASS' : '❌ FAIL',
  );
  console.log(
    '✅ Acknowledgment:',
    testResults.acknowledgment ? 'PASS' : '❌ FAIL',
  );
  console.log(
    '✅ Member Notification:',
    testResults.memberNotification ? 'PASS' : '❌ FAIL',
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

  if (passedTests === totalTests) {
    console.log(
      '🎉 All tests PASSED! Community leave functionality is working correctly.',
    );
  } else {
    console.log('⚠️  Some tests FAILED. Please check the implementation.');
  }
}

function cleanup() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (socket) {
    console.log('🔌 Disconnected: io client disconnect');
    socket.disconnect();
  }

  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(
    (result) => result,
  ).length;

  process.exit(passedTests === totalTests ? 0 : 1);
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

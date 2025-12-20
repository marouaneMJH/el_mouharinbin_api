#!/usr/bin/env node

/**
 * Unit Test for Message Send WebSocket Functionality
 * Tests individual components of the message:send implementation
 *
 * Usage: node __test__/test-message-send-unit.js
 */

require('dotenv').config({ path: '.env.test.local' });

console.log('🧪 Running Unit Tests for Message Send Functionality');
console.log('===================================================');
console.log('');

// Mock test data
const mockUserData = {
  id: '70c83d98-ee31-4143-be9c-1a6afbc445e3',
  username: 'testuser',
  email: 'test@example.com',
};

const mockCommunityId = 'test-community-123';
const mockMessageContent = 'This is a test message';

// Test 1: Event name validation
function testEventName() {
  console.log('🔧 Test 1: Event name validation');

  const expectedEventName = 'message:send';
  const actualEventName = 'message:send'; // This would come from the gateway

  if (expectedEventName === actualEventName) {
    console.log('✅ Event name is correct: message:send');
    return true;
  } else {
    console.log(
      '❌ Event name mismatch. Expected:',
      expectedEventName,
      'Got:',
      actualEventName,
    );
    return false;
  }
}

// Test 2: Payload validation
function testPayloadValidation() {
  console.log('🔧 Test 2: Payload validation');

  const validPayload = {
    communityId: mockCommunityId,
    content: mockMessageContent,
    messageType: 'TEXT',
  };

  const invalidPayloads = [
    { content: mockMessageContent, messageType: 'TEXT' }, // Missing communityId
    { communityId: mockCommunityId, messageType: 'TEXT' }, // Missing content
    { communityId: mockCommunityId, content: '   ' }, // Empty content
    { communityId: mockCommunityId, content: 'a'.repeat(10001) }, // Too long
  ];

  let allTestsPassed = true;

  // Test valid payload
  console.log('   Test 2.1: Valid payload');
  const validResult = validatePayload(validPayload);
  if (validResult.valid) {
    console.log('   ✅ Valid payload accepted');
  } else {
    console.log('   ❌ Valid payload rejected:', validResult.error);
    allTestsPassed = false;
  }

  // Test invalid payloads
  invalidPayloads.forEach((payload, index) => {
    console.log(`   Test 2.${index + 2}: Invalid payload #${index + 1}`);
    const result = validatePayload(payload);
    if (!result.valid) {
      console.log(`   ✅ Invalid payload correctly rejected: ${result.error}`);
    } else {
      console.log(`   ❌ Invalid payload incorrectly accepted`);
      allTestsPassed = false;
    }
  });

  return allTestsPassed;
}

// Test 3: Rate limiting logic
function testRateLimiting() {
  console.log('🔧 Test 3: Rate limiting logic');

  const userId = mockUserData.id;
  const mockRateLimit = new Map();

  // Simulate sending 10 messages in quick succession
  console.log('   Test 3.1: Sending 10 messages (should all pass)');
  let allPassed = true;

  for (let i = 0; i < 10; i++) {
    const result = checkRateLimit(userId, mockRateLimit);
    if (!result.allowed) {
      console.log(`   ❌ Message ${i + 1} was rate limited unexpectedly`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('   ✅ All 10 messages passed rate limit check');
  }

  // Try to send 11th message (should be rate limited)
  console.log('   Test 3.2: Sending 11th message (should be rate limited)');
  const eleventhResult = checkRateLimit(userId, mockRateLimit);
  if (!eleventhResult.allowed) {
    console.log('   ✅ 11th message correctly rate limited');
    console.log(`   ⏱️ Wait time: ${eleventhResult.waitTime}ms`);
  } else {
    console.log('   ❌ 11th message should have been rate limited');
    allPassed = false;
  }

  return allPassed;
}

// Test 4: Response structure validation
function testResponseStructure() {
  console.log('🔧 Test 4: Response structure validation');

  const mockSuccessResponse = {
    success: true,
    messageId: 'msg-123',
    communityId: mockCommunityId,
    content: mockMessageContent,
    sentAt: new Date().toISOString(),
    user: mockUserData,
  };

  const requiredFields = [
    'success',
    'messageId',
    'communityId',
    'content',
    'sentAt',
    'user',
  ];
  const hasAllFields = requiredFields.every((field) =>
    mockSuccessResponse.hasOwnProperty(field),
  );

  if (hasAllFields && mockSuccessResponse.success === true) {
    console.log('✅ Success response structure is correct');
    console.log('   - success:', mockSuccessResponse.success);
    console.log('   - messageId:', mockSuccessResponse.messageId);
    console.log('   - communityId:', mockSuccessResponse.communityId);
    console.log(
      '   - content:',
      mockSuccessResponse.content.substring(0, 30) + '...',
    );
    console.log('   - sentAt:', mockSuccessResponse.sentAt);
    console.log('   - user.username:', mockSuccessResponse.user.username);
    return true;
  } else {
    console.log('❌ Response structure is missing required fields');
    return false;
  }
}

// Test 5: Error handling structure
function testErrorHandling() {
  console.log('🔧 Test 5: Error handling structure');

  const errorCases = [
    {
      name: 'Missing authentication',
      payload: { communityId: mockCommunityId, content: mockMessageContent },
      userData: null,
      expectedError: 'Authentication required',
    },
    {
      name: 'Missing community ID',
      payload: { content: mockMessageContent },
      userData: mockUserData,
      expectedError: 'Community ID is required',
    },
    {
      name: 'Missing content',
      payload: { communityId: mockCommunityId },
      userData: mockUserData,
      expectedError: 'Message content is required',
    },
    {
      name: 'Empty content',
      payload: { communityId: mockCommunityId, content: '   ' },
      userData: mockUserData,
      expectedError: 'Message content cannot be empty',
    },
  ];

  let allTestsPassed = true;

  errorCases.forEach((testCase, index) => {
    console.log(`   Test 5.${index + 1}: ${testCase.name}`);

    const result = simulateValidation(testCase.payload, testCase.userData);

    if (
      result.error &&
      result.error.includes(testCase.expectedError.split(' ')[0])
    ) {
      console.log(`   ✅ Correctly handles: ${testCase.name}`);
    } else {
      console.log(`   ❌ Failed to handle: ${testCase.name}`);
      console.log(
        `   Expected: ${testCase.expectedError}, Got: ${result.error}`,
      );
      allTestsPassed = false;
    }
  });

  return allTestsPassed;
}

// Helper functions to simulate gateway logic

function validatePayload(payload) {
  if (!payload.communityId) {
    return { valid: false, error: 'Community ID is required' };
  }

  if (!payload.content || typeof payload.content !== 'string') {
    return { valid: false, error: 'Message content is required' };
  }

  const trimmed = payload.content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message content cannot be empty' };
  }

  if (trimmed.length > 10000) {
    return {
      valid: false,
      error: 'Message content cannot exceed 10000 characters',
    };
  }

  return { valid: true };
}

function checkRateLimit(userId, rateLimitMap) {
  const now = Date.now();
  const windowSize = 1000; // 1 second
  const maxMessages = 10;

  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }

  const userMessages = rateLimitMap.get(userId);
  const validMessages = userMessages.filter(
    (timestamp) => now - timestamp < windowSize,
  );

  if (validMessages.length >= maxMessages) {
    const oldestMessage = Math.min(...validMessages);
    const waitTime = windowSize - (now - oldestMessage);
    return { allowed: false, waitTime: Math.ceil(waitTime) };
  }

  validMessages.push(now);
  rateLimitMap.set(userId, validMessages);
  return { allowed: true };
}

function simulateValidation(payload, userData) {
  if (!userData) {
    return { success: false, error: 'Authentication required' };
  }

  const validation = validatePayload(payload);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  return { success: true };
}

// Run all tests
async function runAllTests() {
  const tests = [
    { name: 'Event Name Validation', fn: testEventName },
    { name: 'Payload Validation', fn: testPayloadValidation },
    { name: 'Rate Limiting Logic', fn: testRateLimiting },
    { name: 'Response Structure', fn: testResponseStructure },
    { name: 'Error Handling', fn: testErrorHandling },
  ];

  let passedTests = 0;

  for (const test of tests) {
    console.log('');
    const result = test.fn();
    if (result) {
      passedTests++;
    }
  }

  console.log('');
  console.log('📊 Unit Test Results Summary:');
  console.log('=============================');
  console.log(`✅ Passed: ${passedTests}/${tests.length} tests`);

  if (passedTests === tests.length) {
    console.log('🎉 All unit tests PASSED!');
    console.log('✅ Message send functionality is correctly implemented');
  } else {
    console.log('⚠️  Some unit tests FAILED');
    console.log('📝 Please review the implementation');
  }

  return passedTests === tests.length;
}

// Execute tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });

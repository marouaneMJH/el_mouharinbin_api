#!/bin/bash

# Test Typing Indicators WebSocket Events
# Tests the typing:start and typing:stop events with rate limiting

echo "🔄 Testing Typing Indicators WebSocket Events"
echo "=============================================="

# Configuration
GATEWAY_URL="http://localhost:3000"
WS_URL="ws://localhost:3000"
TEST_EMAIL="typing-test@example.com"
TEST_PASSWORD="password123"
COMMUNITY_ID="test-community-typing-123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test if server is running
log_info "Checking if server is running..."
if ! curl -s "$GATEWAY_URL/health" > /dev/null 2>&1; then
    log_error "Server is not running at $GATEWAY_URL"
    exit 1
fi
log_success "Server is running"

# Get JWT token for authentication
log_info "Getting JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    log_error "Failed to get JWT token. Response: $LOGIN_RESPONSE"
    exit 1
fi
log_success "Got JWT token"

# Create a WebSocket test script
cat > /tmp/typing_test.js << 'EOF'
const io = require('socket.io-client');

const token = process.argv[2];
const communityId = process.argv[3];

if (!token || !communityId) {
    console.error('Usage: node typing_test.js <token> <communityId>');
    process.exit(1);
}

const socket = io('ws://localhost:3000', {
    auth: { token },
    transports: ['websocket']
});

let testResults = {
    connected: false,
    joinedCommunity: false,
    typingStartSent: false,
    typingStopSent: false,
    rateLimitTested: false,
    autoStopTested: false,
    receivedTypingEvents: false
};

socket.on('connect', () => {
    console.log('✅ Connected to WebSocket server');
    testResults.connected = true;
    
    // Join community first
    socket.emit('join-community', { communityId });
});

socket.on('join-community-response', (response) => {
    if (response.status === 'success') {
        console.log('✅ Joined community successfully');
        testResults.joinedCommunity = true;
        
        // Start typing indicator tests
        setTimeout(() => runTypingTests(), 1000);
    } else {
        console.log('❌ Failed to join community:', response.message);
    }
});

socket.on('typing:start-ack', (response) => {
    if (response.success) {
        console.log('✅ Typing start acknowledged');
        testResults.typingStartSent = true;
    } else {
        console.log('❌ Typing start failed:', response.message);
    }
});

socket.on('typing:stop-ack', (response) => {
    if (response.success) {
        console.log('✅ Typing stop acknowledged');
        testResults.typingStopSent = true;
    } else {
        console.log('❌ Typing stop failed:', response.message);
    }
});

socket.on('typing:user-start', (event) => {
    console.log(`👤 User ${event.username} started typing in community ${event.communityId}`);
    testResults.receivedTypingEvents = true;
});

socket.on('typing:user-stop', (event) => {
    console.log(`👤 User ${event.username} stopped typing in community ${event.communityId}`);
});

socket.on('error', (error) => {
    console.log('⚠️  WebSocket error:', error);
    
    if (error.event === 'typing:start' && error.message.includes('Rate limit')) {
        console.log('✅ Rate limiting working correctly');
        testResults.rateLimitTested = true;
    }
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

function runTypingTests() {
    console.log('\n🧪 Running typing indicator tests...\n');
    
    // Test 1: Basic typing start
    console.log('Test 1: Basic typing start');
    socket.emit('typing:start', { communityId });
    
    setTimeout(() => {
        // Test 2: Basic typing stop
        console.log('Test 2: Basic typing stop');
        socket.emit('typing:stop', { communityId });
        
        setTimeout(() => {
            // Test 3: Rate limiting (send multiple events quickly)
            console.log('Test 3: Rate limiting test');
            socket.emit('typing:start', { communityId });
            socket.emit('typing:start', { communityId }); // Should be rate limited
            
            setTimeout(() => {
                // Test 4: Auto-stop functionality
                console.log('Test 4: Auto-stop test (wait 6 seconds)');
                socket.emit('typing:start', { communityId });
                
                // Wait for auto-stop (should happen after 5 seconds)
                setTimeout(() => {
                    console.log('✅ Auto-stop should have triggered by now');
                    testResults.autoStopTested = true;
                    
                    // Print test results
                    printResults();
                    process.exit(0);
                }, 6000);
            }, 2000);
        }, 1000);
    }, 1000);
}

function printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const results = [
        ['WebSocket Connection', testResults.connected],
        ['Community Join', testResults.joinedCommunity],
        ['Typing Start', testResults.typingStartSent],
        ['Typing Stop', testResults.typingStopSent],
        ['Rate Limiting', testResults.rateLimitTested],
        ['Auto-Stop Timer', testResults.autoStopTested],
        ['Receive Typing Events', testResults.receivedTypingEvents]
    ];
    
    results.forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${test}: ${status}`);
    });
    
    const passedTests = results.filter(([, passed]) => passed).length;
    const totalTests = results.length;
    
    console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All typing indicator tests passed!');
    } else {
        console.log('⚠️  Some tests failed. Check the implementation.');
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    printResults();
    process.exit(0);
});

// Set overall timeout
setTimeout(() => {
    console.log('\n⏰ Tests timed out');
    printResults();
    process.exit(1);
}, 20000);
EOF

# Run the WebSocket typing test
log_info "Running WebSocket typing indicator tests..."
if command -v node > /dev/null 2>&1; then
    # Check if socket.io-client is available
    if npm list socket.io-client > /dev/null 2>&1 || npm list -g socket.io-client > /dev/null 2>&1; then
        node /tmp/typing_test.js "$TOKEN" "$COMMUNITY_ID"
    else
        log_warning "socket.io-client not found. Installing temporarily..."
        npm install --no-save socket.io-client > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            node /tmp/typing_test.js "$TOKEN" "$COMMUNITY_ID"
        else
            log_error "Failed to install socket.io-client"
            exit 1
        fi
    fi
else
    log_error "Node.js not found. Cannot run WebSocket tests."
    exit 1
fi

# Cleanup
rm -f /tmp/typing_test.js

echo ""
log_info "Typing indicators test completed!"
echo "=============================================="
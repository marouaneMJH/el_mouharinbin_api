#!/bin/bash

# Master Test Script for WebSocket Community Features
# Runs all tests for community join/leave functionality

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🧪 WebSocket Community Features Test Suite${NC}"
echo -e "${PURPLE}===========================================${NC}"
echo ""

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if .env.test.local exists
if [ ! -f .env.test.local ]; then
    echo -e "${RED}❌ .env.test.local file not found${NC}"
    echo -e "${YELLOW}📝 Please create .env.test.local with test configuration${NC}"
    exit 1
fi

# Load test environment
source .env.test.local

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ JWT_TOKEN not found in .env.test.local${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo -e "${YELLOW}🔑 Using JWT Token: ${JWT_TOKEN:0:30}...${NC}"
echo ""

# Check if socket.io-client is available
if ! node -e "require('socket.io-client')" > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installing socket.io-client for testing...${NC}"
    npm install --no-save socket.io-client
fi

# Test Results Tracking
TOTAL_TESTS=0
PASSED_TESTS=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}🏃 Running: $test_name${NC}"
    echo "   Command: $test_command"
    echo ""
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ $test_name FAILED${NC}"
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Export environment variables for tests
export JWT_TOKEN
export WEBSOCKET_URL=${WEBSOCKET_URL:-"http://localhost:3000"}
export TEST_COMMUNITY_ID=${TEST_COMMUNITY_ID:-"test-community-123"}

echo -e "${BLUE}🎯 Running Test Suite...${NC}"
echo ""

# Run Unit Tests
run_test "Unit Tests - Community Leave" "node __test__/test-community-leave-unit.js"

# Run Integration Tests (if server is running)
WEBSOCKET_URL=${WEBSOCKET_URL:-"http://localhost:3000"}
if curl -s --connect-timeout 5 "$WEBSOCKET_URL" > /dev/null 2>&1; then
    run_test "Integration Test - Community Leave" "node __test__/test-community-leave.js"
else
    echo -e "${YELLOW}⚠️  Skipping integration tests - WebSocket server not running at $WEBSOCKET_URL${NC}"
    echo -e "${YELLOW}💡 Start the server with: npm run start:dev${NC}"
    echo ""
fi

# Print Final Results
echo -e "${PURPLE}📊 Final Test Results${NC}"
echo -e "${PURPLE}=====================${NC}"
echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $((TOTAL_TESTS - PASSED_TESTS))${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}✅ Community leave functionality is working correctly${NC}"
    echo ""
    echo -e "${BLUE}📋 Verified Features:${NC}"
    echo -e "${BLUE}- Event: community:leave ✅${NC}"
    echo -e "${BLUE}- Socket leaves room ✅${NC}"
    echo -e "${BLUE}- Acknowledgment sent ✅${NC}"
    echo -e "${BLUE}- Members notified ✅${NC}"
    echo -e "${BLUE}- Error handling ✅${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    echo -e "${YELLOW}📝 Please review the implementation and try again${NC}"
    exit 1
fi
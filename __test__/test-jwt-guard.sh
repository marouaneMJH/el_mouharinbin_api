#!/bin/bash

# Script to test JWT Guard functionality
# This script will test various scenarios to verify the guard works correctly

set -e  # Exit on any error

echo "🧪 Testing JWT Guard functionality..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GATEWAY_URL="http://localhost:3000"
CHAT_URL="http://localhost:3002"
API_ENDPOINT="/api/communities"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
    fi
}

# Function to test endpoint with different scenarios
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=$3
    local token=$4
    
    echo -e "\n${BLUE}Testing${NC}: $description"
    echo "URL: $url"
    
    if [ -n "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $token" -H "Content-Type: application/json" "$url" 2>/dev/null || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" "$url" 2>/dev/null || echo "000")
    fi
    
    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "Expected: $expected_status, Got: $status"
    
    if [ "$status" = "$expected_status" ]; then
        print_result 0 "$description"
        if [ "$status" = "200" ]; then
            echo "Response preview: $(echo "$body" | jq -r '.communities[0].name // .name // "No data"' 2>/dev/null || echo "Raw response")"
        fi
    else
        print_result 1 "$description"
        echo "Response body: $body"
    fi
}

echo -e "\n${YELLOW}1. Generating test tokens...${NC}"

# Generate valid token
echo "Generating valid token..."
VALID_TOKEN=$(node generate-test-token.js "test-user-123" "test@example.com" 2>/dev/null | grep -E '^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$' | head -1)

if [ -z "$VALID_TOKEN" ]; then
    echo -e "${RED}❌ Failed to generate valid token${NC}"
    exit 1
fi

echo "Valid token generated: ${VALID_TOKEN:0:20}..."

# Generate expired token (manually create one with past exp)
echo "Generating expired token..."
EXPIRED_TOKEN=$(JWT_SECRET=${JWT_SECRET:-secret} node -e "
const crypto = require('crypto');
function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
const header = {alg: 'HS256', typ: 'JWT'};
const payload = {id: 'test', email: 'test@example.com', role: 'user', status: 'active', iat: Math.floor(Date.now() / 1000) - 3600, exp: Math.floor(Date.now() / 1000) - 1800};
const encodedHeader = base64UrlEncode(JSON.stringify(header));
const encodedPayload = base64UrlEncode(JSON.stringify(payload));
const signature = crypto.createHmac('sha256', '${JWT_SECRET:-secret}').update(\`\${encodedHeader}.\${encodedPayload}\`).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
console.log(\`\${encodedHeader}.\${encodedPayload}.\${signature}\`);
")

# Generate inactive user token
echo "Generating inactive user token..."
INACTIVE_TOKEN=$(JWT_SECRET=${JWT_SECRET:-secret} node -e "
const crypto = require('crypto');
function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
const header = {alg: 'HS256', typ: 'JWT'};
const payload = {id: 'inactive-user', email: 'inactive@example.com', role: 'user', status: 'inactive', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600};
const encodedHeader = base64UrlEncode(JSON.stringify(header));
const encodedPayload = base64UrlEncode(JSON.stringify(payload));
const signature = crypto.createHmac('sha256', '${JWT_SECRET:-secret}').update(\`\${encodedHeader}.\${encodedPayload}\`).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
console.log(\`\${encodedHeader}.\${encodedPayload}.\${signature}\`);
")

echo -e "\n${YELLOW}2. Testing Gateway endpoints...${NC}"

# Test Gateway (port 3000)
test_endpoint "$GATEWAY_URL$API_ENDPOINT" "Gateway - No token (should return 401)" "401" ""
test_endpoint "$GATEWAY_URL$API_ENDPOINT" "Gateway - Invalid token (should return 401)" "401" "invalid.token.here"
test_endpoint "$GATEWAY_URL$API_ENDPOINT" "Gateway - Expired token (should return 401)" "401" "$EXPIRED_TOKEN"
test_endpoint "$GATEWAY_URL$API_ENDPOINT" "Gateway - Inactive user token (should return 401)" "401" "$INACTIVE_TOKEN"
test_endpoint "$GATEWAY_URL$API_ENDPOINT" "Gateway - Valid token (should return 200)" "200" "$VALID_TOKEN"

echo -e "\n${YELLOW}3. Testing Chat Service endpoints (if accessible)...${NC}"

# Test Chat Service (port 3002) - Note: Chat service should not have HTTP endpoints anymore
echo "Note: Chat service should only handle RabbitMQ messages, not HTTP requests"

echo -e "\n${YELLOW}4. Testing specific endpoints...${NC}"

# Test community creation
echo -e "\n${BLUE}Testing community creation...${NC}"
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$GATEWAY_URL$API_ENDPOINT" \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Community Guard",
    "description": "Testing JWT guard functionality"
  }' 2>/dev/null || echo "000")

CREATE_STATUS=$(echo "$CREATE_RESPONSE" | tail -n1)
CREATE_BODY=$(echo "$CREATE_RESPONSE" | head -n -1)

if [ "$CREATE_STATUS" = "201" ]; then
    print_result 0 "Community creation with valid token"
    COMMUNITY_ID=$(echo "$CREATE_BODY" | jq -r '.id' 2>/dev/null || echo "")
    echo "Created community ID: $COMMUNITY_ID"
    
    if [ -n "$COMMUNITY_ID" ] && [ "$COMMUNITY_ID" != "null" ]; then
        echo -e "\n${BLUE}Testing community details endpoint...${NC}"
        test_endpoint "$GATEWAY_URL$API_ENDPOINT/$COMMUNITY_ID" "Community details - No token (should return 401)" "401" ""
        test_endpoint "$GATEWAY_URL$API_ENDPOINT/$COMMUNITY_ID" "Community details - Valid token (should return 200)" "200" "$VALID_TOKEN"
    fi
else
    print_result 1 "Community creation with valid token"
    echo "Status: $CREATE_STATUS"
    echo "Response: $CREATE_BODY"
fi

echo -e "\n${YELLOW}5. Summary${NC}"
echo "=========================="
echo "✅ JWT Guard verification complete"
echo ""
echo "Expected behavior:"
echo "- No token: 401 Unauthorized"
echo "- Invalid token: 401 Unauthorized" 
echo "- Expired token: 401 Unauthorized"
echo "- Inactive user: 401 Unauthorized"
echo "- Valid token: 200 OK (for GET) or 201 Created (for POST)"
echo ""
echo "🔧 If tests fail, check:"
echo "1. Services are running (Gateway on :3000, Chat on :3002)"
echo "2. JWT_SECRET environment variable is set correctly"
echo "3. Database is accessible and running"
echo ""

# Export tokens for manual testing
echo "🔑 Generated tokens for manual testing:"
echo "export VALID_TOKEN=\"$VALID_TOKEN\""
echo "export EXPIRED_TOKEN=\"$EXPIRED_TOKEN\""
echo "export INACTIVE_TOKEN=\"$INACTIVE_TOKEN\""
#!/bin/bash

# Quick test for joining a community with JWT token
# Usage: ./test-join-community.sh <community-id>

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"

COMMUNITY_ID="$1"

if [ -z "$COMMUNITY_ID" ]; then
  echo -e "${RED}❌ Usage: $0 <community-id>${NC}"
  echo ""
  echo "Example:"
  echo "$0 123e4567-e89b-12d3-a456-426614174000"
  echo ""
  echo "To get a community ID, first list communities:"
  echo "curl -H \"Authorization: Bearer $JWT_TOKEN\" \"$BASE_URL/api/communities\""
  exit 1
fi

echo -e "${BLUE}=== Testing Join Community Endpoint ===${NC}"
echo -e "${YELLOW}Community ID: $COMMUNITY_ID${NC}"
echo -e "${YELLOW}JWT Token: ${JWT_TOKEN:0:50}...${NC}"
echo ""

# Test: Join community
echo -e "${BLUE}Testing POST /api/communities/$COMMUNITY_ID/join${NC}"
echo "Request: POST $BASE_URL/api/communities/$COMMUNITY_ID/join"
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/api/communities/$COMMUNITY_ID/join")

http_status=$(echo "$response" | tail -n1 | sed 's/.*HTTP_STATUS://')
response_body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_status"
echo ""

case $http_status in
  200)
    echo -e "${GREEN}✅ Success! You joined the community${NC}"
    echo "Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    ;;
  400)
    echo -e "${YELLOW}⚠️ Bad Request (400)${NC}"
    echo "Possible reasons:"
    echo "- You are already a member of this community"
    echo "- The community has reached maximum capacity"
    echo ""
    echo "Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    ;;
  404)
    echo -e "${RED}❌ Community Not Found (404)${NC}"
    echo "The community with ID '$COMMUNITY_ID' does not exist."
    echo ""
    echo "Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    ;;
  401)
    echo -e "${RED}❌ Unauthorized (401)${NC}"
    echo "Your JWT token is invalid or expired."
    echo ""
    echo "Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    ;;
  *)
    echo -e "${RED}❌ Unexpected Error ($http_status)${NC}"
    echo "Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    ;;
esac

echo ""
echo -e "${BLUE}=== Additional Tests ===${NC}"

# Test: Try to join the same community again (should fail)
echo ""
echo -e "${YELLOW}Testing duplicate join (should return 400)...${NC}"

response2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/api/communities/$COMMUNITY_ID/join")

http_status2=$(echo "$response2" | tail -n1 | sed 's/.*HTTP_STATUS://')
response_body2=$(echo "$response2" | sed '$d')

if [ "$http_status2" -eq 400 ]; then
  echo -e "${GREEN}✅ Duplicate join correctly rejected (400)${NC}"
else
  echo -e "${RED}❌ Duplicate join not handled correctly ($http_status2)${NC}"
fi

echo "Response:"
echo "$response_body2" | jq '.' 2>/dev/null || echo "$response_body2"

echo ""
echo -e "${BLUE}=== Manual Testing Examples ===${NC}"
echo ""
echo "# List all communities to get IDs:"
echo "curl -H \"Authorization: Bearer $JWT_TOKEN\" \"$BASE_URL/api/communities\""
echo ""
echo "# Get community details:"
echo "curl -H \"Authorization: Bearer $JWT_TOKEN\" \"$BASE_URL/api/communities/$COMMUNITY_ID\""
echo ""
echo "# Get your communities (should include the one you just joined):"
echo "curl -H \"Authorization: Bearer $JWT_TOKEN\" \"$BASE_URL/api/communities/my-communities\""
echo ""
echo "# Create a new community:"
echo "curl -X POST -H \"Authorization: Bearer $JWT_TOKEN\" -H \"Content-Type: application/json\" \\"
echo "  -d '{\"name\":\"Test Community\",\"description\":\"Test\",\"isPublic\":true}' \\"
echo "  \"$BASE_URL/api/communities\""
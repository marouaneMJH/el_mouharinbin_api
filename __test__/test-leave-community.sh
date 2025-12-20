#!/bin/bash

# Test script for leaving a community with JWT token
# Usage: ./test-leave-community.sh <community-id>

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
  echo "To get a community ID from your communities:"
  echo "curl -H \"Authorization: Bearer $JWT_TOKEN\" \"$BASE_URL/api/communities/my-communities\""
  exit 1
fi

echo -e "${BLUE}=== Testing Leave Community Endpoint ===${NC}"
echo -e "${YELLOW}Community ID: $COMMUNITY_ID${NC}"
echo -e "${YELLOW}JWT Token: ${JWT_TOKEN:0:50}...${NC}"
echo ""

# First, check if user is a member of this community
echo -e "${BLUE}Checking current membership status...${NC}"
my_communities=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$BASE_URL/api/communities/my-communities")
is_member=$(echo "$my_communities" | jq -r --arg id "$COMMUNITY_ID" '.[] | select(.id == $id) | .id' 2>/dev/null)

if [ "$is_member" = "$COMMUNITY_ID" ]; then
  echo -e "${GREEN}✅ You are currently a member of this community${NC}"
else
  echo -e "${YELLOW}⚠️ You don't appear to be a member of this community (this test might fail)${NC}"
fi

echo ""

# Test: Leave community
echo -e "${BLUE}Testing POST /api/communities/$COMMUNITY_ID/leave${NC}"
echo "Request: POST $BASE_URL/api/communities/$COMMUNITY_ID/leave"
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/api/communities/$COMMUNITY_ID/leave")

http_status=$(echo "$response" | tail -n1 | sed 's/.*HTTP_STATUS://')
response_body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_status"
echo ""

case $http_status in
  200)
    echo -e "${GREEN}✅ Success! You left the community${NC}"
    echo "Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    ;;
  400)
    echo -e "${YELLOW}⚠️ Bad Request (400)${NC}"
    echo "Possible reasons:"
    echo "- You are not a member of this community"
    echo "- You are the owner and cannot leave without designating another admin"
    echo "- Owner restriction: must have other admins or empty community"
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
echo -e "${BLUE}=== Post-Leave Verification ===${NC}"

# Verify user is no longer in the community
echo ""
echo -e "${YELLOW}Checking if you're still a member...${NC}"

my_communities_after=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$BASE_URL/api/communities/my-communities")
is_still_member=$(echo "$my_communities_after" | jq -r --arg id "$COMMUNITY_ID" '.[] | select(.id == $id) | .id' 2>/dev/null)

if [ -z "$is_still_member" ]; then
  echo -e "${GREEN}✅ Confirmed: You are no longer a member of this community${NC}"
else
  echo -e "${RED}❌ Warning: You still appear to be a member${NC}"
fi

echo ""
echo -e "${BLUE}=== Additional Tests ===${NC}"

# Test: Try to leave the same community again (should fail)
echo ""
echo -e "${YELLOW}Testing duplicate leave (should return 400)...${NC}"

response2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/api/communities/$COMMUNITY_ID/leave")

http_status2=$(echo "$response2" | tail -n1 | sed 's/.*HTTP_STATUS://')
response_body2=$(echo "$response2" | sed '$d')

if [ "$http_status2" -eq 400 ]; then
  echo -e "${GREEN}✅ Duplicate leave correctly rejected (400)${NC}"
else
  echo -e "${RED}❌ Duplicate leave not handled correctly ($http_status2)${NC}"
fi

echo "Response:"
echo "$response_body2" | jq '.' 2>/dev/null || echo "$response_body2"

echo ""
echo -e "${BLUE}=== Manual Testing Examples ===${NC}"
echo ""
echo "# Get your current communities:"
echo "curl -H \"Authorization: Bearer $JWT_TOKEN\" \"$BASE_URL/api/communities/my-communities\""
echo ""
echo "# Join a community first (to test leave later):"
echo "curl -X POST -H \"Authorization: Bearer $JWT_TOKEN\" \"$BASE_URL/api/communities/$COMMUNITY_ID/join\""
echo ""
echo "# Get community details to see member count:"
echo "curl -H \"Authorization: Bearer $JWT_TOKEN\" \"$BASE_URL/api/communities/$COMMUNITY_ID\""
echo ""
echo "# Create a new community (you'll be owner):"
echo "curl -X POST -H \"Authorization: Bearer $JWT_TOKEN\" -H \"Content-Type: application/json\" \\"
echo "  -d '{\"name\":\"Test Community for Leave\",\"description\":\"Testing leave functionality\"}' \\"
echo "  \"$BASE_URL/api/communities\""
echo ""
echo "# Test owner restrictions (create community, add other users, try to leave as owner):"
echo "# This requires multiple user accounts to test properly"
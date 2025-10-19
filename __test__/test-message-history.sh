#!/bin/bash

# Test script for getting message history via API Gateway
# This script tests the complete message history retrieval flow

echo "🔍 Testing Message History Functionality"
echo "========================================"

# Configuration
API_URL="http://localhost:3000"
COMMUNITY_ID="05734986-344f-4c25-b232-3321d877fa97"
JWT_TOKEN=""
echo "📜 Test 1: Get basic message history"
curl -X GET "$API_URL/api/communities/$COMMUNITY_ID/messages" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n📜 Test 2: Get message history with pagination limit"
curl -X GET "$API_URL/api/communities/$COMMUNITY_ID/messages?limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n📜 Test 3: Get message history with cursor pagination"
curl -X GET "$API_URL/api/communities/$COMMUNITY_ID/messages?limit=5&cursor=message-id-here" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n📜 Test 4: Get message history filtered by message type"
curl -X GET "$API_URL/api/communities/$COMMUNITY_ID/messages?messageType=text" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n📜 Test 5: Get message history filtered by user"
curl -X GET "$API_URL/api/communities/$COMMUNITY_ID/messages?userId=123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n📜 Test 6: Get message history with date range"
curl -X GET "$API_URL/api/communities/$COMMUNITY_ID/messages?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.000Z" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n📜 Test 7: Try to access without authentication (should fail)"
curl -X GET "$API_URL/api/communities/$COMMUNITY_ID/messages" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n📜 Test 8: Try to access non-existent community"
curl -X GET "$API_URL/api/communities/00000000-0000-0000-0000-000000000000/messages" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n📜 Test 9: Test with complex filters"
curl -X GET "$API_URL/api/communities/$COMMUNITY_ID/messages?limit=20&messageType=text&startDate=2024-01-01T00:00:00.000Z" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n✅ Message history tests completed!"
echo "Expected behavior:"
echo "- Tests 1-6, 9: Should return paginated message history"
echo "- Test 7: Should return 401 Unauthorized"
echo "- Test 8: Should return 404 Not Found or 403 Forbidden"
echo "- All successful responses should have: messages[], hasNextPage, hasPrevPage, count, limit"
echo "- Messages should be sorted by createdAt DESC"
echo "- Deleted messages should not be included"
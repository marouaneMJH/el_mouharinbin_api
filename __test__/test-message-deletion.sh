#!/bin/bash

# Test script for message deletion functionality
# This script tests the complete message deletion flow

echo "🗑️  Testing Message Deletion Functionality"
echo "=========================================="

# Configuration
API_URL="http://localhost:3000"
MESSAGE_ID="123e4567-e89b-12d3-a456-426614174000"
JWT_TOKEN="your-jwt-token-here"

echo "🗑️  Test 1: Delete own message (author deletion)"
curl -X DELETE "$API_URL/api/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Je retire mon message"
  }' | jq '.'

echo -e "\n🗑️  Test 2: Delete message without reason"
curl -X DELETE "$API_URL/api/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n🗑️  Test 3: Delete message with moderation reason"
curl -X DELETE "$API_URL/api/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Contenu inapproprié - violation des règles de la communauté"
  }' | jq '.'

echo -e "\n🗑️  Test 4: Try to delete non-existent message"
curl -X DELETE "$API_URL/api/messages/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n🗑️  Test 5: Try to delete already deleted message"
curl -X DELETE "$API_URL/api/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n🗑️  Test 6: Try to delete without authentication"
curl -X DELETE "$API_URL/api/messages/$MESSAGE_ID" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n🗑️  Test 7: Try to delete message without permissions (different user)"
DIFFERENT_USER_TOKEN="different-user-jwt-token"
curl -X DELETE "$API_URL/api/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $DIFFERENT_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Tentative de suppression sans permissions"
  }' | jq '.'

echo -e "\n🗑️  Test 8: Moderator deleting someone else's message"
MODERATOR_TOKEN="moderator-jwt-token"
curl -X DELETE "$API_URL/api/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $MODERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Modération - contenu signalé par la communauté"
  }' | jq '.'

echo -e "\n🗑️  Test 9: Delete with very long reason (should work)"
LONG_REASON="$(printf 'A%.0s' {1..400})Reason"
curl -X DELETE "$API_URL/api/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"$LONG_REASON\"
  }" | jq '.'

echo -e "\n🗑️  Test 10: Delete with too long reason (should fail validation)"
TOO_LONG_REASON="$(printf 'A%.0s' {1..600})Reason"
curl -X DELETE "$API_URL/api/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"$TOO_LONG_REASON\"
  }" | jq '.'

echo -e "\n✅ Message deletion tests completed!"
echo ""
echo "Expected behavior:"
echo "- Test 1-3: Should successfully delete message and return message data with isDeleted=true"
echo "- Test 4: Should return 404 Not Found"
echo "- Test 5: Should return 400 Bad Request (already deleted)"
echo "- Test 6: Should return 401 Unauthorized"
echo "- Test 7: Should return 403 Forbidden (insufficient permissions)"
echo "- Test 8: Should succeed if user is moderator/admin/owner"
echo "- Test 9: Should succeed with long but valid reason"
echo "- Test 10: Should fail with 400 Bad Request (reason too long)"
echo ""
echo "All successful deletions should:"
echo "- Set isDeleted=true in response"
echo "- Set deletedAt timestamp"
echo "- Publish 'chat.message.deleted' event"
echo "- Preserve original message content for audit"
#!/bin/bash

# Test script for sending messages via RabbitMQ
# This script tests the complete message sending flow

echo "🚀 Testing Message Sending Functionality"
echo "========================================"

# Configuration
API_URL="http://localhost:3000"
CHAT_SERVICE_URL="http://localhost:3001"

# Test data
USER_ID="123e4567-e89b-12d3-a456-426614174000"
USERNAME="testuser"
COMMUNITY_ID="123e4567-e89b-12d3-a456-426614174001"

echo "📝 Test 1: Send a simple text message"
curl -X POST "$CHAT_SERVICE_URL/send-message" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"username\": \"$USERNAME\",
    \"communityId\": \"$COMMUNITY_ID\",
    \"content\": \"Hello, this is a test message!\",
    \"messageType\": \"text\"
  }" | jq '.'

echo -e "\n📝 Test 2: Send a message with potential XSS content"
curl -X POST "$CHAT_SERVICE_URL/send-message" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"username\": \"$USERNAME\",
    \"communityId\": \"$COMMUNITY_ID\",
    \"content\": \"<script>alert('xss')</script>Safe content <iframe src='evil'></iframe>\",
    \"messageType\": \"text\"
  }" | jq '.'

echo -e "\n📝 Test 3: Send a long message (near limit)"
LONG_MESSAGE=$(printf 'A%.0s' {1..9999})
curl -X POST "$CHAT_SERVICE_URL/send-message" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"username\": \"$USERNAME\",
    \"communityId\": \"$COMMUNITY_ID\",
    \"content\": \"$LONG_MESSAGE\",
    \"messageType\": \"text\"
  }" | jq '.'

echo -e "\n📝 Test 4: Try to send message to non-existent community"
curl -X POST "$CHAT_SERVICE_URL/send-message" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"username\": \"$USERNAME\",
    \"communityId\": \"00000000-0000-0000-0000-000000000000\",
    \"content\": \"This should fail\",
    \"messageType\": \"text\"
  }" | jq '.'

echo -e "\n📝 Test 5: Send a reply message"
curl -X POST "$CHAT_SERVICE_URL/send-message" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"username\": \"$USERNAME\",
    \"communityId\": \"$COMMUNITY_ID\",
    \"content\": \"This is a reply to the first message\",
    \"messageType\": \"text\",
    \"replyTo\": \"message-id-here\"
  }" | jq '.'

echo -e "\n✅ Message sending tests completed!"
echo "Check the logs to verify that 'chat.message.created' events were published."
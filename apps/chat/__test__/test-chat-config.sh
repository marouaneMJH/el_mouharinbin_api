#!/bin/bash

echo "🔍 Testing Chat Service Configuration..."

# Test 1: Verify files exist
echo "✅ Testing file existence..."
test -f "apps/chat/src/main.ts" && echo "  ✓ main.ts exists"
test -f "apps/chat/src/app.chat.module.ts" && echo "  ✓ app.chat.module.ts exists"
test -f "apps/chat/src/config/rabbitmq.config.ts" && echo "  ✓ rabbitmq.config.ts exists"
test -f ".env.example" && echo "  ✓ .env.example exists"

# Test 2: Check dependencies
echo "✅ Testing dependencies..."
npm list @nestjs/websockets --depth=0 >/dev/null 2>&1 && echo "  ✓ @nestjs/websockets installed"
npm list @nestjs/microservices --depth=0 >/dev/null 2>&1 && echo "  ✓ @nestjs/microservices installed"
npm list socket.io --depth=0 >/dev/null 2>&1 && echo "  ✓ socket.io installed"

# Test 3: Compilation test
echo "✅ Testing compilation..."
npm run build chat >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✓ Chat service compiles successfully"
else
    echo "  ❌ Chat service compilation failed"
fi

echo "🎉 Chat Service configuration tests completed!"
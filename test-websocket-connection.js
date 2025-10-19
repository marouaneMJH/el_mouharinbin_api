#!/usr/bin/env node

/**
 * Simple WebSocket connection test for the Chat Gateway
 * Run this after starting the API Gateway to test WebSocket functionality
 *
 * Usage: node test-websocket-connection.js [token]
 */

const io = require('socket.io-client');

// Get token from command line argument or use a test token
const token = process.argv[2] || process.env.JWT_TOKEN || 'your-jwt-token-here';

// Connect to the WebSocket Gateway
const socket = io('http://localhost:3000', {
  auth: {
    token: token,
  },
  transports: ['websocket'],
});

console.log('🚀 Attempting WebSocket connection...');

// Connection successful
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket Gateway!');
  console.log('Socket ID:', socket.id);

  // Test joining a community
  setTimeout(() => {
    console.log('📡 Joining test community...');
    socket.emit('join-community', { communityId: 'test-community-123' });
  }, 1000);
});

// Connection confirmation with user data
socket.on('connected', (data) => {
  console.log('🎉 Connection confirmed with user data:', data);
});

// Joined community confirmation
socket.on('joined-community', (data) => {
  console.log('🏠 Successfully joined community:', data);

  // Test leaving after 3 seconds
  setTimeout(() => {
    console.log('👋 Leaving community...');
    socket.emit('leave-community', { communityId: data.communityId });
  }, 3000);
});

// Left community confirmation
socket.on('left-community', (data) => {
  console.log('🚪 Successfully left community:', data);

  // Disconnect after 2 seconds
  setTimeout(() => {
    console.log('🔌 Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

// Listen for chat events
socket.on('message:created', (data) => {
  console.log('💬 New message received:', data);
});

socket.on('message:deleted', (data) => {
  console.log('🗑️ Message deleted:', data);
});

socket.on('user:joined', (data) => {
  console.log('👤 User joined community:', data);
});

socket.on('user:left', (data) => {
  console.log('👤 User left community:', data);
});

// Handle errors
socket.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

socket.on('token:expired', (data) => {
  console.error('🔒 Token expired:', data);
});

// Connection errors
socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

// Disconnection
socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  socket.disconnect();
  process.exit(0);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - disconnecting');
  socket.disconnect();
  process.exit(0);
}, 30000);

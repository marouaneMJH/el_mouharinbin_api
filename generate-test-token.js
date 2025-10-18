#!/usr/bin/env node

/**
 * Générateur de token JWT pour les tests de l'API Community
 * Usage: node generate-test-token.js [userId] [email]
 */

const crypto = require('crypto');

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateJWT(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Configuration
const userId = process.argv[2] || 'test-user-123';
const email = process.argv[3] || 'test@example.com';
const secret = process.env.JWT_SECRET || 'secret';

const payload = {
  id: userId,
  email: email,
  role: 'user',
  status: 'active',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 jours
};

const token = generateJWT(payload, secret);

console.log('🔑 Token JWT généré:');
console.log('==================');
console.log(token);
console.log('');
console.log('📋 Payload décodé:');
console.log(JSON.stringify(payload, null, 2));
console.log('');
console.log('🧪 Test avec curl:');
console.log(`curl -X POST http://localhost:3003/api/communities \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "Authorization: Bearer ${token}" \\`);
console.log(`  -d '{`);
console.log(`    "name": "Test Community",`);
console.log(`    "description": "Une communauté de test"`);
console.log(`  }'`);
console.log('');
console.log("💡 Variables d'environnement:");
console.log(`export JWT_TOKEN="${token}"`);
console.log(`export USER_ID="${userId}"`);
console.log(`export USER_EMAIL="${email}"`);

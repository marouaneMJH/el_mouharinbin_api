import { NestFactory } from '@nestjs/core';
import { NoFapApiGatewayModule } from './no-fap-api-gateway.module';
import { RpcToHttpExceptionFilter } from '../../../libs/contract/filters/rpc-to-http.filter';
import { RpcToHttpInterceptor } from '../../../libs/contract/interceptors/rpc-to-http.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(NoFapApiGatewayModule);

  const port = process.env.SERVICE_PORT || 3000;

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors and filters
  app.useGlobalInterceptors(new RpcToHttpInterceptor());

  // Enable CORS for API access
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
      'http://localhost:5173',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('NoFap API Gateway')
    .setDescription(
      `
# NoFap API Gateway - Complete API Documentation

This API Gateway provides comprehensive access to all NoFap platform services including:

## 🔐 Authentication & Authorization
- JWT-based authentication system
- User registration and login
- Account activation and management

## 👥 User Management  
- Complete user CRUD operations
- Role-based access control
- User status management (active/inactive/suspended)
- Profile management

## 🏠 Community Management
- Create and manage communities
- Join/leave communities
- Member management
- Community messaging

## 📨 Real-time Chat & Messaging
- WebSocket-based real-time communication
- Community-based chat rooms
- Message sending with rate limiting (10 msg/sec)
- Presence notifications (user join/leave)
- Message history and management

## 📧 Email Services
- Welcome emails
- Notification system
- Template-based email sending

## 🔄 WebSocket Events
Real-time events available through WebSocket connection:
- \`community:join\` - Join a community room
- \`community:leave\` - Leave a community room  
- \`message:send\` - Send messages with rate limiting
- \`message:created\` - Receive new messages
- \`message:updated\` - Receive message updates
- \`message:deleted\` - Receive message deletions
- \`community:user-joined\` - User presence notifications
- \`community:user-left\` - User departure notifications

## 🛡️ Security Features
- JWT authentication required for protected endpoints
- Rate limiting on message sending (10 messages/second per user)
- Input validation and sanitization
- CORS protection
- Error handling and logging

## 📱 Integration Ready
- RESTful API design
- WebSocket support for real-time features
- Microservices architecture
- Event-driven communication via RabbitMQ
    `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management and profile operations')
    .addTag('Communities', 'Community management and membership')
    .addTag('Messages', 'Chat messaging and communication')
    .addTag('Mail', 'Email services and notifications')
    .addTag('WebSocket', 'Real-time WebSocket events and communication')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.nofap.dev', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Customize Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'NoFap API Documentation',
    customfavIcon: '/favicon.ico',
    customCssUrl: '/swagger-ui-custom.css',
    customJs: '/swagger-ui-custom.js',
  });

  await app.listen(port);
  console.log(`🚀 App is running on http://localhost:${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api/docs`,
  );
}
// debug make the env files works
// console.log('ENV:', process.env);

bootstrap().catch((error) => {
  console.error('Error during running the application', error);
});

import { NestFactory } from '@nestjs/core';
import { AppChatModule } from './app.chat.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Configuration RabbitMQ pour le microservice
  const rabbitmqOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASSWORD || 'guest'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || '5672'}`,
      ],
      queue: process.env.CHAT_QUEUE_NAME || 'chat_queue',
      queueOptions: {
        durable: true,
      },
    },
  };

  // Créer le microservice avec la configuration RabbitMQ
  const app = await NestFactory.createMicroservice(
    AppChatModule,
    rabbitmqOptions,
  );

  // Configuration globale des pipes de validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Démarrer le service
  await app.listen();
  console.log('🚀 Chat service is running and listening for messages...');
  console.log(
    `📡 Connected to RabbitMQ queue: ${process.env.CHAT_QUEUE_NAME || 'chat_queue'}`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Chat service:', error);
  process.exit(1);
});

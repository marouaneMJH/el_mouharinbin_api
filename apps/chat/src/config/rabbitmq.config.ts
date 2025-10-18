import { Transport, MicroserviceOptions } from '@nestjs/microservices';

/**
 * Configuration RabbitMQ pour le service Chat
 * Utilise les variables d'environnement pour la connexion
 */
export const getRabbitMQConfig = (): MicroserviceOptions => {
  const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASSWORD || 'guest'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || '5672'}`;

  return {
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: process.env.CHAT_QUEUE_NAME || 'chat_queue',
      queueOptions: {
        durable: true,
      },
      // Options de reconnexion automatique
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  };
};

/**
 * Configuration par défaut pour les tests ou le développement local
 */
export const defaultRabbitMQConfig: MicroserviceOptions = {
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://guest:guest@localhost:5672'],
    queue: 'chat_queue',
    queueOptions: {
      durable: true,
    },
  },
};

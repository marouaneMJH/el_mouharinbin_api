import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { ServiceName } from './services-pattern';

const servicesOptions: Record<ServiceName, ClientsModuleOptions> = {
  mail: [
    {
      name: 'MAIL_SERVICE',
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    },
  ],
  users: [
    {
      name: 'USERS_SERVICE',
      transport: Transport.TCP, // app.useGlobalPipes(
      //   new ValidationPipe({
      //     whitelist: true,
      //     forbidNonWhitelisted: true,
      //     transform: true,
      //   }),
      // );
      options: {
        port: 3002,
      },
    },
  ],
  auth: [
    {
      name: 'AUTH_SERVICE',
      transport: Transport.TCP, // app.useGlobalPipes(
      //   new ValidationPipe({
      //     whitelist: true,
      //     forbidNonWhitelisted: true,
      //     transform: true,
      //   }),
      // );
      options: {
        port: 3004,
      },
    },
  ],
  chat: [
    {
      name: 'CHAT_SERVICE',
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
    },
  ],
};
export { servicesOptions };
export default servicesOptions;

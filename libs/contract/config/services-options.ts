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
        urls: ['amqp://localhost:5672'],
        queue: 'message_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  ],
};
export { servicesOptions };
export default servicesOptions;

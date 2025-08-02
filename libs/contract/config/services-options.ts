import { ClientsModuleOptions, Transport } from '@nestjs/microservices';

const servicesOptions: Record<string, ClientsModuleOptions> = {
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
};
export { servicesOptions };
export default servicesOptions;

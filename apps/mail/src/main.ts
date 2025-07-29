import { MailModule } from './mail.module';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MailModule,
    {
      options: {
        port: 3001,
      },
      transport: Transport.TCP,
    },
  );
  await app.listen();
}
bootstrap();

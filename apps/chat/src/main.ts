import { NestFactory } from '@nestjs/core';
import { AppChatModule } from './app.chat.module';
import { ChatModule } from './modules/chat/chat.module';
import servicesOptions from '../../../libs/contract/config/services-options';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    ChatModule,
    servicesOptions.chat[0],
  );
  await app.listen();
}
bootstrap();

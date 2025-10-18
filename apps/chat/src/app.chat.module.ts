import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    // Configuration pour les variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/chat/.env'],
    }),
    ChatModule,
  ],
})
export class AppChatModule {}

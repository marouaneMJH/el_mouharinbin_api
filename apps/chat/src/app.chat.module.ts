import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './modules/chat/chat.module';
import { CommunityModule } from './modules/community/community.module';
import { PrismaModule } from '../../../libs/contract/modules/prisma.module';

@Module({
  imports: [
    // Configuration pour les variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/chat/.env'],
    }),
    PrismaModule,
    ChatModule,
    CommunityModule,
  ],
})
export class AppChatModule {}

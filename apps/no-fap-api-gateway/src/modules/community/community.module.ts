import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { CommunityController } from './community.controller';
import servicesOptions from '../../../../../libs/contract/config/services-options';

@Module({
  imports: [
    ClientsModule.register(servicesOptions['chat']),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [CommunityController],
})
export class CommunityModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../../../../../libs/contract/guards/jwt.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, JwtAuthGuard],
  exports: [CommunityService],
})
export class CommunityModule {}

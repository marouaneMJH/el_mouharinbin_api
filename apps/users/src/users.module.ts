import { PrismaModule } from '../prisma/src/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { join } from 'path';
import loadConfigModule from '../../../libs/contract/utils/load-config-module.util';

@Module({
  imports: [loadConfigModule('apps/users/.env'), PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

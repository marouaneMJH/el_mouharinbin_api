import { PrismaModule } from '../prisma/src/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { join } from 'path';

function loadConfigModule() {
  const paths = [join(process.cwd(), 'apps/users/.env'), '.env.shared'];

  const config = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: paths,
    cache: true,
  });

  return config;
}

@Module({
  imports: [loadConfigModule(), PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

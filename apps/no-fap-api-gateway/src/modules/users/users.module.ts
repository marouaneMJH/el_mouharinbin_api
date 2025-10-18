import { servicesOptions } from 'libs/contract/config/services-options';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [ClientsModule.register(servicesOptions['users'])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

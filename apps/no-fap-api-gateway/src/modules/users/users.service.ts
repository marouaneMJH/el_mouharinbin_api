import { servicesPattern } from './../../../../../libs/contract/config/services-pattern';
import { servicesOptions } from 'libs/contract/config/services-options';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from 'libs/contract/dtos/users/create-user.dto';
import { UpdateUserDto } from 'libs/contract/dtos/users/update-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { UserQueryOptions } from 'libs/contract/interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly usersPattern = servicesPattern['users'];
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(servicesOptions['users'][0].name) private users: ClientProxy,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.users.send(this.usersPattern.create, createUserDto);
  }

  findAll(params: UserQueryOptions) {
    return this.users.send(this.usersPattern.find_all, params);
  }

  findOne(id: string) {
    return this.users.send(this.usersPattern.find_one, { id });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.users.send(this.usersPattern.update, { id, updateUserDto });
  }

  remove(id: string) {
    return this.users.send(this.usersPattern.delete, { id });
  }
}

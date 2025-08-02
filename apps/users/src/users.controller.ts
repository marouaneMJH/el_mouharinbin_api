import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from '../../../libs/contract/dtos/users/create-user.dto';
import { UpdateUserDto } from '../../../libs/contract/dtos/users/update-user.dto';
import { servicesPattern } from 'libs/contract/config/services-pattern';
import { UserQueryOptions } from 'libs/contract/interfaces/user.interface';

@Controller()
export class UsersController {
  private readonly usersPattern = servicesPattern['users'];

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(servicesPattern.users.create)
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern(servicesPattern.users.find_all)
  findAll(@Payload() params: UserQueryOptions) {
    return this.usersService.findAll(params);
  }

  @MessagePattern(servicesPattern.users.find_one)
  findOne(@Payload() id: string) {
    return this.usersService.findOne(id);
  }

  @MessagePattern(servicesPattern.users.update)
  update(
    @Payload()
    { id, updateUserDto }: { id: string; updateUserDto: UpdateUserDto },
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @MessagePattern(servicesPattern.users.delete)
  remove(@Payload() id: string) {
    return this.usersService.remove(id);
  }
}

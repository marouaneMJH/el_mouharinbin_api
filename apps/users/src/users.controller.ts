import { Controller, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from '../../../libs/contract/dtos/users/create-user.dto';
import { UpdateUserDto } from '../../../libs/contract/dtos/users/update-user.dto';
import { servicesPattern } from 'libs/contract/config/services-pattern';
import { UserQueryOptions } from 'libs/contract/interfaces/user.interface';
import { UserStatus } from 'libs/contract/enums/user.enum';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(servicesPattern.users.create)
  async create(@Payload(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern(servicesPattern.users.find_all)
  async findAll(@Payload() params: UserQueryOptions = {}) {
    return this.usersService.findAll(params);
  }

  @MessagePattern(servicesPattern.users.find_one)
  async findOne(@Payload() id: string) {
    return this.usersService.findOne(id);
  }

  @MessagePattern(servicesPattern.users.find_by_email)
  async findByEmail(@Payload() { email }: { email: string }) {
    return this.usersService.findByEmail(email);
  }

  @MessagePattern(servicesPattern.users.update)
  async update(
    @Payload(ValidationPipe)
    { id, updateUserDto }: { id: string; updateUserDto: UpdateUserDto },
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @MessagePattern(servicesPattern.users.delete)
  async remove(@Payload() id: string) {
    return this.usersService.remove(id);
  }

  @MessagePattern(servicesPattern.users.assign_role)
  async assignRole(
    @Payload() { userId, roleId }: { userId: string; roleId: string },
  ) {
    return this.usersService.assignRole(userId, roleId);
  }

  @MessagePattern(servicesPattern.users.remove_role)
  async removeRole(
    @Payload() { userId, roleId }: { userId: string; roleId: string },
  ) {
    return this.usersService.removeRole(userId, roleId);
  }

  @MessagePattern(servicesPattern.users.find_by_role)
  async findUsersByRole(@Payload() roleId: string) {
    return this.usersService.findUsersByRole(roleId);
  }

  @MessagePattern(servicesPattern.users.count)
  async count(@Payload() where?: any) {
    return this.usersService.count(where);
  }

  @MessagePattern(servicesPattern.users.verify_password)
  async verifyPassword(
    @Payload() { userId, password }: { userId: string; password: string },
  ) {
    return this.usersService.verifyPassword(userId, password);
  }

  @MessagePattern(servicesPattern.users.exists)
  async exists(@Payload() id: string) {
    return this.usersService.exists(id);
  }

  @MessagePattern(servicesPattern.users.get_roles)
  async getUserRoles(@Payload() userId: string) {
    return this.usersService.getUserRoles(userId);
  }

  @MessagePattern(servicesPattern.users.deactivate)
  async deactivateUser(@Payload() userId: string) {
    return this.usersService.deactivateUser(userId);
  }

  @MessagePattern(servicesPattern.users.activate)
  async activateUser(@Payload() { userId }: { userId: string }) {
    return this.usersService.activateUser(userId);
  }
  @MessagePattern(servicesPattern.users.activate_pending)
  async activatePendingUser(@Payload() { userId }: { userId: string }) {
    return this.usersService.activatePendingUser(userId);
  }

  @MessagePattern(servicesPattern.users.update_last_login)
  async updateLastLogin(@Payload() userId: string) {
    return this.usersService.updateLastLogin(userId);
  }

  @MessagePattern(servicesPattern.users.suspend)
  async suspendUser(@Payload() userId: string) {
    return this.usersService.suspendUser(userId);
  }

  @MessagePattern(servicesPattern.users.change_status)
  async changeUserStatus(
    @Payload() { userId, status }: { userId: string; status: UserStatus },
  ) {
    return this.usersService.changeUserStatus(userId, status);
  }

  @MessagePattern(servicesPattern.users.find_by_status)
  async findUsersByStatus(@Payload() status: UserStatus) {
    return this.usersService.findUsersByStatus(status);
  }

  @MessagePattern(servicesPattern.users.get_active_users)
  async getActiveUsers() {
    return this.usersService.getActiveUsers();
  }

  @MessagePattern(servicesPattern.users.get_pending_users)
  async getPendingUsers() {
    return this.usersService.getPendingUsers();
  }
}

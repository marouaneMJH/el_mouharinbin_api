import { servicesPattern } from './../../../../../libs/contract/config/services-pattern';
import { servicesOptions } from 'libs/contract/config/services-options';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from 'libs/contract/dtos/users/create-user.dto';
import { UpdateUserDto } from 'libs/contract/dtos/users/update-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { UserQueryOptions } from 'libs/contract/interfaces/user.interface';
import { UserStatus } from 'libs/contract/enums/user.enum';

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

  findAll(params: UserQueryOptions = {}) {
    return this.users.send(this.usersPattern.find_all, params);
  }

  findOne(id: string) {
    return this.users.send(this.usersPattern.find_one, id);
  }

  findByEmail(email: string) {
    return this.users.send(this.usersPattern.find_by_email, email);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.users.send(this.usersPattern.update, { id, updateUserDto });
  }

  remove(id: string) {
    return this.users.send(this.usersPattern.delete, id);
  }

  assignRole(userId: string, roleId: string) {
    return this.users.send(this.usersPattern.assign_role, { userId, roleId });
  }

  removeRole(userId: string, roleId: string) {
    return this.users.send(this.usersPattern.remove_role, { userId, roleId });
  }

  findUsersByRole(roleId: string) {
    return this.users.send(this.usersPattern.find_by_role, roleId);
  }

  count(where?: any) {
    return this.users.send(this.usersPattern.count, where);
  }

  verifyPassword(userId: string, password: string) {
    return this.users.send(this.usersPattern.verify_password, {
      userId,
      password,
    });
  }

  exists(id: string) {
    return this.users.send(this.usersPattern.exists, id);
  }

  getUserRoles(userId: string) {
    return this.users.send(this.usersPattern.get_roles, userId);
  }

  deactivateUser(userId: string) {
    return this.users.send(this.usersPattern.deactivate, userId);
  }

  activateUser(userId: string) {
    return this.users.send(this.usersPattern.activate, userId);
  }

  suspendUser(userId: string) {
    return this.users.send(this.usersPattern.suspend, userId);
  }

  changeUserStatus(userId: string, status: UserStatus) {
    return this.users.send(this.usersPattern.change_status, { userId, status });
  }

  findUsersByStatus(status: UserStatus) {
    return this.users.send(this.usersPattern.find_by_status, status);
  }

  getActiveUsers() {
    return this.users.send(this.usersPattern.get_active_users, {});
  }

  getPendingUsers() {
    return this.users.send(this.usersPattern.get_pending_users, {});
  }

  updateLastLogin(userId: string) {
    return this.users.send(this.usersPattern.update_last_login, userId);
  }



}

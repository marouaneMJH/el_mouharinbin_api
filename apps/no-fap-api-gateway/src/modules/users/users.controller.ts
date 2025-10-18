import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'libs/contract/dtos/users/create-user.dto';
import { UpdateUserDto } from 'libs/contract/dtos/users/update-user.dto';
import { UserQueryOptions } from 'libs/contract/interfaces/user.interface';
import { UserStatus } from 'libs/contract/enums/user.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() params: UserQueryOptions) {
    return this.usersService.findAll(params);
  }

  @Get('count')
  count(@Query() where?: any) {
    return this.usersService.count(where);
  }

  @Get('active')
  getActiveUsers() {
    return this.usersService.getActiveUsers();
  }

  @Get('pending')
  getPendingUsers() {
    return this.usersService.getPendingUsers();
  }

  @Get('status/:status')
  findUsersByStatus(@Param('status') status: UserStatus) {
    return this.usersService.findUsersByStatus(status);
  }

  @Get('role/:roleId')
  findUsersByRole(@Param('roleId') roleId: string) {
    return this.usersService.findUsersByRole(roleId);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/exists')
  exists(@Param('id') id: string) {
    return this.usersService.exists(id);
  }

  @Get(':id/roles')
  getUserRoles(@Param('id') id: string) {
    return this.usersService.getUserRoles(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/status')
  changeUserStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    return this.usersService.changeUserStatus(id, status);
  }

  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivateUser(id);
  }

  @Put(':id/suspend')
  @HttpCode(HttpStatus.OK)
  suspendUser(@Param('id') id: string) {
    return this.usersService.suspendUser(id);
  }

  @Post(':id/roles/:roleId')
  @HttpCode(HttpStatus.CREATED)
  assignRole(@Param('id') userId: string, @Param('roleId') roleId: string) {
    return this.usersService.assignRole(userId, roleId);
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRole(@Param('id') userId: string, @Param('roleId') roleId: string) {
    return this.usersService.removeRole(userId, roleId);
  }

  @Post(':id/verify-password')
  @HttpCode(HttpStatus.OK)
  verifyPassword(
    @Param('id') userId: string,
    @Body('password') password: string,
  ) {
    return this.usersService.verifyPassword(userId, password);
  }

  @Put(':id/last-login')
  @HttpCode(HttpStatus.OK)
  updateLastLogin(@Param('id') userId: string) {
    return this.usersService.updateLastLogin(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

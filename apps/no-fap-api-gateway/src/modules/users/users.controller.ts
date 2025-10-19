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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from 'libs/contract/dtos/users/create-user.dto';
import { UpdateUserDto } from 'libs/contract/dtos/users/update-user.dto';
import { UserQueryOptions } from 'libs/contract/interfaces/user.interface';
import { UserStatus } from 'libs/contract/enums/user.enum';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create New User',
    description: `
Create a new user account with comprehensive profile information.

**Admin Operation:** This endpoint typically requires administrative privileges.

**Process:**
1. Validate all user input data
2. Check for email/username uniqueness
3. Hash password securely
4. Create user record with default role
5. Send welcome/activation email
6. Return created user information

**Default Values:**
- Status: PENDING (requires activation)
- Role: USER (standard user role)
- Created timestamp: Current server time
    `
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    type: CreateUserDto,
    description: 'Complete user creation data',
    examples: {
      adminCreate: {
        summary: 'Admin creating user',
        value: {
          email: 'admin.created@example.com',
          password: 'SecurePassword123!',
          username: 'admin_user',
          firstName: 'Admin',
          lastName: 'Created',
          phone: '+1234567890'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiBadRequestResponse({ description: 'Validation failed or duplicate data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Administrative privileges required' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List All Users',
    description: `
Retrieve paginated list of users with filtering and sorting options.

**Features:**
- Pagination support (page, limit)
- Search by name, email, username
- Filter by status, role, creation date
- Sort by any user field
- Include/exclude specific fields

**Use Cases:**
- Admin user management dashboard
- User directory/search functionality
- Reporting and analytics
- Bulk operations preparation
    `
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name, email, username' })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus, description: 'Filter by user status' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field (default: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort direction' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              username: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              status: { type: 'string', enum: Object.values(UserStatus) },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  findAll(@Query() params: UserQueryOptions) {
    return this.usersService.findAll(params);
  }

  @Get('count')
  @ApiOperation({
    summary: 'Count Users',
    description: 'Get total count of users with optional filtering conditions.'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User count retrieved',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', description: 'Total number of users' }
      }
    }
  })
  count(@Query() where?: any) {
    return this.usersService.count(where);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get Active Users',
    description: 'Retrieve all users with ACTIVE status - fully verified and functional accounts.'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Active users retrieved successfully' })
  getActiveUsers() {
    return this.usersService.getActiveUsers();
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Get Pending Users',
    description: 'Retrieve all users with PENDING status - accounts awaiting email verification.'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Pending users retrieved successfully' })
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
  @ApiOperation({
    summary: 'Get User By ID',
    description: `
Retrieve detailed information for a specific user by their unique identifier.

**Access Control:**
- Users can view their own profile
- Admins can view any user profile
- Limited public information for other users
    `
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Unique user identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
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
  @ApiOperation({
    summary: 'Update User',
    description: `
Update user information with partial data. Only provided fields will be modified.

**Access Control:**
- Users can update their own profile (limited fields)
- Admins can update any user (all fields)

**Security:**
- Password changes require current password
- Email changes trigger verification process
    `
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID to update' })
  @ApiBody({ type: UpdateUserDto, description: 'Fields to update (partial)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid data or validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  @ApiOperation({
    summary: 'Activate User Account',
    description: 'Change user status to ACTIVE, enabling full platform access.'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID to activate' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Administrative privileges required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate User Account',
    description: 'Change user status to INACTIVE, temporarily disabling platform access.'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID to deactivate' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Administrative privileges required' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  @ApiOperation({
    summary: 'Delete User',
    description: `
Permanently delete a user account and all associated data.

**⚠️ WARNING: This action is irreversible!**

**Access Control:** Only administrators can delete users

**Cascade Effects:**
- Removes user from all communities
- Deletes all user messages
- Cancels active sessions
    `
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID to delete' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Administrative privileges required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

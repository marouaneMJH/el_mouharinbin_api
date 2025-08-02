import { PrismaService } from '../prisma/src/prisma.service';
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../../../libs/contract/dtos/users/create-user.dto';
import { UpdateUserDto } from '../../../libs/contract/dtos/users/update-user.dto';
import { Prisma, User } from './generated/client';
import * as bcrypt from 'bcrypt';
import { UserQueryOptions } from 'libs/contract/interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly BCRYPT_SALT_ROUND =
    Number(process.env.BCRYPT_SALT_ROUND) || 12;

  private readonly usersIncludes = {
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  } as const;

  private verifyBcryptValue(): void {
    if (
      this.BCRYPT_SALT_ROUND == null ||
      this.BCRYPT_SALT_ROUND == undefined ||
      typeof this.BCRYPT_SALT_ROUND !== 'number' ||
      this.BCRYPT_SALT_ROUND < 10 ||
      this.BCRYPT_SALT_ROUND > 15
    ) {
      throw new Error(
        'BCRYPT_SALT_ROUND must be a number between 10 and 15. Current value: ' +
          this.BCRYPT_SALT_ROUND,
      );
    }
    this.logger.log(`Bcrypt salt rounds configured: ${this.BCRYPT_SALT_ROUND}`);
  }

  // Check if user exists
  private async exists(id: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      this.logger.error(`Error checking if user ${id} exists:`, error);
      return false;
    }
  }

  // Get user's roles only
  private async getUserRoles(userId: string): Promise<string[]> {
    try {
      const userWithRoles = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return userWithRoles?.roles.map((ur) => ur.role.name) || [];
    } catch (error) {
      this.logger.error(`Error getting roles for user ${userId}:`, error);
      return [];
    }
  }

  constructor(private readonly prisma: PrismaService) {
    this.verifyBcryptValue();
  }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: userWhereUniqueInput,
        ...this.usersIncludes,
      });
    } catch (error) {
      this.logger.error('Error finding user:', error);
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.debug('this :', createUserDto);

    try {
      // Extract the password and the user data
      const { password, ...userData } = createUserDto;

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(
        password,
        this.BCRYPT_SALT_ROUND,
      );

      // The conflict will be verified by the database
      const user = await this.prisma.user.create({
        data: { ...userData, password: hashedPassword },
        ...this.usersIncludes,
      });

      this.logger.log(`User created successfully: ${user.email}`);
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('User with this email already exists');
        }
      }
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findAll(params: UserQueryOptions = {}): Promise<User[]> {
    try {
      // Extract the params
      const { skip, take, cursor, where, orderBy } = params;

      return await this.prisma.user.findMany({
        skip,
        take,
        where,
        cursor,
        orderBy,
        ...this.usersIncludes,
      });
    } catch (error) {
      this.logger.error('Error finding users:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<User | null> {
    try {
      if (!id || typeof id !== 'string') {
        throw new BadRequestException('Invalid user ID provided');
      }

      return await this.prisma.user.findUnique({
        where: { id },
        ...this.usersIncludes,
      });
    } catch (error) {
      this.logger.error(`Error finding user with ID ${id}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      if (!email || typeof email !== 'string') {
        throw new BadRequestException('Invalid email provided');
      }

      return await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        ...this.usersIncludes,
      });
    } catch (error) {
      this.logger.error(`Error finding user with email ${email}:`, error);
      throw error;
    }
  }

  // Update user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const { password, ...userData } = updateUserDto;

      const updateData: Prisma.UserUpdateInput = { ...userData };

      // Hash password if it's being updated
      if (password) {
        updateData.password = await bcrypt.hash(
          password,
          this.BCRYPT_SALT_ROUND,
        );
      }

      // Normalize email if provided
      if (userData.email) {
        updateData.email = userData.email.toLowerCase().trim();
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        ...this.usersIncludes,
      });

      this.logger.log(`User updated successfully: ${user.email}`);
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      this.logger.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }

  // Soft delete or hard delete user
  async remove(id: string): Promise<User> {
    try {
      // Check if user exists first
      const userExists = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      // First, remove all user roles
      await this.prisma.userRole.deleteMany({
        where: { userID: id },
      });

      // Then delete the user
      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });

      this.logger.log(`User deleted successfully: ${deletedUser.email}`);
      return deletedUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      this.logger.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }

  // Assign role to user
  async assignRole(userId: string, roleId: string): Promise<void> {
    try {
      // Check if user and role exist
      const [user, role] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        }),
        this.prisma.role.findUnique({
          where: { id: roleId },
          select: { id: true },
        }),
      ]);

      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      await this.prisma.userRole.create({
        data: {
          userID: userId,
          roleID: roleId,
        },
      });

      this.logger.log(`Role ${roleId} assigned to user ${userId}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('User already has this role');
        }
      }
      this.logger.error(
        `Error assigning role ${roleId} to user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Remove role from user
  async removeRole(userId: string, roleId: string): Promise<void> {
    try {
      await this.prisma.userRole.delete({
        where: {
          userID_roleID: {
            userID: userId,
            roleID: roleId,
          },
        },
      });

      this.logger.log(`Role ${roleId} removed from user ${userId}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User role assignment not found');
        }
      }
      this.logger.error(
        `Error removing role ${roleId} from user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Get users by role
  async findUsersByRole(roleId: string): Promise<User[]> {
    try {
      // Validate role exists
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
        select: { id: true },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      return await this.prisma.user.findMany({
        where: {
          roles: {
            some: {
              roleID: roleId,
            },
          },
        },
        ...this.usersIncludes,
      });
    } catch (error) {
      this.logger.error(`Error finding users by role ${roleId}:`, error);
      throw error;
    }
  }

  // Count total users
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    try {
      return await this.prisma.user.count({ where });
    } catch (error) {
      this.logger.error('Error counting users:', error);
      throw error;
    }
  }

  // Verify user password
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      if (!password || !userId) {
        return false;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user?.password) {
        return false;
      }

      const isValid = await bcrypt.compare(password, user.password);
      this.logger.log(
        `Password verification for user ${userId}: ${isValid ? 'success' : 'failed'}`,
      );

      return isValid;
    } catch (error) {
      this.logger.error(`Error verifying password for user ${userId}:`, error);
      return false;
    }
  }

  // Additional helper methods
}

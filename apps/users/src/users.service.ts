import { PrismaService } from '../../../libs/contract/services/prisma.service';
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../../../libs/contract/dtos/users/create-user.dto';
import { UpdateUserDto } from '../../../libs/contract/dtos/users/update-user.dto';
import { Prisma, User } from '../../../libs/contract/prisma/generated/client';
import * as bcrypt from 'bcrypt';
import { UserQueryOptions } from 'libs/contract/interfaces/user.interface';
import { UserStatus, UserStatusHelper } from 'libs/contract/enums/user.enum';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly BCRYPT_SALT_ROUND = this.getBcryptSaltRound();
  private readonly USER_ROLE_ID = 'fc959621-5ea9-4e7a-85e0-25883ce9bd9b';

  private readonly usersIncludes = {
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  private getBcryptSaltRound(): number {
    const saltRound = Number(process.env.BCRYPT_SALT_ROUND) || 12;

    if (isNaN(saltRound) || saltRound < 10 || saltRound > 15) {
      this.logger.warn(
        `Invalid BCRYPT_SALT_ROUND: ${process.env.BCRYPT_SALT_ROUND}. Using default: 12`,
      );
      return 12;
    }

    return saltRound;
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      throw new BadRequestException('Invalid email format');
    }
  }

  private validateId(id: string, fieldName = 'id'): void {
    this.logger.debug(id);
    console.log(id);
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      this.logger.debug('not valide id');
      throw new BadRequestException(`Invalid ${fieldName} provided`);
    }
  }

  private handlePrismaError(error: any, context: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          const field = error.meta?.target as string[];
          const fieldName = field?.[0] || 'field';
          throw new ConflictException(`${fieldName} already exists`);
        case 'P2025':
          throw new NotFoundException('Record not found');
        case 'P2003':
          throw new BadRequestException('Foreign key constraint failed');
        default:
          this.logger.error(`Prisma error in ${context}:`, error);
          throw error;
      }
    }
    this.logger.error(`Error in ${context}:`, error);
    throw error;
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
      this.handlePrismaError(error, 'finding user');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, email, ...userData } = createUserDto;

    // Validate inputs
    this.validateEmail(email);
    if (!password || password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(
        password,
        this.BCRYPT_SALT_ROUND,
      );

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      const user = await this.prisma.user.create({
        data: {
          ...userData,
          email: normalizedEmail,
          password: hashedPassword,
          status: UserStatus.PENDING,
        },
        ...this.usersIncludes,
      });

      this.logger.log(
        `User created successfully: ${user.email} with status: ${user.status}`,
      );

      try {
        await this.assignRole(user.id, this.USER_ROLE_ID);
        this.logger.log("assign user role to user with id'", user.id);
      } catch {
        this.logger.error(
          "error to assign user role to user with id'",
          user.id,
        );
      }

      return user;
    } catch (error) {
      this.handlePrismaError(error, 'creating user');
    }
  }

  async findAll(params: UserQueryOptions = {}): Promise<User[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;

      // Add default ordering if none provided
      const defaultOrderBy = orderBy || { createdAt: 'desc' };

      return await this.prisma.user.findMany({
        skip,
        take,
        where,
        cursor,
        orderBy: defaultOrderBy,
        ...this.usersIncludes,
      });
    } catch (error) {
      this.handlePrismaError(error, 'finding users');
    }
  }

  async findOne(id: string): Promise<User | null> {
    this.validateId(id, 'user ID');

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        ...this.usersIncludes,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handlePrismaError(error, `finding user with ID ${id}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    this.validateEmail(email.trim().toLowerCase());

    try {
      return await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        ...this.usersIncludes,
      });
    } catch (error) {
      this.handlePrismaError(error, `finding user with email ${email}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.validateId(id, 'user ID');

    const { password, email, status, ...userData } = updateUserDto;
    const updateData: Prisma.UserUpdateInput = { ...userData };

    // Validate and normalize email if provided
    if (email) {
      this.validateEmail(email);
      updateData.email = email.toLowerCase().trim();
    }

    // Hash password if provided
    if (password) {
      if (password.length < 8) {
        throw new BadRequestException(
          'Password must be at least 8 characters long',
        );
      }
      updateData.password = await bcrypt.hash(password, this.BCRYPT_SALT_ROUND);
    }

    // Validate status transition if provided
    if (status) {
      if (!Object.values(UserStatus).includes(status)) {
        throw new BadRequestException('Invalid user status');
      }

      // Get current user to check status transition
      const currentUser = await this.prisma.user.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      if (
        !UserStatusHelper.canTransitionTo(
          currentUser.status as UserStatus,
          status,
        )
      ) {
        throw new BadRequestException(
          `Cannot transition from ${currentUser.status} to ${status}`,
        );
      }

      updateData.status = status;
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        ...this.usersIncludes,
      });

      this.logger.log(`User updated successfully: ${user.email}`);
      return user;
    } catch (error) {
      this.handlePrismaError(error, `updating user with ID ${id}`);
    }
  }

  async remove(id: string): Promise<User> {
    this.validateId(id, 'user ID');

    try {
      // Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // Check if user exists
        const user = await tx.user.findUnique({
          where: { id },
          select: { id: true, email: true, status: true },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        // Soft delete by updating status instead of hard delete
        if (user.status !== UserStatus.DELETED) {
          return await tx.user.update({
            where: { id },
            data: { status: UserStatus.DELETED },
            ...this.usersIncludes,
          });
        }

        // If already soft deleted, perform hard delete
        // Remove all user roles first
        await tx.userRole.deleteMany({
          where: { userID: id },
        });

        // Delete the user
        return await tx.user.delete({
          where: { id },
        });
      });

      this.logger.log(
        `User ${result.status === UserStatus.DELETED ? 'soft deleted' : 'hard deleted'}: ${result.email}`,
      );
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handlePrismaError(error, `deleting user with ID ${id}`);
    }
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    this.validateId(userId, 'user ID');
    this.validateId(roleId, 'role ID');

    try {
      // Use upsert to handle race conditions
      await this.prisma.userRole.upsert({
        where: {
          userID_roleID: {
            userID: userId,
            roleID: roleId,
          },
        },
        update: {}, // No update needed if exists
        create: {
          userID: userId,
          roleID: roleId,
        },
      });

      this.logger.log(`Role ${roleId} assigned to user ${userId}`);
    } catch (error) {
      // Check if user/role exists
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

      if (!user) throw new NotFoundException('User not found');
      if (!role) throw new NotFoundException('Role not found');

      this.handlePrismaError(
        error,
        `assigning role ${roleId} to user ${userId}`,
      );
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    this.validateId(userId, 'user ID');
    this.validateId(roleId, 'role ID');

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
      this.handlePrismaError(
        error,
        `removing role ${roleId} from user ${userId}`,
      );
    }
  }

  async findUsersByRole(roleId: string): Promise<User[]> {
    this.validateId(roleId, 'role ID');

    try {
      // Validate role exists first
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
      if (error instanceof NotFoundException) throw error;
      this.handlePrismaError(error, `finding users by role ${roleId}`);
    }
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    try {
      return await this.prisma.user.count({ where });
    } catch (error) {
      this.handlePrismaError(error, 'counting users');
    }
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    if (!password || !userId) {
      return false;
    }

    this.validateId(userId, 'user ID');

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { password: true, status: true },
      });

      if (!user?.password) {
        return false;
      }

      // Check if user can login based on status
      if (!UserStatusHelper.canLogin(user.status as UserStatus)) {
        this.logger.warn(
          `Login attempt for user ${userId} with status: ${user.status}`,
        );
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

  // New utility methods
  async exists(id: string): Promise<boolean> {
    this.validateId(id, 'user ID');

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

  async getUserRoles(userId: string): Promise<string[]> {
    this.validateId(userId, 'user ID');

    try {
      const userWithRoles = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          roles: {
            select: {
              role: {
                select: {
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

  async updateLastLogin(userId: string): Promise<void> {
    this.validateId(userId, 'user ID');

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`Error updating last login for user ${userId}:`, error);
      // Don't throw - this is not critical
    }
  }

  async deactivateUser(userId: string): Promise<User> {
    this.validateId(userId, 'user ID');

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.INACTIVE },
        ...this.usersIncludes,
      });

      this.logger.log(`User deactivated: ${user.email}`);
      return user;
    } catch (error) {
      this.handlePrismaError(error, `deactivating user with ID ${userId}`);
    }
  }

  async activateUser(userId: string): Promise<User> {
    this.validateId(userId);

    // Very the user need activation with

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.ACTIVE },
        ...this.usersIncludes,
      });

      this.logger.log(`User activated: ${user.email}`);
      return user;
    } catch (error) {
      this.handlePrismaError(error, `activating user with ID ${userId}`);
    }
  }

  async activatePendingUser(userId: string): Promise<User> {
    try {
      const user = await this.findOne(userId);
      if (user && user.status === UserStatus.PENDING) {
        return this.activateUser(userId);
      }
      throw new RpcException(new ConflictException('The user already active'));
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  async suspendUser(userId: string): Promise<User> {
    this.validateId(userId, 'user ID');

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.SUSPENDED },
        ...this.usersIncludes,
      });

      this.logger.log(`User suspended: ${user.email}`);
      return user;
    } catch (error) {
      this.handlePrismaError(error, `suspending user with ID ${userId}`);
    }
  }

  async changeUserStatus(userId: string, newStatus: UserStatus): Promise<User> {
    this.validateId(userId, 'user ID');

    if (!Object.values(UserStatus).includes(newStatus)) {
      throw new BadRequestException('Invalid user status');
    }

    try {
      // Get current user to check status transition
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { status: true, email: true },
      });

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      if (
        !UserStatusHelper.canTransitionTo(
          currentUser.status as UserStatus,
          newStatus as UserStatus,
        )
      ) {
        throw new BadRequestException(
          `Cannot transition from ${currentUser.status} to ${newStatus}`,
        );
      }

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { status: newStatus },
        ...this.usersIncludes,
      });

      this.logger.log(
        `User status changed from ${currentUser.status} to ${newStatus}: ${user.email}`,
      );
      return user;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handlePrismaError(
        error,
        `changing status for user with ID ${userId}`,
      );
    }
  }

  async findUsersByStatus(status: UserStatus): Promise<User[]> {
    if (!Object.values(UserStatus).includes(status)) {
      throw new BadRequestException('Invalid user status');
    }

    try {
      return await this.prisma.user.findMany({
        where: { status },
        ...this.usersIncludes,
      });
    } catch (error) {
      this.handlePrismaError(error, `finding users by status ${status}`);
    }
  }

  async getActiveUsers(): Promise<User[]> {
    return this.findUsersByStatus(UserStatus.ACTIVE);
  }

  async getPendingUsers(): Promise<User[]> {
    return this.findUsersByStatus(UserStatus.PENDING);
  }
}

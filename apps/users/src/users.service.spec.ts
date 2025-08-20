import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/src/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { UserStatus, UserStatusHelper } from 'libs/contract/enums/user.enum';
import {
  mockCreateUserDto,
  mockRole,
  mockUpdateUserDto,
  mockUser,
  mockUserWithRoles,
} from './__tests__/fixtures/user.fixtures';
import {mockPrismaService} from './__tests__/mocks/prisma.service.mock';
import { Prisma } from '../../../libs/contract/prisma/generated/client';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  // use
  // const mockLogger = {
  //   log: jest.fn(),
  //   error: jest.fn(),
  //   warn: jest.fn(),
  // };



  const resetMocks = () => {
    Object.values(mockPrismaService.user).forEach((mockFn) =>
      mockFn.mockReset(),
    );
    Object.values(mockPrismaService.userRole).forEach((mockFn) =>
      mockFn.mockReset(),
    );
    Object.values(mockPrismaService.role).forEach((mockFn) =>
      mockFn.mockReset(),
    );
    mockPrismaService.$transaction.mockReset();
  };

  beforeEach(async () => {
    jest.spyOn(Logger, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);

    resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('user', () => {
    it('should find a user by unique input', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.user({ id: 'user-1' });

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: expect.objectContaining({
          roles: expect.objectContaining({
            include: expect.objectContaining({
              role: true,
            }),
          }),
        }),
      });
    });

    it('should handle errors properly', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: '1.0.0',
      });
      mockPrismaService.user.findUnique.mockRejectedValue(error);

      await expect(service.user({ id: 'user-1' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    beforeEach(() => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));
    });

    it('should create a user successfully', async () => {
      const createdUser = {
        ...mockUser,
        email: mockCreateUserDto.email,
        status: UserStatus.PENDING,
      };

      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(mockCreateUserDto);

      expect(result).toEqual(createdUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: mockCreateUserDto.email.toLowerCase(),
          password: 'hashedPassword',
          status: UserStatus.PENDING,
        }),
        include: expect.anything(),
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockCreateUserDto.password,
        expect.any(Number),
      );
    });

    it('should throw BadRequestException for invalid email', async () => {
      await expect(
        service.create({
          ...mockCreateUserDto,
          email: 'invalid-email',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for short password', async () => {
      await expect(
        service.create({
          ...mockCreateUserDto,
          password: '123',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0.0',
        meta: { target: ['email'] },
      });

      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user when it found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserWithRoles);

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockUserWithRoles);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: expect.anything(),
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne('')).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all the users with empty params', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUserWithRoles]);

      await expect(service.findAll()).resolves.toEqual([mockUserWithRoles]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should apply filters when provided', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUserWithRoles]);

      await service.findAll({
        skip: 10,
        take: 5,
        where: { status: UserStatus.ACTIVE },
        orderBy: { email: 'asc' },
      });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 5,
          where: { status: UserStatus.ACTIVE },
          orderBy: { email: 'asc' },
        }),
      );
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: expect.anything(),
      });
    });

    it('should normalize email before searching', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await service.findByEmail(' TEST@example.com ');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: expect.anything(),
      });
    });

    it('should throw BadRequestException for invalid email', async () => {
      await expect(service.findByEmail('invalid-email')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.ACTIVE,
      });
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...mockUpdateUserDto,
      });
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('newHashedPassword'));
    });

    it('should update a user successfully', async () => {
      const result = await service.update('user-1', mockUpdateUserDto);

      expect(result).toEqual({
        ...mockUser,
        ...mockUpdateUserDto,
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: mockUpdateUserDto,
        include: expect.anything(),
      });
    });

    it('should hash password when updating password', async () => {
      await service.update('user-1', {
        ...mockUpdateUserDto,
        password: 'newPassword123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(
        'newPassword123',
        expect.any(Number),
      );
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          ...mockUpdateUserDto,
          password: 'newHashedPassword',
        },
        include: expect.anything(),
      });
    });

    it('should normalize email when updating email', async () => {
      await service.update('user-1', {
        ...mockUpdateUserDto,
        email: ' NEW@example.com ',
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          ...mockUpdateUserDto,
          email: 'new@example.com',
        },
        include: expect.anything(),
      });
    });

    it('should throw BadRequestException when status transition is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.DELETED,
      });

      jest.spyOn(UserStatusHelper, 'canTransitionTo').mockReturnValue(false);

      await expect(
        service.update('user-1', {
          ...mockUpdateUserDto,
          status: UserStatus.ACTIVE,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a user when not already deleted', async () => {
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.ACTIVE,
      });
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        status: UserStatus.DELETED,
      });

      const result = await service.remove('user-1');

      expect(result.status).toBe(UserStatus.DELETED);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { status: UserStatus.DELETED },
        include: expect.anything(),
      });
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });

    it('should hard delete a user when already soft deleted', async () => {
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.DELETED,
      });
      mockPrismaService.userRole.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await service.remove('user-1');

      expect(mockPrismaService.userRole.deleteMany).toHaveBeenCalledWith({
        where: { userID: 'user-1' },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyPassword', () => {
    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        password: 'hashedPassword',
        status: UserStatus.ACTIVE,
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((pwd, hash) =>
          Promise.resolve(pwd === 'correctPassword'),
        );
    });

    it('should return true for correct password', async () => {
      const result = await service.verifyPassword('user-1', 'correctPassword');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const result = await service.verifyPassword('user-1', 'wrongPassword');
      expect(result).toBe(false);
    });

    it('should return false when user has non-login status', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        password: 'hashedPassword',
        status: UserStatus.SUSPENDED,
      });
      jest.spyOn(UserStatusHelper, 'canLogin').mockReturnValue(false);

      const result = await service.verifyPassword('user-1', 'correctPassword');
      expect(result).toBe(false);
    });

    it('should return false when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.verifyPassword('user-1', 'password');
      expect(result).toBe(false);
    });
  });

  describe('assignRole and removeRole', () => {
    it('should assign a role to a user', async () => {
      mockPrismaService.userRole.upsert.mockResolvedValue({
        userID: 'user-1',
        roleID: 'role-1',
        assignedAt: new Date(),
      });

      await service.assignRole('user-1', 'role-1');

      expect(mockPrismaService.userRole.upsert).toHaveBeenCalledWith({
        where: {
          userID_roleID: {
            userID: 'user-1',
            roleID: 'role-1',
          },
        },
        update: {},
        create: {
          userID: 'user-1',
          roleID: 'role-1',
        },
      });
    });

    it('should remove a role from a user', async () => {
      mockPrismaService.userRole.delete.mockResolvedValue({
        userID: 'user-1',
        roleID: 'role-1',
        assignedAt: new Date(),
      });

      await service.removeRole('user-1', 'role-1');

      expect(mockPrismaService.userRole.delete).toHaveBeenCalledWith({
        where: {
          userID_roleID: {
            userID: 'user-1',
            roleID: 'role-1',
          },
        },
      });
    });
  });

  describe('findUsersByRole', () => {
    it('should find users with a specific role', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.user.findMany.mockResolvedValue([mockUserWithRoles]);

      const result = await service.findUsersByRole('role-1');

      expect(result).toEqual([mockUserWithRoles]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          roles: {
            some: {
              roleID: 'role-1',
            },
          },
        },
        include: expect.anything(),
      });
    });

    it('should throw NotFoundException when role not found', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(service.findUsersByRole('role-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('status management methods', () => {
    beforeEach(() => {
      mockPrismaService.user.update.mockImplementation((args) =>
        Promise.resolve({
          ...mockUser,
          status: args.data.status,
        }),
      );
    });

    it('should activate a user', async () => {
      const result = await service.activateUser('user-1');
      expect(result.status).toBe(UserStatus.ACTIVE);
    });

    it('should deactivate a user', async () => {
      const result = await service.deactivateUser('user-1');
      expect(result.status).toBe(UserStatus.INACTIVE);
    });

    it('should suspend a user', async () => {
      const result = await service.suspendUser('user-1');
      expect(result.status).toBe(UserStatus.SUSPENDED);
    });

    it('should change user status with validation', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.PENDING,
        email: 'test@example.com',
      });
      jest.spyOn(UserStatusHelper, 'canTransitionTo').mockReturnValue(true);

      const result = await service.changeUserStatus(
        'user-1',
        UserStatus.ACTIVE,
      );

      expect(result.status).toBe(UserStatus.ACTIVE);
    });

    it('should throw BadRequestException for invalid status transitions', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.DELETED,
      });
      jest.spyOn(UserStatusHelper, 'canTransitionTo').mockReturnValue(false);

      await expect(
        service.changeUserStatus('user-1', UserStatus.ACTIVE),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('utility methods', () => {
    it('should check if a user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      expect(await service.exists('user-1')).toBe(true);

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      expect(await service.exists('user-2')).toBe(false);
    });

    it('should get user roles', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [{ role: { name: 'admin' } }, { role: { name: 'user' } }],
      });

      const roles = await service.getUserRoles('user-1');
      expect(roles).toEqual(['admin', 'user']);
    });

    it('should update last login time', async () => {
      await service.updateLastLogin('user-1');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });
  });

  describe('findUsersByStatus', () => {
    it('should find users by status', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findUsersByStatus(UserStatus.ACTIVE);

      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { status: UserStatus.ACTIVE },
        include: expect.anything(),
      });
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.findUsersByStatus('INVALID' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should get active users', async () => {
      jest.spyOn(service, 'findUsersByStatus').mockResolvedValue([mockUser]);

      await service.getActiveUsers();

      expect(service.findUsersByStatus).toHaveBeenCalledWith(UserStatus.ACTIVE);
    });

    it('should get pending users', async () => {
      jest.spyOn(service, 'findUsersByStatus').mockResolvedValue([mockUser]);

      await service.getPendingUsers();

      expect(service.findUsersByStatus).toHaveBeenCalledWith(
        UserStatus.PENDING,
      );
    });
  });

  describe('count', () => {
    it('should count users with optional filter', async () => {
      mockPrismaService.user.count.mockResolvedValue(5);

      const result = await service.count({ status: UserStatus.ACTIVE });

      expect(result).toBe(5);
      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: { status: UserStatus.ACTIVE },
      });
    });
  });
  // });

  //   service = module.get<UsersService>(UsersService);
  //   prisma = module.get(PrismaService);

  //   resetMocks();
  // });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when it found', async () => {
      // Arrange - Set up the mock to return our test data
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserWithRoles);

      const result = await service.findOne('user-123');

      // Check the result
      expect(result).toEqual(mockUserWithRoles);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    it('should throw an error when prisma throws an error', async () => {
      // Act & Assert - Check that the service throws the error
      await expect(service.findOne('user-123')).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all the users with empty params', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUserWithRoles]);

      await expect(service.findAll()).resolves.toEqual([mockUserWithRoles]);
    });
  });
});

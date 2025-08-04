import { UserStatus } from '../../../../../libs/contract/enums/user.enum';
import { User, Role } from '../../generated/client';

// Simple mock role
export const mockRole: Role = {
  id: 'role-123',
  name: 'USER',
  isActive: true,
  description: 'Regular user role',
};

// Simple mock user (without relations)
export const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  password: '$2b$12$hashedPasswordExample',
  lastLoginAt: new Date('2024-01-01'),
  status: UserStatus.ACTIVE,
  createdAt: new Date('2024-01-01'),
  updateDate: new Date('2024-01-01'),
};

// Mock user with roles (what your service actually returns)
export const mockUserWithRoles = {
  ...mockUser,
  roles: [
    {
      id: 'user-role-123',
      userID: 'user-123',
      roleID: 'role-123',
      affectedDate: new Date('2024-01-01'),
      role: mockRole,
    },
  ],
};

// Mock DTOs for testing
export const mockCreateUserDto = {
  email: 'new@example.com',
  name: 'New User',
  password: 'password123',
};

export const mockUpdateUserDto = {
  name: 'Updated Name',
  email: 'updated@example.com',
};

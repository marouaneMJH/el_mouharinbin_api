import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  mockPrismaService,
  resetMocks,
} from './__tests__/mocks/prisma.service.mock';
import {
  mockUser,
  mockUserWithRoles,
  mockCreateUserDto,
  mockUpdateUserDto,
} from './__tests__/fixtures/user.fixtures';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

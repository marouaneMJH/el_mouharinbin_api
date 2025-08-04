// This mock represents all the Prisma methods your service uses
export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  userRole: {
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    upsert: jest.fn()
  },
  $transaction: jest.fn(),
};

// Helper to reset all mocks between tests
export const resetMocks = () => {
  Object.values(mockPrismaService).forEach((model) => {
    Object.values(model).forEach((method) => {
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  });
};

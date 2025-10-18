// jest.config.base.ts
import type { Config } from 'jest';

const baseConfig: Config = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};

export default baseConfig;

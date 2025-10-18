import base from '../../jest.config.base';
import type { Config } from 'jest';

const config: Config = {
  ...base,
  rootDir: '.',
  moduleNameMapper: {
    '^libs/(.*)$': '<rootDir>/../../libs/$1',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};

export default config;

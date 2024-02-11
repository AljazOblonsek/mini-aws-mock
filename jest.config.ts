import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/tests(.*)$': '<rootDir>/tests/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globalSetup: './tests/utils/global-setup.ts',
  setupFilesAfterEnv: ['./tests/utils/disable-console-logs.ts'],
  // Setting max workers to 1 to avoid concurrency problems with writing/reading json files
  maxWorkers: 1,
};

export default config;

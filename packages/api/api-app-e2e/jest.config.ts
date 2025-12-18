import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../../tsconfig.base.json'

export default {
  coverageDirectory: '../../../coverage/api-e2e',
  displayName: 'api-e2e',
  globalSetup: '<rootDir>/src/support/global-setup.ts',
  globalTeardown: '<rootDir>/src/support/global-teardown.ts',
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/../../../',
  }),
  preset: '../../../jest.preset.js',
  roots: ['<rootDir>/src'],
  // Use setupFilesAfterEnv to have access to Jest globals (beforeAll, expect) during setup
  setupFilesAfterEnv: ['<rootDir>/src/support/test-setup.ts'],
  testEnvironment: 'node', // Look for test files in src directory
  // Match test files with .spec.ts extension anywhere in src
  testMatch: ['**/*.spec.ts'],
  // Allow running tests by filename without path
  testPathIgnorePatterns: [],
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
}

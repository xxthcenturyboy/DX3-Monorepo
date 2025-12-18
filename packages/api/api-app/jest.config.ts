import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../../tsconfig.base.json'

export default {
  coverageDirectory: '../../../coverage/api/api-app',
  displayName: 'api-app',
  // Force exit after tests complete to avoid hanging on open handles
  forceExit: true,
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    // Mock ioredis module for unit testing without real Redis connections
    '^ioredis-mock$': '<rootDir>/../../libs/redis/__mocks__/ioredis.ts',
    '^ioredis$': '<rootDir>/../../libs/redis/__mocks__/ioredis.ts',
    // Prefix must resolve to repo root (5 levels up from api-app)
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../../' }),
  },
  preset: '../../../jest.preset.js',
  // Include both api-app and libs directories for test discovery
  // libs is at packages/api/src/libs/ (two levels up from api-app)
  roots: ['<rootDir>', '<rootDir>/../libs'],
  setupFilesAfterEnv: ['<rootDir>/src/testing/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: ['node_modules/(?!(.pnpm|bad-words|badwords-list))'],
}

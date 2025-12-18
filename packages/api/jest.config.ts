import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../tsconfig.base.json'

export default {
  coverageDirectory: '../../coverage/api/api',
  displayName: 'api-libs',
  // Force exit after tests complete to avoid hanging on open handles
  forceExit: true,
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    // Mock ioredis module for unit testing without real Redis connections
    '^ioredis-mock$': '<rootDir>/libs/redis/__mocks__/ioredis.ts',
    '^ioredis$': '<rootDir>/libs/redis/__mocks__/ioredis.ts',
    // Path aliases from tsconfig
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
  },
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/libs/testing/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: ['node_modules/(?!(.pnpm|bad-words|badwords-list))'],
}

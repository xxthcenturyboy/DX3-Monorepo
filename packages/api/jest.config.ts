import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../tsconfig.base.json'

export default {
  collectCoverageFrom: [
    'libs/**/*.{js,ts}',
    '!libs/**/*.d.ts',
    '!libs/**/*.types.ts',
    '!libs/**/index.ts',
    '!libs/**/*.mock.ts',
    '!libs/**/*.spec.ts',
    '!libs/**/*.test.ts',
    '!libs/**/node_modules/**',
    // Exclude postgres models, migrations, seeders (integration/E2E scope)
    '!libs/**/*.postgres-model.ts',
    '!libs/pg/migrations/**',
    '!libs/pg/seed/**',
    // Exclude test infrastructure helpers (not application code)
    '!libs/testing/**',
  ],
  coverageDirectory: '../../coverage/api/api',
  // Belt-and-suspenders: regex exclusions (paths can be absolute; preset may override collectCoverageFrom)
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.mock\\.ts$',
    '\\.postgres-model\\.ts$',
    '/libs/pg/migrations/',
    '/libs/pg/seed/',
  ],
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

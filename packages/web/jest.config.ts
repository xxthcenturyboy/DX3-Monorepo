import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../tsconfig.base.json'

export default {
  collectCoverageFrom: [
    '<rootDir>/libs/**/*.{ts,tsx}',
    '!<rootDir>/libs/**/*.spec.{ts,tsx}',
    '!<rootDir>/libs/**/*.d.ts',
    '!<rootDir>/libs/**/index.{ts,tsx}',
    // test-setup.ts is a jest helper entry-point, not production code
    '!<rootDir>/libs/ui/test-setup.ts',
  ],
  coverageDirectory: '../../coverage/web/web-app',
  coverageThreshold: {
    './libs/**': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  displayName: 'web-libs',
  // Force exit after tests complete to avoid hanging on open handles
  forceExit: true,
  // Suppress duplicate manual mock warnings from jest-haste-map
  // This is expected when multiple __mocks__/index.ts files exist
  // haste: {
  //   throwOnModuleCollision: false,
  // },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    // Mock CSS imports to prevent Jest from failing on CSS files
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock lottie-react to avoid canvas/animation issues in jsdom
    '^lottie-react$': '<rootDir>/__mocks__/lottie-react.tsx',
    // Preserve path mappings from tsconfig
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
  },
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/web-app-dist/', '<rootDir>/web-app-e2e/'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
}

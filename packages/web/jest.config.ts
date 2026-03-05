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
    // web-app production code (excludes types, specs, mocks, test helpers, barrel files, and non-unit-testable files)
    '<rootDir>/web-app/src/app/**/*.{ts,tsx}',
    '<rootDir>/web-app/src/ssr/metrics.ts',
    '!<rootDir>/web-app/src/app/**/*.spec.{ts,tsx}',
    '!<rootDir>/web-app/src/app/**/*.types.{ts,tsx}',
    '!<rootDir>/web-app/src/app/**/*.type.{ts,tsx}',
    '!<rootDir>/web-app/src/app/**/index.{ts,tsx}',
    '!<rootDir>/web-app/src/app/**/__mocks__/**',
    '!<rootDir>/web-app/src/app/**/testing/**',
    '!<rootDir>/web-app/src/app/data/socket-io/socket-web-emit-as-promise.ts',
    '!<rootDir>/web-app/src/app/store/store-web-redux.hooks.ts',
    '!<rootDir>/web-app/src/app/auth/auth-web-login.ui.tsx',
    '!<rootDir>/web-app/src/app/email/email-web.ui.tsx',
    '!<rootDir>/web-app/src/app/feature-flags/admin/feature-flag-admin-web.ui.tsx',
    '!<rootDir>/web-app/src/app/notifications/notification-web-dialog.ui.tsx',
    '!<rootDir>/web-app/src/app/phone/phone-web.ui.ts',
  ],
  coverageDirectory: '../../coverage/web/web-app',
  coverageThreshold: {
    './libs/**': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './web-app/src/**': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  displayName: process.env.JEST_DISPLAY_NAME ?? 'web',
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

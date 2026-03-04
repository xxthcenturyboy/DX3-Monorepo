import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../../tsconfig.base.json'

export default {
  // Only collect coverage from production source files — never from build tooling,
  // test helpers, type declarations, barrel files, or files explicitly excluded from
  // unit testing (sockets, UI-only wrappers, etc.).
  collectCoverageFrom: [
    '<rootDir>/src/app/**/*.{ts,tsx}',
    '<rootDir>/src/ssr/metrics.ts',
    '!<rootDir>/src/app/**/*.spec.{ts,tsx}',
    '!<rootDir>/src/app/**/*.types.{ts,tsx}',
    '!<rootDir>/src/app/**/*.type.{ts,tsx}',
    '!<rootDir>/src/app/**/index.{ts,tsx}',
    '!<rootDir>/src/app/**/__mocks__/**',
    '!<rootDir>/src/app/**/testing/**',
    '!<rootDir>/src/app/data/socket-io/socket-web-emit-as-promise.ts',
    '!<rootDir>/src/app/store/store-web-redux.hooks.ts',
    '!<rootDir>/src/app/auth/auth-web-login.ui.tsx',
    '!<rootDir>/src/app/email/email-web.ui.tsx',
    '!<rootDir>/src/app/feature-flags/admin/feature-flag-admin-web.ui.tsx',
    '!<rootDir>/src/app/notifications/notification-web-dialog.ui.tsx',
    '!<rootDir>/src/app/phone/phone-web.ui.ts',
    // emotion-cache.ts is a one-time MUI SSR setup utility with no testable logic.
    '!<rootDir>/src/app/emotion-cache.ts',
  ],
  coverageDirectory: '../../../coverage/web/web-app',
  displayName: 'web-app',
  // Force exit after tests complete to avoid hanging on open handles
  forceExit: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    // Mock CSS imports to prevent Jest from failing on CSS files
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock lottie-react to avoid canvas/animation issues in jsdom
    '^lottie-react$': '<rootDir>/../__mocks__/lottie-react.tsx',
    // Preserve path mappings from tsconfig
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../../' }),
  },
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    // isolatedModules: true is set in tsconfig.spec.json (the canonical location
    // for ts-jest v29+).  It switches ts-jest to transpile-only mode so each
    // worker skips cross-file type checking and starts executing tests immediately,
    // cutting startup from minutes to seconds.  Type safety is still enforced by
    // the standalone tsc / lint pass in CI.
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
}

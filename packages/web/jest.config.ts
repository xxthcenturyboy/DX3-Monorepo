import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../tsconfig.base.json'

export default {
  coverageDirectory: '../../coverage/web/web-app',
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
    // Preserve path mappings from tsconfig
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
  },
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
}

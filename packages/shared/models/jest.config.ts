import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../../tsconfig.base.json'

export default {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/index.ts'],
  coverageDirectory: '../../../coverage/shared/models',
  displayName: 'models-shared',
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/../../../',
  }),
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
}

import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../../tsconfig.base.json'

export default {
  coverageDirectory: '../../../coverage/shared/test-data',
  displayName: 'test-data',
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

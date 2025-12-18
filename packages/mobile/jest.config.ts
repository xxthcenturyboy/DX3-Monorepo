import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../../tsconfig.base.json'

export default {
  coverageDirectory: '../../coverage/mobile',
  displayName: 'mobile',
  moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
    '\\.svg': '<rootDir>/types/svgMock.js',
  },
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@dx3/.*)',
  ],
}

module.exports = {
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|js|mjs)$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  transformIgnorePatterns: ['node_modules/(?!(@?\\w))'],
}

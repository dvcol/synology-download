/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // The root of your source code
  roots: ['<rootDir>/src'],

  // Jest transformations -- this adds support for TypeScript using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename should contain `test` or `spec`.
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',

  // Minimum coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Webpack alias config=
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },

  // Setup scripts before tests
  setupFilesAfterEnv: ['<rootDir>/test/setup.test.ts'],
};

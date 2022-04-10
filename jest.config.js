/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  // The root of your source code
  roots: [ "<rootDir>/src" ],

  // Target test tsconfig
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
      "useESM": true
    }
  },

  // Jest transformations -- this adds support for TypeScript using ts-jest
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },

  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename should contain `test` or `spec`.
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",

  // Minimum coverage thresholds
  // TODO : Increase threshold after implementing tests
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },

  // Module file extensions for importing
  moduleFileExtensions: [ "ts", "tsx", "js", "jsx", "json", "node" ],

  extensionsToTreatAsEsm: [ ".ts", ".tsx" ],
  // Webpack alias config=
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1"
  },

  // Setup scripts before tests
  setupFilesAfterEnv: [
    "<rootDir>/test/setup.test.ts"
  ]
};

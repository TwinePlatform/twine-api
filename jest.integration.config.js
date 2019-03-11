module.exports = {
  coverageDirectory: '<rootDir>/coverage/integration',
  coveragePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/', '<rootDir>/tests/utils/'],
  errorOnDeprecated: true,
  globalSetup: '<rootDir>/tests/global_setup.ts',
  testPathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/tests/utils',
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  testEnvironment: 'node',
  testRegex: '.*\.test\.integration\.(tsx?|jsx?)$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  verbose: true,
};

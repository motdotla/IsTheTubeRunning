module.exports = {
  clearMocks: true,
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json'],
  coveragePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/docs/',
    '<rootDir>/build/',
    '<rootDir>/controllers/tests/',
    '<rootDir>/services/tests/',
    '<rootDir>/services/__mocks__/',
    '<rootDir>/utils/tests/',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/docs/',
    '<rootDir>/build/',
  ]
};
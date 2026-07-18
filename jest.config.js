module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup.js'],
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js'
  ],
  coverageThreshold: {
    global: {
      lines: 60,
      branches: 50,
      functions: 60,
      statements: 60
    }
  },
  coverageReporters: ['text', 'lcov']
};

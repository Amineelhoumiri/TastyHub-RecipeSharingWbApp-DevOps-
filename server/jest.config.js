/**
 * Jest keeps our fast, low-level tests organized.
 * We point it at the `tests` folder and load .env so the app behaves like dev.
 */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  clearMocks: true,
  verbose: true
};

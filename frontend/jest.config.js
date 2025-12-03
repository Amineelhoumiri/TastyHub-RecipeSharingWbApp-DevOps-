const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>', '<rootDir>/app'],
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/cypress/',
    '/out/',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    '!app/**/*.stories.{js,jsx}',
    '!app/**/layout.js',
    '!app/**/page.js', // Exclude page components from coverage (tested via E2E)
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/cypress/**',
    '!**/api/**', // API routes tested via E2E
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)


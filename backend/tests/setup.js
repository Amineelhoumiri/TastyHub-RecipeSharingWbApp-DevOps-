// Jest setup file - runs before all tests
// This is where you can configure global test settings

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_jest_tests_minimum_32_characters_long';
process.env.DB_NAME = 'TastyHub_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5500';
process.env.PORT = '5000';
process.env.FRONTEND_URL = 'http://localhost:3000';

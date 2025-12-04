// Jest setup file - runs before all tests
// This is where you can configure global test settings
require('dotenv').config();

// Set test environment variables (allow overrides from .env)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_jest_tests_minimum_32_characters_long';
process.env.DB_NAME = process.env.DB_NAME || 'TastyHub_test';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'Amine'; // Default to common dev password if not set
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.PORT = process.env.PORT || '5001'; // Use different port for tests
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const { sequelize } = require('../models');

afterAll(async () => {
  await sequelize.close();
});

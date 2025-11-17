// Load environment variables first
require('dotenv').config();

const { Sequelize } = require('sequelize');

// ===================================================
//  DATABASE CONFIGURATION
// ===================================================
// We're using environment variables to keep sensitive credentials secure.
// These values should be set in a .env file (which should NOT be committed to git).
//
// IMPORTANT: Never hardcode passwords or sensitive data in your code!
// Always use environment variables, especially in production.
// ===================================================

// Database name - safe to have a default for local development
const DB_NAME = process.env.DB_NAME || 'TastyHub';

// Database user - safe to have a default for local development
const DB_USER = process.env.DB_USER || 'postgres';

// Database password - CRITICAL: Must be set via environment variable!
// We don't provide a fallback because hardcoded passwords are a security risk.
// If you're running locally, create a .env file with: DB_PASSWORD=your_password
const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error('❌ ERROR: DB_PASSWORD environment variable is required!');
  console.error('💡 Please create a .env file in the server directory with:');
  console.error('   DB_PASSWORD=your_database_password');
  console.error('   (And other required variables like DB_NAME, DB_USER, etc.)');
  process.exit(1); // Stop the server if password is missing
}

// Database host - safe to default to localhost for local development
const DB_HOST = process.env.DB_HOST || 'localhost';

// Database port - safe to have a default
const DB_PORT = process.env.DB_PORT || 5500;

// This creates the new Sequelize connection instance
// We're telling Sequelize we use PostgreSQL as our database
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres', // We're using PostgreSQL
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Only log SQL queries in development mode
  pool: {
    max: 5, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections
    acquire: 30000, // Maximum time (ms) to wait for a connection
    idle: 10000 // Maximum time (ms) a connection can be idle
  }
});

// We export this 'sequelize' connection to be used by all our models
module.exports = sequelize;


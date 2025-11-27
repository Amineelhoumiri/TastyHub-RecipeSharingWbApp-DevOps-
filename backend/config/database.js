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

// Support both Railway (PG*) and custom (DB_*) environment variables
// Railway provides: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
// Custom format: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

// Database name - check PGDATABASE (Railway) first, then DB_NAME, then default
const DB_NAME = process.env.PGDATABASE || process.env.DB_NAME || 'TastyHub';

// Database user - check PGUSER (Railway) first, then DB_USER, then default
const DB_USER = process.env.PGUSER || process.env.DB_USER || 'postgres';

// Database password - check PGPASSWORD (Railway) first, then DB_PASSWORD
// CRITICAL: Must be set via environment variable!
const DB_PASSWORD = process.env.PGPASSWORD || process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error('ERROR: Database password environment variable is required!');
  console.error('Please set either PGPASSWORD (Railway) or DB_PASSWORD in your environment variables.');
  console.error('Railway: Use the PGPASSWORD value from your PostgreSQL service variables.');
  console.error('Local: Create a .env file with DB_PASSWORD=your_database_password');
  process.exit(1); // Stop the server if password is missing
}

// Database host - check PGHOST (Railway) first, then DB_HOST, then default
const DB_HOST = process.env.PGHOST || process.env.DB_HOST || 'localhost';

// Database port - check PGPORT (Railway) first, then DB_PORT, then default
// Railway provides port as string, so convert to number
const DB_PORT = process.env.PGPORT
  ? parseInt(process.env.PGPORT, 10)
  : (process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5500);

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

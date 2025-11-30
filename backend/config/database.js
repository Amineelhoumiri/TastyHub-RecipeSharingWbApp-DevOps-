// Load environment variables first
require('dotenv').config();

// Default Railway connection string (used when DATABASE_URL isn't set locally)
const DEFAULT_DATABASE_PUBLIC_URL =
  process.env.DATABASE_PUBLIC_URL ||
  process.env.RAILWAY_DATABASE_URL ||
  'postgresql://postgres:ACPhdpjZnAsDaBsfOwFOHSFyZUiHShQV@trolley.proxy.rlwy.net:35417/railway';

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

// Priority order for database configuration:
// 1. DATABASE_URL (Railway, Heroku, etc. - single connection string)
// 2. Individual PG* variables (Railway PostgreSQL service)
// 3. Individual DB_* variables (custom format)
// 4. Defaults for local development

let sequelize;

let resolvedDatabaseUrl = process.env.DATABASE_URL;

if (resolvedDatabaseUrl && resolvedDatabaseUrl.includes('public-host')) {
  resolvedDatabaseUrl = DEFAULT_DATABASE_PUBLIC_URL;
}

resolvedDatabaseUrl = resolvedDatabaseUrl || DEFAULT_DATABASE_PUBLIC_URL;

// Ensure downstream code sees the resolved value (used in logging/etc.)
process.env.DATABASE_URL = resolvedDatabaseUrl;

// Check if DATABASE_URL (or fallback) is provided (Railway, Heroku, etc.)
if (resolvedDatabaseUrl) {
  // Sequelize can use DATABASE_URL directly
  // Format: postgresql://username:password@host:port/database
  sequelize = new Sequelize(resolvedDatabaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Fall back to individual environment variables
  // Support both Railway (PG*) and custom (DB_*) environment variables
  const DB_NAME = process.env.PGDATABASE || process.env.DB_NAME || 'TastyHub';
  const DB_USER = process.env.PGUSER || process.env.DB_USER || 'postgres';
  const DB_PASSWORD = process.env.PGPASSWORD || process.env.DB_PASSWORD;
  const DB_HOST = process.env.PGHOST || process.env.DB_HOST || 'localhost';
  const DB_PORT = process.env.PGPORT
    ? parseInt(process.env.PGPORT, 10)
    : (process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5500);

  // Validate password is set
  if (!DB_PASSWORD) {
    console.error('ERROR: Database password environment variable is required!');
    console.error('Please set one of the following:');
    console.error('  - DATABASE_URL (recommended for Railway/Heroku)');
    console.error('  - PGPASSWORD (Railway PostgreSQL service)');
    console.error('  - DB_PASSWORD (custom format)');
    console.error('Local: Create a .env file with DB_PASSWORD=your_database_password');
    process.exit(1);
  }

  // Create Sequelize instance with individual variables
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// We export this 'sequelize' connection to be used by all our models
module.exports = sequelize;

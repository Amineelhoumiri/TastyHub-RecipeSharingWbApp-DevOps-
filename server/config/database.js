const { Sequelize } = require('sequelize');

// ===================================================
//  DATABASE CREDENTIALS (PLACEHOLDERS)
// ===================================================
// You MUST get these exact values from your database designer.
// They are the "correct names" you need to connect.
// ===================================================

const DB_NAME = 'TastyHub'; 
const DB_USER = 'postgres'; 
const DB_PASSWORD = 'Amine';
const DB_HOST = 'localhost'; 

// This creates the new Sequelize connection instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres', // We're telling Sequelize we use PostgreSQL
  port: 5500, // <-- ADD THIS LINE
  logging: false, // Set this to 'console.log' to see all SQL queries
});

// We export this 'sequelize' connection to be used by all our models
module.exports = sequelize;
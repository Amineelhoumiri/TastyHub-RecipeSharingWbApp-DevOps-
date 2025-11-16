// Load environment variables from .env file (if it exists)
// This allows us to keep sensitive info like database passwords and JWT secrets out of our code
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port if available

// --- 1. MIDDLEWARE ---

// CORS (Cross-Origin Resource Sharing) - This allows our frontend (running on a different port)
// to make requests to our backend API without getting blocked by the browser
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Frontend URL
  credentials: true // Allow cookies/auth headers
}));

// Parses incoming JSON payloads - converts JSON request bodies into JavaScript objects
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Also parse URL-encoded bodies

// Debug middleware to log requests (remove in production)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log(`${req.method} ${req.path} - Content-Type: ${req.headers['content-type']}`);
      console.log('Body:', req.body);
    }
    next();
  });
}

// --- 2. IMPORT ROUTES ---
let userRoutes, recipeRoutes, commentRoutes, sequelize;
try {
  userRoutes = require('./routes/userRoutes');
  recipeRoutes = require('./routes/recipeRoutes');
  commentRoutes = require('./routes/commentRoutes');
  const models = require('./models'); // Import the sequelize instance from models/index.js
  sequelize = models.sequelize;
} catch (importError) {
  console.error('❌ Error loading routes or models:', importError);
  console.error('Import error details:', {
    name: importError.name,
    message: importError.message,
    stack: importError.stack
  });
  process.exit(1);
}

// --- 3. USE ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);

// Custom error handling middleware - MUST be after all routes
// This catches any errors thrown in our route handlers and sends a proper response
app.use((err, req, res, next) => {
  console.error('Error caught by middleware:', err);
  
  // If it's a validation error from Sequelize, make it more user-friendly
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map(e => e.message)
    });
  }
  
  // If it's a database connection error
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      message: 'Database connection failed. Please try again later.'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Only show stack trace in development
  });
});

// --- 4. GLOBAL ERROR HANDLERS (Prevent server crashes) ---
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit the process, just log it
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit immediately, give time to log
  setTimeout(() => process.exit(1), 1000);
});

// Export app for testing
module.exports = app;

// --- 5. DATABASE CONNECTION & SERVER START ---
// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection has been established successfully.');

      app.listen(PORT, () => {
        console.log(`🚀 Server is live and running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error);
    }
  };

  startServer(); // Call the function to start the server
}

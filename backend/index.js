// Load environment variables from .env file (if it exists)
// This allows us to keep sensitive info like database passwords and JWT secrets out of our code
require('dotenv').config();

// Initialize Sentry error tracking (only in production)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1 // 10% of transactions for performance monitoring
  });
}

const express = require('express');
const multer = require('multer');
const { logger, requestLogger } = require('./middleware/logger');
const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port if available

// --- 1. MIDDLEWARE ---

// Request logging middleware
app.use(requestLogger);

// CORS (Cross-Origin Resource Sharing) - This allows our frontend (running on a different port)
// to make requests to our backend API without getting blocked by the browser
const cors = require('cors');
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001', // Also allow port 3001
    'http://localhost:3000'
  ], // Frontend URL
  credentials: true // Allow cookies/auth headers
}));

// Parses incoming JSON payloads - converts JSON request bodies into JavaScript objects
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Also parse URL-encoded bodies

// Debug middleware to log request bodies in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      logger.debug('Request body', {
        method: req.method,
        path: req.path,
        contentType: req.headers['content-type'],
        body: req.body
      });
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
  logger.error('Error loading routes or models', {
    name: importError.name,
    message: importError.message,
    stack: importError.stack
  });
  process.exit(1);
}

// --- 3. STATIC FILE SERVING ---
// Make uploaded images accessible via URL
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. HEALTH CHECK ENDPOINT ---
// Health check endpoint for monitoring and deployment verification
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'unknown'
  };

  try {
    // Test database connection
    await sequelize.authenticate();
    healthCheck.database = 'connected';
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.status = 'degraded';
    healthCheck.database = 'disconnected';
    healthCheck.error = error.message;
    res.status(503).json(healthCheck);
  }
});

// --- 5. USE ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);

// Catch any requests that don't match our routes
// Return JSON for API calls, plain text for everything else
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      message: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  } else {
    res.status(404).send('Page not found');
  }
});

// Custom error handling middleware - MUST be after all routes
// This catches any errors thrown in our route handlers and sends a proper response
app.use((err, req, res, _next) => {
  // Send error to Sentry if configured
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    const Sentry = require('@sentry/node');
    Sentry.captureException(err, {
      tags: {
        path: req.path,
        method: req.method
      },
      extra: {
        statusCode: err.status || 500
      }
    });
  }

  logger.error('Error caught by middleware', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.status || 500
  });

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }

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

// --- 6. GLOBAL ERROR HANDLERS (Prevent server crashes) ---
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack
  });
  // Don't exit the process, just log it
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  // Don't exit immediately, give time to log
  setTimeout(() => process.exit(1), 1000);
});

// Export app for testing
module.exports = app;

// --- 7. DATABASE CONNECTION & SERVER START ---
// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');

      app.listen(PORT, () => {
        logger.info(`Server is live and running on http://localhost:${PORT}`, {
          port: PORT,
          environment: process.env.NODE_ENV || 'development'
        });
      });
    } catch (error) {
      logger.error('Unable to connect to the database', {
        error: error.message,
        stack: error.stack
      });
    }
  };

  startServer(); // Call the function to start the server
}

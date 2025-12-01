// Load environment variables
require('dotenv').config();

// Initialize Sentry error tracking (only in production)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1
  });
}

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { logger, requestLogger } = require('./middleware/logger');
const passport = require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(passport.initialize());
app.use(requestLogger);

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.includes('.vercel.app')) return callback(null, true);

    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
      const frontendUrl = new URL(process.env.FRONTEND_URL);
      const originUrl = new URL(origin);
      if (frontendUrl.origin === originUrl.origin) return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
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

// Import Routes and Models
let userRoutes, recipeRoutes, commentRoutes, sequelize;
try {
  userRoutes = require('./routes/userRoutes');
  recipeRoutes = require('./routes/recipeRoutes');
  commentRoutes = require('./routes/commentRoutes');
  const models = require('./models');
  sequelize = models.sequelize;
} catch (importError) {
  logger.error('Error loading routes or models', {
    name: importError.name,
    message: importError.message,
    stack: importError.stack
  });
  // In test environment, we don't want to exit the process
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
  throw importError;
}

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'unknown'
  };

  try {
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

// Routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);

// 404 Handler
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

// Error Handling Middleware
app.use((err, req, res, _next) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    const Sentry = require('@sentry/node');
    Sentry.captureException(err, {
      tags: { path: req.path, method: req.method },
      extra: { statusCode: err.status || 500 }
    });
  }

  logger.error('Error caught by middleware', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.status || 500
  });

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map(e => e.message)
    });
  }

  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      message: 'Database connection failed. Please try again later.'
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Global Error Handlers
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  setTimeout(() => process.exit(1), 1000);
});

module.exports = app;

// Server Start
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server is live and running on port ${PORT}`);
    logger.info(`Server is live and running on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });

    sequelize.authenticate()
      .then(async () => {
        console.log('✓ Database connection established successfully');
        logger.info('Database connection established successfully');

        if (process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT) {
          try {
            console.log('🔄 Auto-syncing database schema...');
            await sequelize.sync({ alter: true, force: false });
            console.log('✅ Database schema synced successfully');
          } catch (syncError) {
            console.error('⚠️  Database sync warning (non-fatal):', syncError.message);
            logger.warn('Database sync warning', { error: syncError.message });
          }
        }
      })
      .catch((error) => {
        console.error('✗ Unable to connect to the database');
        logger.error('Unable to connect to the database', { error: error.message });
      });
  });
}

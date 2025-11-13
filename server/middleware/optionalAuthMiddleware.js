// This is an optional authentication middleware
// It doesn't require authentication, but if a valid token is provided,
// it will attach the user info to req.user
// This is useful for routes that work for both logged-in and guest users

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Optional Authentication Middleware
 * 
 * This middleware is similar to authMiddleware, but it doesn't fail if no token is provided.
 * If a valid token exists, it attaches the user to req.user.
 * If no token or invalid token, it just continues without setting req.user.
 * 
 * Usage: Use this for routes that should work for both authenticated and unauthenticated users
 * Example: router.get('/recipes', optionalAuthMiddleware, recipeController.getAllRecipes)
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    // If no auth header or doesn't start with "Bearer ", just continue without setting req.user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }
    
    // Extract just the token part (remove "Bearer " prefix)
    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // Continue without authentication
    }
    
    // Try to verify the token
    // If it fails, we'll just continue without setting req.user (not an error)
    // This is optional auth, so we're more lenient here
    try {
      // Check if JWT_SECRET is configured
      // If not, we can't verify tokens, so we'll just skip authentication
      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        // Log a warning but don't fail - this is optional auth after all
        // However, in production, JWT_SECRET should always be set!
        console.warn('⚠️  WARNING: JWT_SECRET not set. Optional authentication will be skipped.');
        return next(); // Continue without authentication
      }
      
      // Verify the token using the secret
      const decoded = jwt.verify(token, jwtSecret);
      
      // Find the user in the database
      const user = await User.findByPk(decoded.id);
      
      if (user) {
        // Attach the user info to the request object
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email
        };
      }
    } catch (tokenError) {
      // Token is invalid or expired, but that's okay - just continue without req.user
      // We don't throw an error because this is optional authentication
      // The user might just be browsing without being logged in
    }
    
    // Always call next() to continue to the next middleware or route handler
    next();
    
  } catch (error) {
    // If there's an unexpected error (like database connection issue),
    // we'll still continue without authentication rather than failing the request
    console.error('Optional auth middleware error:', error);
    next(); // Continue without setting req.user
  }
};

module.exports = optionalAuthMiddleware;





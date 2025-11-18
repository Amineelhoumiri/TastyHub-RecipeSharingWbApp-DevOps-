// This middleware acts as a "bouncer" for our protected routes
// It checks if the user has a valid JWT token before allowing them to access certain endpoints

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication Middleware
 *
 * This function checks if the incoming request has a valid JWT token.
 * If valid, it extracts the user ID from the token and attaches it to req.user
 * so that our controller functions can know who is making the request.
 *
 * Usage: Add this middleware to any route that requires authentication
 * Example: router.get('/profile', authMiddleware, userController.getUserProfile)
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    // The frontend should send: Authorization: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No valid token provided. Please log in first.'
      });
    }

    // Extract just the token part (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        message: 'Access denied. Token is missing.'
      });
    }

    // Verify the token using our secret key
    // If the token is invalid or expired, this will throw an error
    // IMPORTANT: JWT_SECRET must be set in environment variables for security!
    // Never use a weak fallback secret - this would be a major security vulnerability
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('Γ¥î ERROR: JWT_SECRET environment variable is required!');
      console.error('≡ƒÆí Please add JWT_SECRET to your .env file');
      return res.status(500).json({
        message: 'Server configuration error. Please contact support.'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    // Find the user in the database to make sure they still exist
    // (in case they were deleted after the token was issued)
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'Access denied. User not found.'
      });
    }

    // Attach the user info to the request object
    // Now our controller functions can access req.user.id, req.user.email, etc.
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    // Call next() to continue to the next middleware or route handler
    next();

  } catch (error) {
    // If token verification fails (expired, invalid, etc.)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token. Please log in again.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired. Please log in again.'
      });
    }

    // Any other error
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      message: 'Authentication error. Please try again.'
    });
  }
};

module.exports = authMiddleware;





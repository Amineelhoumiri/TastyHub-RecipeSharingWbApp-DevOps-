const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Import our authentication middleware
const { uploadProfilePicture } = require('../middleware/uploadMiddleware');

//  AUTH / USER ACCOUNT ROUTES (Public - no authentication required)

// @route   POST /api/users/register
router.post('/register', userController.registerUser);

// @route   POST /api/users/login
router.post('/login', userController.loginUser);

// USER PROFILE ROUTES (Protected - require authentication)

// @route   GET /api/users/profile
// The authMiddleware checks for a valid JWT token before allowing access
router.get('/profile', authMiddleware, userController.getUserProfile);

// @route   PUT /api/users/profile
router.put('/profile', authMiddleware, userController.updateUserProfile);

// @route   PUT /api/users/profile/picture
// Make sure authMiddleware runs first so we have req.user available
router.put('/profile/picture', authMiddleware, (req, res, next) => {
  uploadProfilePicture(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message });
      }
      // Handle other errors (like file type validation)
      if (err.message) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: 'Error uploading file' });
    }
    next();
  });
}, userController.updateProfilePicture);

// @route   PUT /api/users/preferences
router.put('/preferences', authMiddleware, userController.updateUserPreferences);

// @route   GET /api/users/recipes
// Get all recipes created by the logged-in user
router.get('/recipes', authMiddleware, userController.getUserRecipes);

// @route   GET /api/users/favorites
// Get all recipes favorited by the logged-in user
router.get('/favorites', authMiddleware, userController.getUserFavorites);

// @route   GET /api/users/liked
// Get all recipes liked by the logged-in user
router.get('/liked', authMiddleware, userController.getUserLikedRecipes);

// @route   GET /api/users/:userId
// Public endpoint to view any user's profile (keep this last to avoid route conflicts)
router.get('/:userId', userController.getUserById);

module.exports = router;

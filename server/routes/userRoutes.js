const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Import our authentication middleware

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
router.put('/profile/picture', authMiddleware, userController.updateProfilePicture);

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

module.exports = router;
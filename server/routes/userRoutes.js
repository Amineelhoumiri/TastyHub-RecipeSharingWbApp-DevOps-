const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//  AUTH / USER ACCOUNT ROUTES :

// @route   POST /api/users/register
router.post('/register', userController.registerUser);

// @route   POST /api/users/login
router.post('/login', userController.loginUser);

// USER PROFILE ROUTES :

// @route   GET /api/users/profile
router.get('/profile', userController.getUserProfile);

// @route   PUT /api/users/profile
router.put('/profile', userController.updateUserProfile);

// @route   PUT /api/users/profile/picture
router.put('/profile/picture', userController.updateProfilePicture);

// @route   PUT /api/users/preferences
router.put('/preferences', userController.updateUserPreferences);

module.exports = router;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Apply auth and admin middleware to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', adminController.getAllUsers);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user
router.delete('/users/:userId', adminController.deleteUser);

// @route   PUT /api/admin/users/:userId
// @desc    Update a user (including password)
router.put('/users/:userId', adminController.updateUser);

// @route   POST /api/admin/users
// @desc    Create a new user
router.post('/users', adminController.createUser);

// @route   GET /api/admin/recipes
// @desc    Get all recipes
router.get('/recipes', adminController.getAllRecipes);

// @route   DELETE /api/admin/recipes/:recipeId
// @desc    Delete any recipe
router.delete('/recipes/:recipeId', adminController.deleteRecipe);

// @route   DELETE /api/admin/comments/:commentId
// @desc    Delete any comment
router.delete('/comments/:commentId', adminController.deleteComment);

module.exports = router;

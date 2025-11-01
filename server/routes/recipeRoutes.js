const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// RECIPE ROUTES

// @route   GET /api/recipes
router.get('/', recipeController.getAllRecipes);

// @route   GET /api/recipes/:recipeId
router.get('/:recipeId', recipeController.getRecipeById);

// @route   POST /api/recipes
router.post('/', recipeController.createRecipe);

// @route   PUT /api/recipes/:recipeId
router.put('/:recipeId', recipeController.updateRecipe);

// @route   DELETE /api/recipes/:recipeId
router.delete('/:recipeId', recipeController.deleteRecipe);

//  INTERACTION ROUTES

// @route   POST /api/recipes/:recipeId/like
router.post('/:recipeId/like', recipeController.likeRecipe);

// @route   POST /api/recipes/:recipeId/favourite
router.post('/:recipeId/favourite', recipeController.favouriteRecipe);

//  COMMENT ROUTES (related to recipes)

// @route   POST /api/recipes/:recipeId/comments
router.post('/:recipeId/comments', recipeController.createComment);

module.exports = router;
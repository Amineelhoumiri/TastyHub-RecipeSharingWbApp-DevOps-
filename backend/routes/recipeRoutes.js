const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware'); // Import our authentication middleware
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware'); // Optional auth for public routes

// RECIPE ROUTES

// @route   GET /api/recipes
// Public route - anyone can view public recipes (but shows more if authenticated)
// We use optionalAuthMiddleware so logged-in users see their private recipes too
router.get('/', optionalAuthMiddleware, recipeController.getAllRecipes);

// @route   GET /api/recipes/tags/popular
// Public route - get popular tags
router.get('/tags/popular', recipeController.getPopularTags);


// @route   GET /api/recipes/:recipeId
// Public route - anyone can view public recipes (but private recipes require ownership)
// We use optionalAuthMiddleware so logged-in users can see their own private recipes
router.get('/:recipeId', optionalAuthMiddleware, recipeController.getRecipeById);

// @route   POST /api/recipes
// Protected route - only logged-in users can create recipes
router.post('/', authMiddleware, recipeController.createRecipe);

// @route   PUT /api/recipes/:recipeId
// Protected route - only the recipe owner can update it
router.put('/:recipeId', authMiddleware, recipeController.updateRecipe);

// @route   DELETE /api/recipes/:recipeId
// Protected route - only the recipe owner can delete it
router.delete('/:recipeId', authMiddleware, recipeController.deleteRecipe);

//  INTERACTION ROUTES

// @route   POST /api/recipes/:recipeId/like
// Protected route - only logged-in users can like recipes
router.post('/:recipeId/like', authMiddleware, recipeController.likeRecipe);

// @route   POST /api/recipes/:recipeId/favourite
// Protected route - only logged-in users can favorite recipes
router.post('/:recipeId/favourite', authMiddleware, recipeController.favouriteRecipe);

//  COMMENT ROUTES (related to recipes)

// @route   POST /api/recipes/:recipeId/comments
// Protected route - only logged-in users can comment on recipes
router.post('/:recipeId/comments', authMiddleware, recipeController.createComment);

// @route   POST /api/recipes/upload-image
// Protected route - upload recipe image
const { uploadRecipeImage } = require('../middleware/uploadMiddleware');
const multer = require('multer');

router.post('/upload-image', authMiddleware, (req, res, next) => {
  uploadRecipeImage(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message });
      }
      if (err.message) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: 'Error uploading file' });
    }
    next();
  });
}, recipeController.uploadImage);

module.exports = router;

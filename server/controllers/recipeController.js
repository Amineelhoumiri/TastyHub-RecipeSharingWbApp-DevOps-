// I'll import all the models I'll need for recipes from my main models/index.js file
const { Recipe, RecipeIngredient, RecipeStep, Tag, Review, Like, Favorite, User, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/recipes
 * @desc    Get all public recipes (for guests) or all recipes if user is logged in
 * @access  Public (but shows more if authenticated)
 */
exports.getAllRecipes = async (req, res) => {
  try {
    // Add pagination support to handle large numbers of recipes efficiently
    // This prevents loading thousands of recipes at once, which would be slow
    // Users can request specific pages of results
    
    // Get page number and page size from query parameters
    // Default to page 1 with 20 recipes per page (reasonable defaults)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    
    // Validate pagination parameters
    // Page must be at least 1, and page size should be between 1 and 100
    if (page < 1) {
      return res.status(400).json({ message: 'Page number must be at least 1' });
    }
    
    if (pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ message: 'Page size must be between 1 and 100' });
    }
    
    // Calculate offset (how many recipes to skip)
    // For page 1: skip 0, for page 2: skip 20, for page 3: skip 40, etc.
    const offset = (page - 1) * pageSize;
    
    // Fetch recipes with pagination, ordered by most recent first
    // This gives users the newest recipes first, which is usually what they want
    let recipes;
    let totalCount;
    
    try {
      // Get total count of recipes for pagination metadata
      // This helps the frontend know how many pages are available
      totalCount = await Recipe.count();
      
      // Fetch only the recipes for the current page
      // We use limit and offset to get just the recipes we need
      recipes = await Recipe.findAll({
        limit: pageSize,      // Maximum number of recipes to return
        offset: offset,        // Number of recipes to skip
        order: [['createdAt', 'DESC']] // Newest recipes first
      });
    } catch (queryError) {
      console.error('Recipe.findAll failed:', queryError.message);
      throw queryError;
    }
    
    // Try to fetch user info separately (but don't fail if it doesn't work)
    let userMap = {};
    try {
      if (recipes && recipes.length > 0) {
        const userIds = [...new Set(recipes.map(r => r.userId).filter(Boolean))];
        if (userIds.length > 0) {
          const users = await User.findAll({
            where: { id: userIds },
            attributes: ['id', 'username', 'profilePicture']
          });
          users.forEach(u => { userMap[u.id] = u; });
        }
      }
    } catch (userError) {
      console.error('Could not fetch user info:', userError.message);
      // Continue without user info
    }
    
    // Build response safely
    const recipeList = (recipes || []).map(recipe => {
      try {
        return {
          id: recipe.id || null,
          title: recipe.title || 'Untitled',
          description: recipe.description || '',
          author: userMap[recipe.userId] ? {
            id: userMap[recipe.userId].id,
            username: userMap[recipe.userId].username,
            profilePicture: userMap[recipe.userId].profilePicture
          } : { id: recipe.userId || null, username: 'Unknown', profilePicture: null },
          imageUrl: recipe.imageUrl || null,
          cookingTime: recipe.cookingTime || null,
          servings: recipe.servings || null,
          totalLikes: recipe.totalLikes || 0,
          averageRating: recipe.averageRating || 0,
          createdAt: recipe.createdAt || null
        };
      } catch (mapError) {
        console.error('Error mapping recipe:', mapError);
        return null;
      }
    }).filter(r => r !== null);
    
    // Calculate pagination metadata
    // This helps the frontend build pagination controls
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    res.json({
      message: 'Recipes fetched successfully',
      count: recipeList.length,           // Number of recipes in this page
      totalCount: totalCount,              // Total number of recipes in database
      page: page,                          // Current page number
      pageSize: pageSize,                  // Number of recipes per page
      totalPages: totalPages,              // Total number of pages
      hasNextPage: hasNextPage,            // Whether there's a next page
      hasPreviousPage: hasPreviousPage,    // Whether there's a previous page
      recipes: recipeList
    });
  } catch (error) {
    console.error('Get all recipes error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error while fetching recipes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message
      } : undefined
    });
  }
};

/**
 * @route   GET /api/recipes/:recipeId
 * @desc    Get a single recipe by its ID with all its details (ingredients, steps, etc.)
 * @access  Public
 */
exports.getRecipeById = async (req, res) => {
  try {
    const { recipeId } = req.params;

    // Find the recipe with all its related data
    const recipe = await Recipe.findByPk(recipeId, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: RecipeIngredient,
          as: 'ingredients',
          attributes: ['id', 'ingredientName', 'quantity', 'unit', 'notes']
        },
        {
          model: RecipeStep,
          as: 'steps',
          attributes: ['id', 'stepNumber', 'instruction', 'stepImage'],
          order: [['stepNumber', 'ASC']] // Order steps by step number
        },
        {
          model: Review,
          as: 'Reviews',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'profilePicture']
          }],
          order: [['createdAt', 'DESC']] // Newest reviews first
        }
      ]
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user has liked/favorited this recipe (if logged in)
    let isLiked = false;
    let isFavorited = false;
    
    if (req.user) {
      const like = await Like.findOne({
        where: { userId: req.user.id, recipeId: recipeId }
      });
      isLiked = !!like;
      
      const favorite = await Favorite.findOne({
        where: { userId: req.user.id, recipeId: recipeId }
      });
      isFavorited = !!favorite;
    }

    res.json({
      message: 'Recipe fetched successfully',
      recipe: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        author: {
          id: recipe.User?.id,
          username: recipe.User?.username,
          profilePicture: recipe.User?.profilePicture
        },
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        totalLikes: recipe.totalLikes,
        totalDownloads: recipe.totalDownloads,
        totalShares: recipe.totalShares,
        averageRating: recipe.averageRating,
        imageUrl: recipe.imageUrl,
        isLiked,
        isFavorited,
        reviews: recipe.Reviews || [],
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt
      }
    });
  } catch (error) {
    console.error('Get recipe by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching recipe' });
  }
};

/**
 * @route   POST /api/recipes
 * @desc    Create a new recipe
 * @access  Private (requires authentication)
 */
exports.createRecipe = async (req, res) => {
  // We'll use a database transaction to ensure all-or-nothing creation
  // If anything fails (recipe, steps, or ingredients), we roll back everything
  // This prevents orphaned data in the database
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      title, 
      description, 
      steps, 
      ingredients, 
      cookingTime, 
      servings, 
      imageUrl,
      tags 
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Title is required' });
    }

    // Validate input data types and ranges
    if (cookingTime !== undefined && cookingTime !== null) {
      const cookingTimeNum = parseInt(cookingTime);
      if (isNaN(cookingTimeNum) || cookingTimeNum < 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Cooking time must be a positive number' });
      }
    }

    if (servings !== undefined && servings !== null) {
      const servingsNum = parseInt(servings);
      if (isNaN(servingsNum) || servingsNum < 1) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Servings must be at least 1' });
      }
    }

    // Validate title length
    if (title.trim().length > 255) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Title is too long (maximum 255 characters)' });
    }

    // Create the main recipe record within the transaction
    // If this fails, the transaction will roll back automatically
    const newRecipe = await Recipe.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      userId: req.user.id, // Get user ID from auth middleware
      cookingTime: cookingTime ? parseInt(cookingTime) : null,
      servings: servings ? parseInt(servings) : null,
      imageUrl: imageUrl ? imageUrl.trim() : null
    }, { transaction }); // Pass transaction to ensure it's part of the same transaction

    // Create recipe steps if provided
    // All steps are created within the same transaction
    if (steps && Array.isArray(steps) && steps.length > 0) {
      const stepPromises = steps.map((step, index) => {
        // Validate step data
        if (!step.instruction && !step.text) {
          throw new Error(`Step ${index + 1} must have an instruction`);
        }
        
        return RecipeStep.create({
          recipeId: newRecipe.id,
          stepNumber: step.stepNumber || index + 1,
          instruction: (step.instruction || step.text || '').trim(),
          stepImage: step.stepImage || null
        }, { transaction }); // Include transaction
      });
      await Promise.all(stepPromises);
    }

    // Create recipe ingredients if provided
    // All ingredients are created within the same transaction
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      const ingredientPromises = ingredients.map((ingredient, index) => {
        // Validate ingredient data
        const ingredientName = ingredient.name || ingredient.ingredientName;
        if (!ingredientName || !ingredientName.trim()) {
          throw new Error(`Ingredient ${index + 1} must have a name`);
        }
        
        const quantity = parseFloat(ingredient.quantity);
        if (isNaN(quantity) || quantity < 0) {
          throw new Error(`Ingredient ${index + 1} must have a valid quantity`);
        }
        
        return RecipeIngredient.create({
          recipeId: newRecipe.id,
          ingredientName: ingredientName.trim(),
          quantity: quantity,
          unit: ingredient.unit || 'piece',
          notes: ingredient.notes ? ingredient.notes.trim() : null
        }, { transaction }); // Include transaction
      });
      await Promise.all(ingredientPromises);
    }

    // Handle tags if provided (many-to-many relationship)
    // Note: Tag association will be implemented when the tag system is ready
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Tag association logic will be added here
    }

    // If we made it here, everything succeeded! Commit the transaction
    // This makes all the database changes permanent
    await transaction.commit();

    // Fetch the complete recipe with all relations to send back
    // We do this after committing because we want to make sure everything is saved first
    const completeRecipe = await Recipe.findByPk(newRecipe.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: RecipeIngredient,
          as: 'ingredients'
        },
        {
          model: RecipeStep,
          as: 'steps',
          order: [['stepNumber', 'ASC']]
        }
      ]
    });

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: completeRecipe
    });
  } catch (error) {
    // If anything went wrong, roll back the entire transaction
    // This ensures we don't have partial data (like a recipe without ingredients)
    await transaction.rollback();
    
    console.error('Create recipe error:', error);
    
    // Send a user-friendly error message
    if (error.message && error.message.includes('must have')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error while creating recipe' });
  }
};

/**
 * @route   PUT /api/recipes/:recipeId
 * @desc    Update one of *your* own recipes
 * @access  Private (requires authentication and ownership)
 */
exports.updateRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { 
      title, 
      description, 
      cookingTime, 
      servings, 
      imageUrl 
    } = req.body;

    // Find the recipe first
    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the user owns this recipe
    if (recipe.userId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own recipes.' 
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (cookingTime !== undefined) updateData.cookingTime = cookingTime;
    if (servings !== undefined) updateData.servings = servings;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    updateData.updatedAt = new Date(); // Update the timestamp

    // Update the recipe
    await recipe.update(updateData);

    // Fetch the updated recipe with all relations
    const updatedRecipe = await Recipe.findByPk(recipeId, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: RecipeIngredient,
          as: 'ingredients'
        },
        {
          model: RecipeStep,
          as: 'steps',
          order: [['stepNumber', 'ASC']]
        }
      ]
    });

    res.json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ message: 'Server error while updating recipe' });
  }
};

/**
 * @route   DELETE /api/recipes/:recipeId
 * @desc    Delete one of *your* own recipes
 * @access  Private (requires authentication and ownership)
 */
exports.deleteRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    // Find the recipe first
    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the user owns this recipe
    if (recipe.userId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own recipes.' 
      });
    }

    // Delete the recipe (this will cascade delete related ingredients, steps, etc.
    // if you have ON DELETE CASCADE set up in your database)
    await recipe.destroy();

    res.json({
      message: 'Recipe deleted successfully',
      recipeId: recipeId
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ message: 'Server error while deleting recipe' });
  }
};

/**
 * @route   POST /api/recipes/:recipeId/like
 * @desc    Like or unlike a recipe (toggle like)
 * @access  Private (requires authentication)
 */
exports.likeRecipe = async (req, res) => {
  // Use a transaction to prevent race conditions
  // If two users like the same recipe at the exact same time, we want to handle it correctly
  const transaction = await sequelize.transaction();
  
  try {
    const { recipeId } = req.params;

    // Check if recipe exists - lock the row to prevent concurrent modifications
    // This ensures that if two requests come in at the same time, they wait for each other
    // We use 'UPDATE' lock which allows other transactions to read but not modify
    const recipe = await Recipe.findByPk(recipeId, {
      lock: true, // Lock the row for update (prevents concurrent modifications)
      transaction
    });
    
    if (!recipe) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user already liked this recipe
    // We do this within the transaction to ensure consistency
    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        recipeId: recipeId
      },
      transaction
    });

    if (existingLike) {
      // Unlike: remove the like and decrement count
      // All within the same transaction to keep data consistent
      await existingLike.destroy({ transaction });
      
      // Decrement the total likes count atomically
      // Using decrement ensures the count is accurate even with concurrent requests
      await recipe.decrement('totalLikes', { transaction });
      
      // Reload the recipe to get the updated count
      await recipe.reload({ transaction });
      
      // Commit the transaction - all changes are now permanent
      await transaction.commit();
      
      res.json({
        message: 'Recipe unliked successfully',
        isLiked: false,
        totalLikes: recipe.totalLikes
      });
    } else {
      // Like: create a new like and increment count
      // We use findOrCreate to handle race conditions gracefully
      // If two requests try to create a like at the same time, only one will succeed
      const [like, created] = await Like.findOrCreate({
        where: {
          userId: req.user.id,
          recipeId: recipeId
        },
        defaults: {
          userId: req.user.id,
          recipeId: recipeId
        },
        transaction
      });
      
      // Only increment if we actually created a new like
      // (findOrCreate might return an existing like if there was a race condition)
      if (created) {
        // Increment the total likes count atomically
        await recipe.increment('totalLikes', { transaction });
      }
      
      // Reload the recipe to get the updated count
      await recipe.reload({ transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      res.json({
        message: 'Recipe liked successfully',
        isLiked: true,
        totalLikes: recipe.totalLikes
      });
    }
  } catch (error) {
    // If anything went wrong, roll back the transaction
    await transaction.rollback();
    
    console.error('Like recipe error:', error);
    
    // Handle unique constraint violations (if user tries to like twice simultaneously)
    if (error.name === 'SequelizeUniqueConstraintError') {
      // This shouldn't happen with findOrCreate, but just in case...
      return res.status(400).json({ message: 'You have already liked this recipe' });
    }
    
    res.status(500).json({ message: 'Server error while toggling like' });
  }
};

/**
 * @route   POST /api/recipes/:recipeId/favourite
 * @desc    Favourite or unfavourite a recipe (toggle favorite)
 * @access  Private (requires authentication)
 */
exports.favouriteRecipe = async (req, res) => {
  // Use a transaction to prevent race conditions
  // Similar to the like function, we want to handle concurrent requests correctly
  const transaction = await sequelize.transaction();
  
  try {
    const { recipeId } = req.params;

    // Check if recipe exists
    const recipe = await Recipe.findByPk(recipeId, { transaction });
    if (!recipe) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user already favorited this recipe
    // We use findOrCreate to handle race conditions gracefully
    const [favorite, created] = await Favorite.findOrCreate({
      where: {
        userId: req.user.id,
        recipeId: recipeId
      },
      defaults: {
        userId: req.user.id,
        recipeId: recipeId
      },
      transaction
    });

    if (!created) {
      // Unfavorite: remove the favorite
      // The favorite already exists, so we remove it
      await favorite.destroy({ transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      res.json({
        message: 'Recipe removed from favorites successfully',
        isFavorited: false
      });
    } else {
      // Favorite: we just created a new favorite
      // Commit the transaction
      await transaction.commit();
      
      res.json({
        message: 'Recipe added to favorites successfully',
        isFavorited: true
      });
    }
  } catch (error) {
    // If anything went wrong, roll back the transaction
    await transaction.rollback();
    
    console.error('Favorite recipe error:', error);
    
    // Handle unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'You have already favorited this recipe' });
    }
    
    res.status(500).json({ message: 'Server error while toggling favorite' });
  }
};

/**
 * @route   POST /api/recipes/:recipeId/comments
 * @desc    Create a new comment/review on a recipe
 * @access  Private (requires authentication)
 */
exports.createComment = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { comment, rating } = req.body;

    // Validate required fields
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Validate rating if provided (should be between 1 and 5)
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if recipe exists
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Create the review/comment
    const newReview = await Review.create({
      userId: req.user.id,
      recipeId: recipeId,
      comment: comment.trim(),
      rating: rating || null
    });

    // If a rating was provided, we should recalculate the average rating for the recipe
    // Instead of fetching all reviews and calculating in JavaScript, we use a database aggregate
    // This is much more efficient, especially as the number of reviews grows
    if (rating) {
      // Use Sequelize's aggregate function to calculate the average directly in the database
      // This is much faster than fetching all reviews and calculating in JavaScript
      const result = await Review.findOne({
        where: { recipeId: recipeId },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
          [sequelize.fn('COUNT', sequelize.col('rating')), 'ratingCount']
        ],
        raw: true
      });
      
      // The result will have the average rating and count
      // If there are ratings, update the recipe's average rating
      if (result && result.averageRating) {
        const averageRating = parseFloat(parseFloat(result.averageRating).toFixed(1));
        await recipe.update({ averageRating: averageRating });
      } else {
        // No ratings yet, set to 0
        await recipe.update({ averageRating: 0.0 });
      }
    }

    // Fetch the complete review with user info to send back
    const completeReview = await Review.findByPk(newReview.id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'username', 'profilePicture']
      }]
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment: completeReview
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error while creating comment' });
  }
};
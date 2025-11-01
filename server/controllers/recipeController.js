/**
 * @route   GET /api/recipes
 * [cite_start]@desc    Get all public recipes (for guests) [cite: 142]
 */
exports.getAllRecipes = (req, res) => {
  //  TODO: Database logic
  // 1. Find all recipes in the DB where `privacy` is 'public'
  // 2. `const recipes = await Recipe.find({ privacy: 'public' }).sort({ createdAt: -1 });`

  res.json([
    { id: 'recipe-1', title: 'Spaghetti', author: 'Chef Mario', thumbnail: 'spaghetti.jpg' },
    { id: 'recipe-2', title: 'Pancakes', author: 'Chef Alex', thumbnail: 'pancakes.jpg' }
  ]);
};

/**
 * @route   GET /api/recipes/:recipeId
 * @desc    Get a single recipe by its ID
 */
exports.getRecipeById = (req, res) => {
  const { recipeId } = req.params;

  //  TODO: Database logic
  // 1. Find the recipe by its ID: `const recipe = await Recipe.findById(recipeId);`
  // 2. Handle 'not found' errors
  // 3. Check if the recipe is 'private' and if the current user is the owner

  res.json({
    message: 'Fetched single recipe (placeholder)',
    recipe: { id: recipeId, title: 'Spaghetti', steps: '...', ingredients: '...' }
  });
};

/**
 * @route   POST /api/recipes
 * [cite_start]@desc    Create a new recipe [cite: 148]
 */
exports.createRecipe = (req, res) => {
  const { title, description, steps, ingredients, privacy } = req.body;
  console.log('Creating new recipe:', { title, privacy });

  //  TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected (only logged-in users can create recipes)
  // 2. Get the author's ID from `req.user.id`
  // 3. Create a new Recipe document:
  //    `const newRecipe = new Recipe({ title, description, steps, ..., author: req.user.id });`
  // 4. Save it to the DB: `await newRecipe.save();`

  res.status(201).json({
    message: 'Recipe created (placeholder)',
    recipe: { id: 'recipe-3', title, privacy, author: 'user-1' }
  });
};

/**
 * @route   PUT /api/recipes/:recipeId
 * [cite_start]@desc    Update one of *your* own recipes [cite: 148]
 */
exports.updateRecipe = (req, res) => {
  const { recipeId } = req.params;
  const { title, description } = req.body;

  //  TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected
  // 2. Find the recipe: `const recipe = await Recipe.findById(recipeId);`
  // 3. Check if `recipe.author` is the same as `req.user.id` (to ensure they own it)
  // 4. If they own it, update it:
  //    `const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, { title, description }, { new: true });`

  res.json({
    message: 'Recipe updated (placeholder)',
    recipe: { id: recipeId, title, description }
  });
};

/**
 * @route   DELETE /api/recipes/:recipeId
 * [cite_start]@desc    Delete one of *your* own recipes [cite: 148]
 */
exports.deleteRecipe = (req, res) => {
  const { recipeId } = req.params;

  //  TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected
  // 2. Find the recipe: `const recipe = await Recipe.findById(recipeId);`
  // 3. Check if `recipe.author` is the same as `req.user.id`
  // 4. If they own it, delete it: `await Recipe.findByIdAndDelete(recipeId);`

  res.json({
    message: 'Recipe deleted (placeholder)',
    recipeId: recipeId
  });
};

/**
 * @route   POST /api/recipes/:recipeId/like
 * [cite_start]@desc    Like or unlike a recipe [cite: 153]
 */
exports.likeRecipe = (req, res) => {
  const { recipeId } = req.params;

  //  TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected
  // 2. Get user ID from `req.user.id`
  // 3. Find the recipe: `const recipe = await Recipe.findById(recipeId);`
  // 4. Check if the user's ID is already in the `recipe.likes` array
  // 5. If it is, remove it (unlike). If it's not, add it (like).
  // 6. Save the updated recipe

  res.json({
    message: 'Recipe like/unlike toggled (placeholder)',
    likes: 10 // Send back the new like count
  });
};

/**
 * @route   POST /api/recipes/:recipeId/favourite
 * [cite_start]@desc    Favourite or unfavourite a recipe [cite: 153]
 */
exports.favouriteRecipe = (req, res) => {
  const { recipeId } = req.params;

  //  TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected
  // 2. Find the user: `const user = await User.findById(req.user.id);`
  // 3. Check if `recipeId` is in the `user.favourites` array
  // 4. If it is, remove it. If not, add it.
  // 5. Save the updated user document

  res.json({
    message: 'Recipe favourite toggled (placeholder)',
    favourites: ['recipe-1', recipeId] // Send back the new list
  });
};

/**
 * @route   POST /api/recipes/:recipeId/comments
 * [cite_start]@desc    Create a new comment on a recipe [cite: 154]
 */
exports.createComment = (req, res) => {
  const { recipeId } = req.params;
  const { text } = req.body;

  //  TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected
  // 2. Create a new Comment document:
  //    `const newComment = new Comment({ text, author: req.user.id, recipe: recipeId });`
  // 3. Save the comment: `await newComment.save();`

  res.status(201).json({
    message: 'Comment created (placeholder)',
    comment: { id: 'comment-1', text, author: 'user-1', recipe: recipeId }
  });
};
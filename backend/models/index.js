const sequelize = require('../config/database');
const User = require('./userModel');
const Recipe = require('./recipeModel');
const RecipeIngredient = require('./recipeIngredientsModel');
const RecipeStep = require('./recipeStepModel');
const Tag = require('./tagModel');
const RecipeTag = require('./recipeTagModel');
const Review = require('./reviewModel');
const Like = require('./likeModel');
const Favorite = require('./favoriteModel');
const ActivityLog = require('./activityLogModel');

// --- Define Relationships ---

// User-Recipe (One-to-Many)
User.hasMany(Recipe, { foreignKey: 'user_id' });
Recipe.belongsTo(User, { foreignKey: 'user_id' });

// User-Review (One-to-Many)
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// Recipe-Review (One-to-Many)
Recipe.hasMany(Review, { foreignKey: 'recipe_id', as: 'Reviews' });
Review.belongsTo(Recipe, { foreignKey: 'recipe_id' });

// Recipe-Ingredient (One-to-Many)
Recipe.hasMany(RecipeIngredient, { foreignKey: 'recipe_id', as: 'ingredients' });
RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipe_id' });

// Recipe-Step (One-to-Many)
Recipe.hasMany(RecipeStep, { foreignKey: 'recipe_id', as: 'steps' });
RecipeStep.belongsTo(Recipe, { foreignKey: 'recipe_id' });

// User-Activity (One-to-Many)
User.hasMany(ActivityLog, { foreignKey: 'user_id' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

// Recipe-Activity (One-to-Many)
Recipe.hasMany(ActivityLog, { foreignKey: 'recipe_id' });
ActivityLog.belongsTo(Recipe, { foreignKey: 'recipe_id' });

// --- Many-to-Many Relationships ---

// User-Recipe (Likes)
User.belongsToMany(Recipe, { through: Like, foreignKey: 'user_id' });
Recipe.belongsToMany(User, { through: Like, foreignKey: 'recipe_id' });

// User-Recipe (Favorites)
User.belongsToMany(Recipe, { through: Favorite, foreignKey: 'user_id' });
Recipe.belongsToMany(User, { through: Favorite, foreignKey: 'recipe_id' });

// Direct associations for Favorite and Like to Recipe (for easier querying)
Favorite.belongsTo(Recipe, { foreignKey: 'recipe_id' });
Like.belongsTo(Recipe, { foreignKey: 'recipe_id' });

// Recipe-Tag (Many-to-Many)
Recipe.belongsToMany(Tag, { through: RecipeTag, foreignKey: 'recipe_id' });
Tag.belongsToMany(Recipe, { through: RecipeTag, foreignKey: 'tag_id' });

// Export all models
module.exports = {
  sequelize,
  User,
  Recipe,
  RecipeIngredient,
  RecipeStep,
  Tag,
  RecipeTag,
  Review,
  Like,
  Favorite,
  ActivityLog
};

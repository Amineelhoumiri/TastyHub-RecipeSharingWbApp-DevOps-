const sequelize = require('../config/database'); //  DB connection

// Model files
const User = require('./userModel');
const Recipe = require('./recipeModel');
const RecipeIngredient = require('./recipeIngredientsModel');
const RecipeStep = require('./recipeStepsModel');
const Tag = require('./tagModel');
const RecipeTag = require('./recipeTagModel');
const Review = require('./reviewModel');
const Like = require('./likeModel');
const Favorite = require('./favoriteModel');
const ActivityLog = require('./activityLogModel');

// an object to hold all models
const db = {
  sequelize, // The connection instance
  User,
  Recipe,
  RecipeIngredient,
  RecipeStep,
  Tag,
  RecipeTag,
  Review,
  Like,
  Favorite,
  ActivityLog,
};

//  RELATIONSHIPS (from the ER Diagram)

//  One-to-Many Relationships 

// User <-> Recipe
User.hasMany(Recipe, { foreignKey: 'userId', as: 'recipes' });
Recipe.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// Recipe <-> RecipeIngredient
Recipe.hasMany(RecipeIngredient, { foreignKey: 'recipeId', as: 'ingredients' });
RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipeId' });

// Recipe <-> RecipeStep
Recipe.hasMany(RecipeStep, { foreignKey: 'recipeId', as: 'steps' });
RecipeStep.belongsTo(Recipe, { foreignKey: 'recipeId' });

// Recipe <-> Review
Recipe.hasMany(Review, { foreignKey: 'recipeId', as: 'reviews' });
Review.belongsTo(Recipe, { foreignKey: 'recipeId' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// User <-> ActivityLog
User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

// Recipe <-> ActivityLog
Recipe.hasMany(ActivityLog, { foreignKey: 'recipeId' });
ActivityLog.belongsTo(Recipe, { foreignKey: 'recipeId' });

//  Many-to-Many Relationships (using Junction tables) 

// Recipe <-> Tag
Recipe.belongsToMany(Tag, {
  through: RecipeTag, // The "junction" table
  foreignKey: 'recipeId',
  as: 'tags',
});
Tag.belongsToMany(Recipe, {
  through: RecipeTag, // The "junction" table
  foreignKey: 'tagId',
  as: 'recipes',
});

// User <-> Recipe (Likes)
User.belongsToMany(Recipe, {
  through: Like,
  foreignKey: 'userId',
  as: 'LikedRecipes',
});
Recipe.belongsToMany(User, {
  through: Like,
  foreignKey: 'recipeId',
  as: 'LikedByUsers',
});

// User <-> Recipe (Favorites)
User.belongsToMany(Recipe, {
  through: Favorite,
  foreignKey: 'userId',
  as: 'FavoriteRecipes',
});
Recipe.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'recipeId',
  as: 'FavoritedByUsers',
});

// Export the db object
// Now we can import 'db' from this file anywhere in our app
module.exports = db;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeTag = sequelize.define(
  'RecipeTag',
  {
    recipeId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      field: 'recipe_id',
    },
    tagId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      field: 'tag_id',
    },
  },
  {
    tableName: 'recipe_tags',
    timestamps: false,
  }
);

module.exports = RecipeTag;
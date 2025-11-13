const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const RecipeIngredient = sequelize.define(
  'RecipeIngredient',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    recipeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'recipe_id',
    },
    ingredientName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'ingredient_name',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [
          [
            'teaspoon',
            'tablespoon',
            'cup',
            'gram',
            'kilogram',
            'ml',
            'liter',
            'piece',
            'pinch',
            'other',
          ],
        ],
      },
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'recipe_ingredients',
    timestamps: false,
  }
);

module.exports = RecipeIngredient;
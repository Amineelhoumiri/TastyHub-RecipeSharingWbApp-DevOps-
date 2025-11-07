const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const RecipeIngredient = sequelize.define(
  'RecipeIngredient',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    // This links it to the Recipe model
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
      type: DataTypes.DECIMAL(10, 2), // Matches NUMERIC(10,2)
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(50),
      // We can add the validation from the SQL file here
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
    timestamps: false, // This table doesn't have createdAt/updatedAt
  }
);

module.exports = RecipeIngredient;
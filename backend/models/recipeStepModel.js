const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeStep = sequelize.define(
  'RecipeStep',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    recipeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'recipe_id'
    },
    stepNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'step_number'
    },
    instruction: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stepImage: {
      type: DataTypes.TEXT,
      field: 'step_image'
    }
  },
  {
    tableName: 'recipe_steps',
    timestamps: false
  }
);

module.exports = RecipeStep;

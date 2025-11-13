const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    recipeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'recipe_id',
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
      field: 'created_at',
    },
  },
  {
    tableName: 'reviews',
    timestamps: false,
  }
);

module.exports = Review;
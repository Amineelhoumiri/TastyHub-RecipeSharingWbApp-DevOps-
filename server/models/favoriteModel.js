const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define(
  'Favorite',
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      field: 'user_id',
    },
    recipeId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      field: 'recipe_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
      field: 'created_at',
    },
  },
  {
    tableName: 'favorites',
    timestamps: false,
  }
);

module.exports = Favorite;
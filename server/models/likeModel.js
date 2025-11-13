const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define(
  'Like',
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
    tableName: 'likes',
    timestamps: false,
  }
);

module.exports = Like;
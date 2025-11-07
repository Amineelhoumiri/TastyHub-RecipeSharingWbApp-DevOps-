const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Import the connection

const Recipe = sequelize.define(
  'Recipe',
  {
    // We'll map all the columns from the ER Diagram
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    // We'll link this to the User model later
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    cookingTime: {
      type: DataTypes.INTEGER,
      field: 'cooking_time',
    },
    servings: {
      type: DataTypes.INTEGER,
    },
    totalLikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_likes',
    },
    totalDownloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_downloads',
    },
    totalShares: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_shares',
    },
    averageRating: {
      type: DataTypes.DECIMAL(2, 1), // Matches NUMERIC(2,1)
      defaultValue: 0.0,
      field: 'average_rating',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      field: 'updated_at',
    },
  },
  {
    // Other model options
    tableName: 'recipes', // The exact table name in the DB
    timestamps: false, // We're defining the timestamp fields manually
  }
);

module.exports = Recipe;
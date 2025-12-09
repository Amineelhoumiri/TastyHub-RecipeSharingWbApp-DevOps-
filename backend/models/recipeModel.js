const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import the connection

const Recipe = sequelize.define(
  'Recipe',
  {
    // All the columns from your SQL file
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    cookingTime: {
      type: DataTypes.INTEGER,
      field: 'cooking_time'
    },
    servings: {
      type: DataTypes.INTEGER
    },
    totalLikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_likes'
    },
    totalDownloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_downloads'
    },
    totalShares: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_shares'
    },
    averageRating: {
      type: DataTypes.DECIMAL(2, 1), // Matches NUMERIC(2,1)
      defaultValue: 0.0,
      field: 'average_rating'
    },
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url'
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_private'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
      field: 'updated_at'
    }
  },
  {
    tableName: 'recipes',
    timestamps: false,
    indexes: [
      {
        fields: ['created_at']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['title']
      }
    ]
  }
);

module.exports = Recipe;

const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define(
  'ActivityLog',
  {
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
    recipeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'recipe_id'
    },
    actionType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'action_type',
      validate: {
        isIn: [['download', 'share']] // From your SQL file
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
      field: 'created_at'
    }
  },
  {
    tableName: 'activity_log',
    timestamps: false
  }
);

module.exports = ActivityLog;

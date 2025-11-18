const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Import the connection

const User = sequelize.define(
  'User',
  {
    // Model attributes are defined here
    // We match them to the SQL table
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Matches uuid_generate_v4()
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true // Add validation
      }
    },
    // We'll call this 'password' in our code for simplicity
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'password_hash' // But it maps to the 'password_hash' column in the database
    },
    profilePicture: {
      type: DataTypes.TEXT,
      field: 'profile_picture' // Maps to 'profile_picture'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
      field: 'created_at'
    }
  },
  {
    // Other model options
    tableName: 'users', // The exact table name in the DB
    timestamps: false // We're defining 'createdAt' manually to match the SQL
  }
);

module.exports = User;

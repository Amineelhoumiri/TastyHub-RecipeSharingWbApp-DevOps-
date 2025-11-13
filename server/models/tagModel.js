const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Tag = sequelize.define(
  'Tag',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    tagName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'tag_name',
    },
  },
  {
    tableName: 'tags',
    timestamps: false,
  }
);

module.exports = Tag;
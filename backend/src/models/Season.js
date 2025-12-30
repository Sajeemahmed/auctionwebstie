// src/models/Season.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Season = sequelize.define('seasons', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    seasonNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'season_number'
    },
    seasonName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'season_name'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_active'
    }
  }, {
    tableName: 'seasons',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['season_number'] },
      { fields: ['is_active'] },
      { fields: ['year'] }
    ]
  });

  return Season;
};
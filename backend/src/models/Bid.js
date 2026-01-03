// src/models/Bid.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bid = sequelize.define('bids', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    seasonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'season_id'
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'player_id'
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'team_id'
    },
    bidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'bid_amount',
      validate: {
        min: 0
      }
    },
    isWinning: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_winning'
    },
    bidTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'bid_time'
    }
  }, {
    tableName: 'bids',
    timestamps: false,
    indexes: [
      { fields: ['season_id'] },
      { fields: ['player_id'] },
      { fields: ['team_id'] },
      { fields: ['player_id', 'is_winning'] }
    ]
  });

  return Bid;
};
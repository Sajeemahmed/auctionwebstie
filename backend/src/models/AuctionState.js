// src/models/AuctionState.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuctionState = sequelize.define('auction_state', {
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
    currentCategory: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D', 'UNSOLD'),
      defaultValue: 'A',
      field: 'current_category'
    },
    currentPlayerId: {
      type: DataTypes.INTEGER,
      field: 'current_player_id'
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    timerSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      field: 'timer_seconds'
    },
    minBidIncrement: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 5000.00,
      field: 'min_bid_increment'
    },
    startedAt: {
      type: DataTypes.DATE,
      field: 'started_at'
    },
    pausedAt: {
      type: DataTypes.DATE,
      field: 'paused_at'
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at'
    }
  }, {
    tableName: 'auction_state',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['season_id'] },
      { fields: ['status'] },
      { fields: ['current_player_id'] }
    ]
  });

  return AuctionState;
};
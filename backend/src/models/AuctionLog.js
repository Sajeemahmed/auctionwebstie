// src/models/AuctionLog.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuctionLog = sequelize.define('auction_logs', {
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
    eventType: {
      type: DataTypes.ENUM(
        'AUCTION_STARTED',
        'AUCTION_PAUSED',
        'AUCTION_RESUMED',
        'AUCTION_COMPLETED',
        'PLAYER_ON_BID',
        'BID_PLACED',
        'PLAYER_SOLD',
        'PLAYER_UNSOLD',
        'CATEGORY_CHANGED'
      ),
      allowNull: false,
      field: 'event_type'
    },
    playerId: {
      type: DataTypes.INTEGER,
      field: 'player_id'
    },
    teamId: {
      type: DataTypes.INTEGER,
      field: 'team_id'
    },
    bidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'bid_amount'
    },
    details: {
      type: DataTypes.JSON
    }
  }, {
    tableName: 'auction_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['season_id'] },
      { fields: ['event_type'] },
      { fields: ['player_id'] },
      { fields: ['team_id'] },
      { fields: ['created_at'] }
    ]
  });

  return AuctionLog;
};
// src/models/Purchase.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Purchase = sequelize.define('purchases', {
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
    finalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'final_amount'
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'base_price'
    },
    totalBids: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_bids'
    },
    purchasedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'purchased_at'
    }
  }, {
    tableName: 'purchases',
    timestamps: false,
    indexes: [
      { fields: ['season_id'] },
      { fields: ['player_id'] },
      { fields: ['team_id'] },
      { fields: ['purchased_at'] },
      { fields: ['team_id', 'season_id'] }
    ]
  });

  return Purchase;
};
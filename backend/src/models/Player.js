// src/models/Player.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Player = sequelize.define('players', {
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
    formNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'form_number'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    photoUrl: {
      type: DataTypes.STRING(255),
      field: 'photo_url'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      field: 'date_of_birth'
    },
    age: {
      type: DataTypes.INTEGER
    },
    category: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D'),
      allowNull: false
    },
    playerType: {
      type: DataTypes.ENUM('BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'),
      allowNull: false,
      field: 'player_type'
    },
    battingHand: {
      type: DataTypes.ENUM('RH', 'LH'),
      field: 'batting_hand'
    },
    battingPosition: {
      type: DataTypes.STRING(50),
      field: 'batting_position'
    },
    bowlingArm: {
      type: DataTypes.STRING(30),
      field: 'bowling_arm'
    },
    bowlingType: {
      type: DataTypes.STRING(50),
      field: 'bowling_type'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 5
      }
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50000.00,
      field: 'base_price'
    },
    currentBid: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'current_bid'
    },
    status: {
      type: DataTypes.ENUM('UNSOLD', 'SOLD', 'WITHDRAWN', 'ON_BID'),
      allowNull: false,
      defaultValue: 'UNSOLD'
    },
    teamId: {
      type: DataTypes.INTEGER,
      field: 'team_id'
    },
    soldPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'sold_price'
    },
    auctionOrder: {
      type: DataTypes.INTEGER,
      field: 'auction_order'
    }
  }, {
    tableName: 'players',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['season_id'] },
      { fields: ['form_number'] },
      { fields: ['name'] },
      { fields: ['category'] },
      { fields: ['player_type'] },
      { fields: ['status'] },
      { fields: ['team_id'] },
      { fields: ['season_id', 'category'] },
      { fields: ['season_id', 'status'] }
    ]
  });

  return Player;
};
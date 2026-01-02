// src/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Debug: Log database configuration
console.log('📊 Database Configuration:');
console.log('  Environment:', env);
console.log('  Host:', dbConfig.host);
console.log('  Port:', dbConfig.port);
console.log('  Database:', dbConfig.database);
console.log('  Username:', dbConfig.username);
console.log('  Password:', dbConfig.password ? '***' : 'NO PASSWORD');

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging ? (msg) => logger.debug(msg) : false,
    pool: dbConfig.pool,
    define: dbConfig.define
  }
);

// Import models
const Season = require('./Season')(sequelize);
const User = require('./User')(sequelize);
const Team = require('./Team')(sequelize);
const Player = require('./Player')(sequelize);
const AuctionState = require('./AuctionState')(sequelize);
const Bid = require('./Bid')(sequelize);
const Purchase = require('./Purchase')(sequelize);
const AuctionLog = require('./AuctionLog')(sequelize);

// Define relationships
const db = {
  sequelize,
  Sequelize,
  Season,
  User,
  Team,
  Player,
  AuctionState,
  Bid,
  Purchase,
  AuctionLog
};

// Season relationships
Season.hasMany(User, { foreignKey: 'seasonId', onDelete: 'CASCADE' });
Season.hasMany(Team, { foreignKey: 'seasonId', onDelete: 'CASCADE' });
Season.hasMany(Player, { foreignKey: 'seasonId', onDelete: 'CASCADE' });
Season.hasOne(AuctionState, { foreignKey: 'seasonId', onDelete: 'CASCADE' });

// User relationships
User.belongsTo(Season, { foreignKey: 'seasonId' });
User.hasOne(Team, { foreignKey: 'ownerId' });

// Team relationships
Team.belongsTo(Season, { foreignKey: 'seasonId' });
Team.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Team.hasMany(Player, { foreignKey: 'teamId' });
Team.hasMany(Bid, { foreignKey: 'teamId' });
Team.hasMany(Purchase, { foreignKey: 'teamId' });

// Player relationships
Player.belongsTo(Season, { foreignKey: 'seasonId' });
Player.belongsTo(Team, { foreignKey: 'teamId' });
Player.hasMany(Bid, { foreignKey: 'playerId', onDelete: 'CASCADE' });
Player.hasOne(Purchase, { foreignKey: 'playerId', onDelete: 'CASCADE' });

// AuctionState relationships
AuctionState.belongsTo(Season, { foreignKey: 'seasonId' });
AuctionState.belongsTo(Player, { as: 'currentPlayer', foreignKey: 'currentPlayerId' });

// Bid relationships
Bid.belongsTo(Season, { foreignKey: 'seasonId' });
Bid.belongsTo(Player, { foreignKey: 'playerId' });
Bid.belongsTo(Team, { foreignKey: 'teamId' });

// Purchase relationships
Purchase.belongsTo(Season, { foreignKey: 'seasonId' });
Purchase.belongsTo(Player, { foreignKey: 'playerId' });
Purchase.belongsTo(Team, { foreignKey: 'teamId' });

// AuctionLog relationships
AuctionLog.belongsTo(Season, { foreignKey: 'seasonId' });
AuctionLog.belongsTo(Player, { foreignKey: 'playerId' });
AuctionLog.belongsTo(Team, { foreignKey: 'teamId' });

module.exports = db;
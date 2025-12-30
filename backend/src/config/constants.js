// src/config/constants.js
module.exports = {
  // User Roles
  ROLES: {
    ADMIN: 'ADMIN',
    TEAM_OWNER: 'TEAM_OWNER',
    VIEWER: 'VIEWER'
  },

  // Player Categories
  CATEGORIES: {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
    UNSOLD: 'UNSOLD'
  },

  // Player Types
  PLAYER_TYPES: {
    BATSMAN: 'BATSMAN',
    BOWLER: 'BOWLER',
    ALL_ROUNDER: 'ALL_ROUNDER',
    WICKET_KEEPER: 'WICKET_KEEPER'
  },

  // Player Status
  PLAYER_STATUS: {
    UNSOLD: 'UNSOLD',
    SOLD: 'SOLD',
    WITHDRAWN: 'WITHDRAWN',
    ON_BID: 'ON_BID'
  },

  // Auction Status
  AUCTION_STATUS: {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED'
  },

  // Auction Settings
  DEFAULT_TIMER: 30,
  MIN_BID_INCREMENT: 5000,
  DEFAULT_PURSE: 10000000,
  MAX_SQUAD_SIZE: 15,

  // Socket Events
  SOCKET_EVENTS: {
    // Auction events
    AUCTION_STARTED: 'auction:started',
    AUCTION_PAUSED: 'auction:paused',
    AUCTION_RESUMED: 'auction:resumed',
    AUCTION_COMPLETED: 'auction:completed',
    
    // Player events
    PLAYER_ON_BID: 'player:onBid',
    PLAYER_SOLD: 'player:sold',
    PLAYER_UNSOLD: 'player:unsold',
    
    // Bid events
    BID_PLACED: 'bid:placed',
    BID_UPDATE: 'bid:update',
    BID_INVALID: 'bid:invalid',
    
    // Timer events
    TIMER_STARTED: 'timer:started',
    TIMER_TICK: 'timer:tick',
    TIMER_RESET: 'timer:reset',
    TIMER_ENDED: 'timer:ended',
    
    // Category events
    CATEGORY_CHANGED: 'category:changed',
    
    // Team events
    TEAM_PURSE_UPDATED: 'team:purse:updated'
  }
};
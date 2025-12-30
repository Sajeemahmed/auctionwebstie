// src/socket/auctionSocket.js
const { emitToAuction } = require('./socketHandler');
const { SOCKET_EVENTS } = require('../config/constants');
const logger = require('../utils/logger');

class AuctionSocket {
  // Emit auction started event
  static auctionStarted(auctionData) {
    logger.info('Emitting: Auction Started');
    emitToAuction(SOCKET_EVENTS.AUCTION_STARTED, {
      auctionId: auctionData.id,
      seasonId: auctionData.seasonId,
      currentCategory: auctionData.currentCategory,
      status: auctionData.status,
      startedAt: new Date()
    });
  }

  // Emit auction paused event
  static auctionPaused(auctionData) {
    logger.info('Emitting: Auction Paused');
    emitToAuction(SOCKET_EVENTS.AUCTION_PAUSED, {
      auctionId: auctionData.id,
      pausedAt: new Date(),
      reason: auctionData.reason || 'Paused by admin'
    });
  }

  // Emit auction resumed event
  static auctionResumed(auctionData) {
    logger.info('Emitting: Auction Resumed');
    emitToAuction(SOCKET_EVENTS.AUCTION_RESUMED, {
      auctionId: auctionData.id,
      resumedAt: new Date()
    });
  }

  // Emit auction completed event
  static auctionCompleted(auctionData) {
    logger.info('Emitting: Auction Completed');
    emitToAuction(SOCKET_EVENTS.AUCTION_COMPLETED, {
      auctionId: auctionData.id,
      completedAt: new Date(),
      stats: auctionData.stats || {}
    });
  }

  // Emit category changed event
  static categoryChanged(data) {
    logger.info(`Emitting: Category Changed from ${data.previousCategory} to ${data.newCategory}`);
    emitToAuction(SOCKET_EVENTS.CATEGORY_CHANGED, {
      previousCategory: data.previousCategory,
      newCategory: data.newCategory,
      remainingPlayers: data.remainingPlayers || 0
    });
  }
}

module.exports = AuctionSocket;
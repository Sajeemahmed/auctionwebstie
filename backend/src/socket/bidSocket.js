// src/socket/bidSocket.js
const { emitToAuction } = require('./socketHandler');
const { SOCKET_EVENTS } = require('../config/constants');
const logger = require('../utils/logger');

class BidSocket {
  // Emit player on bid event
  static playerOnBid(playerData) {
    logger.info(`Emitting: Player On Bid - ${playerData.name}`);
    emitToAuction(SOCKET_EVENTS.PLAYER_ON_BID, {
      id: playerData.id,
      playerId: playerData.id,
      formNumber: playerData.formNumber,
      name: playerData.name,
      category: playerData.category,
      playerType: playerData.playerType,
      photoUrl: playerData.photoUrl,
      photo: playerData.photoUrl,
      role: playerData.playerType,
      battingHand: playerData.battingHand,
      battingPosition: playerData.battingPosition,
      bowlingArm: playerData.bowlingArm,
      bowlingType: playerData.bowlingType,
      rating: playerData.rating,
      basePrice: playerData.basePrice,
      currentBid: playerData.basePrice,
      status: 'ON_BID'
    });
  }

  // Emit bid placed event
  static bidPlaced(bidData) {
    logger.info(`Emitting: Bid Placed - ₹${bidData.bidAmount} by Team ${bidData.teamId}`);
    emitToAuction(SOCKET_EVENTS.BID_PLACED, {
      bidId: bidData.id,
      playerId: bidData.playerId,
      teamId: bidData.teamId,
      teamName: bidData.teamName,
      bidAmount: bidData.bidAmount,
      previousBid: bidData.previousBid || 0,
      increment: bidData.bidAmount - (bidData.previousBid || 0),
      bidTime: new Date()
    });
  }

  // Emit bid update event
  static bidUpdate(data) {
    logger.info(`Emitting: Bid Update - Current: ₹${data.currentBid}`);
    emitToAuction(SOCKET_EVENTS.BID_UPDATE, {
      playerId: data.playerId,
      currentBid: data.currentBid,
      leadingTeam: data.leadingTeam,
      totalBids: data.totalBids || 0,
      bidHistory: data.bidHistory || []
    });
  }

  // Emit invalid bid event
  static bidInvalid(data) {
    logger.warn(`Emitting: Invalid Bid - Team ${data.teamId}: ${data.reason}`);
    emitToAuction(SOCKET_EVENTS.BID_INVALID, {
      teamId: data.teamId,
      reason: data.reason,
      bidAmount: data.bidAmount
    });
  }

  // Emit player sold event
  static playerSold(data) {
    logger.info(`Emitting: Player Sold - ${data.playerName} to ${data.teamName} for ₹${data.finalAmount}`);
    emitToAuction(SOCKET_EVENTS.PLAYER_SOLD, {
      playerId: data.playerId,
      formNumber: data.formNumber,
      playerName: data.playerName,
      teamId: data.teamId,
      teamName: data.teamName,
      finalAmount: data.finalAmount,
      totalBids: data.totalBids || 0,
      soldAt: new Date()
    });
  }

  // Emit player unsold event
  static playerUnsold(data) {
    logger.info(`Emitting: Player Unsold - ${data.playerName}`);
    emitToAuction(SOCKET_EVENTS.PLAYER_UNSOLD, {
      playerId: data.playerId,
      formNumber: data.formNumber,
      playerName: data.playerName,
      category: data.category,
      basePrice: data.basePrice,
      unsoldAt: new Date()
    });
  }

  // Emit team purse updated event
  static teamPurseUpdated(data) {
    logger.info(`Emitting: Team Purse Updated - Team ${data.teamId}`);
    emitToAuction(SOCKET_EVENTS.TEAM_PURSE_UPDATED, {
      teamId: data.teamId,
      teamName: data.teamName,
      remainingPurse: data.remainingPurse,
      spentAmount: data.spentAmount,
      canBid: data.canBid
    });
  }
}

module.exports = BidSocket;
// src/services/timerService.js
const { AuctionState, Player, Bid, Team, Purchase, AuctionLog } = require('../models');
const TimerSocket = require('../socket/timerSocket');
const BidSocket = require('../socket/bidSocket');
const { PLAYER_STATUS, DEFAULT_TIMER } = require('../config/constants');
const logger = require('../utils/logger');

class TimerService {
  constructor() {
    this.timers = new Map(); // Map of seasonId -> timer interval
  }

  /**
   * Start timer for current player
   */
  async startTimer(seasonId, playerId) {
    // Clear existing timer if any
    this.stopTimer(seasonId);

    const timerSeconds = DEFAULT_TIMER;
    let remainingSeconds = timerSeconds;

    // Update auction state
    await AuctionState.update(
      { timerSeconds: remainingSeconds },
      { where: { seasonId } }
    );

    // Emit timer started
    TimerSocket.timerStarted({
      playerId,
      duration: timerSeconds,
      seasonId
    });

    // Create interval to tick every second
    const interval = setInterval(async () => {
      remainingSeconds--;

      // Update auction state
      await AuctionState.update(
        { timerSeconds: remainingSeconds },
        { where: { seasonId } }
      );

      // Emit timer tick
      TimerSocket.timerTick({
        playerId,
        remainingSeconds,
        seconds: remainingSeconds
      });

      logger.info(`Timer tick: ${remainingSeconds}s remaining for player ${playerId}`);

      // Timer ended
      if (remainingSeconds <= 0) {
        this.stopTimer(seasonId);
        await this.handleTimerEnd(seasonId, playerId);
      }
    }, 1000);

    this.timers.set(seasonId, {
      interval,
      playerId,
      remainingSeconds
    });

    logger.info(`Timer started for player ${playerId} in season ${seasonId}: ${timerSeconds}s`);
  }

  /**
   * Reset timer (when new bid is placed)
   */
  async resetTimer(seasonId, playerId, resetTo = DEFAULT_TIMER) {
    const timerData = this.timers.get(seasonId);

    if (!timerData || timerData.playerId !== playerId) {
      // Start new timer
      await this.startTimer(seasonId, playerId);
      return;
    }

    // Clear existing interval
    clearInterval(timerData.interval);

    let remainingSeconds = resetTo;

    // Update auction state
    await AuctionState.update(
      { timerSeconds: remainingSeconds },
      { where: { seasonId } }
    );

    // Emit timer reset
    TimerSocket.timerReset({
      playerId,
      resetTo,
      reason: 'New bid placed'
    });

    // Create new interval
    const interval = setInterval(async () => {
      remainingSeconds--;

      // Update auction state
      await AuctionState.update(
        { timerSeconds: remainingSeconds },
        { where: { seasonId } }
      );

      // Emit timer tick
      TimerSocket.timerTick({
        playerId,
        remainingSeconds,
        seconds: remainingSeconds
      });

      // Timer ended
      if (remainingSeconds <= 0) {
        this.stopTimer(seasonId);
        await this.handleTimerEnd(seasonId, playerId);
      }
    }, 1000);

    this.timers.set(seasonId, {
      interval,
      playerId,
      remainingSeconds
    });

    logger.info(`Timer reset for player ${playerId}: ${resetTo}s`);
  }

  /**
   * Stop timer
   */
  stopTimer(seasonId) {
    const timerData = this.timers.get(seasonId);

    if (timerData) {
      clearInterval(timerData.interval);
      this.timers.delete(seasonId);
      logger.info(`Timer stopped for season ${seasonId}`);
    }
  }

  /**
   * Handle timer end - automatically sell to highest bidder or mark unsold
   */
  async handleTimerEnd(seasonId, playerId) {
    try {
      logger.info(`Timer ended for player ${playerId}`);

      const player = await Player.findByPk(playerId);

      if (!player || player.status !== PLAYER_STATUS.ON_BID) {
        logger.warn(`Player ${playerId} not on bid, skipping auto-sell`);
        return;
      }

      // Check if there are any bids
      const winningBid = await Bid.findOne({
        where: {
          seasonId,
          playerId,
          isWinning: true
        },
        include: [{ model: Team }]
      });

      if (winningBid && winningBid.Team) {
        // Player has bids - SELL to highest bidder
        await this.autoSellPlayer(seasonId, player, winningBid);
      } else {
        // No bids - Mark as UNSOLD
        await this.markPlayerUnsold(seasonId, player);
      }

      // Emit timer ended event
      TimerSocket.timerEnded({
        playerId,
        hasBids: !!winningBid
      });

    } catch (error) {
      logger.error(`Error handling timer end for player ${playerId}:`, error);
    }
  }

  /**
   * Automatically sell player to highest bidder
   */
  async autoSellPlayer(seasonId, player, winningBid) {
    const team = winningBid.Team;
    const finalAmount = winningBid.bidAmount;

    logger.info(`Auto-selling ${player.name} to ${team.name} for ₹${finalAmount}`);

    // Update player
    await player.update({
      status: PLAYER_STATUS.SOLD,
      teamId: team.id,
      soldPrice: finalAmount,
      currentBid: null
    });

    // Deduct from team purse
    const newPurse = team.purse - finalAmount;
    await team.update({
      purse: newPurse
    });

    logger.info(`Team ${team.name} purse updated: ₹${team.purse} -> ₹${newPurse}`);

    // Create purchase record
    const totalBids = await Bid.count({ where: { seasonId, playerId: player.id } });

    await Purchase.create({
      seasonId,
      playerId: player.id,
      teamId: team.id,
      finalAmount,
      basePrice: player.basePrice,
      totalBids
    });

    // Reset auction state
    await AuctionState.update(
      {
        currentPlayerId: null,
        timerSeconds: DEFAULT_TIMER
      },
      { where: { seasonId } }
    );

    // Log event
    await AuctionLog.create({
      seasonId,
      playerId: player.id,
      teamId: team.id,
      eventType: 'PLAYER_SOLD',
      eventDetails: {
        playerName: player.name,
        teamName: team.name,
        finalAmount,
        totalBids,
        autoSold: true
      }
    });

    // Emit socket events
    BidSocket.playerSold({
      playerId: player.id,
      formNumber: player.formNumber,
      playerName: player.name,
      teamId: team.id,
      teamName: team.name,
      finalAmount,
      totalBids
    });

    BidSocket.teamPurseUpdated({
      teamId: team.id,
      teamName: team.name,
      remainingPurse: newPurse,
      spentAmount: finalAmount,
      canBid: newPurse > 0
    });

    logger.info(`✅ Player ${player.name} auto-sold to ${team.name} for ₹${finalAmount}`);
  }

  /**
   * Mark player as unsold
   */
  async markPlayerUnsold(seasonId, player) {
    logger.info(`Marking ${player.name} as UNSOLD (no bids)`);

    await player.update({
      status: PLAYER_STATUS.UNSOLD,
      currentBid: null
    });

    // Reset auction state
    await AuctionState.update(
      {
        currentPlayerId: null,
        timerSeconds: DEFAULT_TIMER
      },
      { where: { seasonId } }
    );

    // Log event
    await AuctionLog.create({
      seasonId,
      playerId: player.id,
      eventType: 'PLAYER_UNSOLD',
      eventDetails: {
        playerName: player.name,
        basePrice: player.basePrice,
        reason: 'No bids received'
      }
    });

    // Emit socket event
    BidSocket.playerUnsold({
      playerId: player.id,
      formNumber: player.formNumber,
      playerName: player.name,
      category: player.category,
      basePrice: player.basePrice
    });

    logger.info(`✅ Player ${player.name} marked as UNSOLD`);
  }

  /**
   * Get remaining time for a season
   */
  getRemainingTime(seasonId) {
    const timerData = this.timers.get(seasonId);
    return timerData ? timerData.remainingSeconds : 0;
  }

  /**
   * Check if timer is active
   */
  isTimerActive(seasonId) {
    return this.timers.has(seasonId);
  }
}

// Export singleton instance
const timerService = new TimerService();
module.exports = timerService;

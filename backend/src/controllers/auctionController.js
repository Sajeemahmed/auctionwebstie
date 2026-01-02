// src/controllers/auctionController.js
const { Player, Team, Bid, AuctionState, AuctionLog, Purchase, Season } = require('../models');
const logger = require('../utils/logger');
const response = require('../utils/response');
const BidSocket = require('../socket/bidSocket');
const TimerSocket = require('../socket/timerSocket');
const AuctionSocket = require('../socket/auctionSocket');
const timerService = require('../services/timerService');
const { AUCTION_STATUS, PLAYER_STATUS, MIN_BID_INCREMENT, DEFAULT_TIMER } = require('../config/constants');

/**
 * Get current auction state
 * GET /api/auction/state
 */
const getAuctionState = async (req, res, next) => {
  try {
    const { seasonId } = req.query;

    if (!seasonId) {
      return response.badRequest(res, 'Season ID is required');
    }

    let auctionState = await AuctionState.findOne({
      where: { seasonId },
      include: [
        {
          model: Player,
          as: 'currentPlayer',
          required: false
        }
      ]
    });

    if (!auctionState) {
      // Create default auction state
      auctionState = await AuctionState.create({
        seasonId,
        status: AUCTION_STATUS.PENDING,
        currentCategory: 'A',
        timerSeconds: DEFAULT_TIMER,
        minBidIncrement: MIN_BID_INCREMENT
      });
    }

    return response.success(res, auctionState, 'Auction state retrieved successfully');
  } catch (error) {
    logger.error('Error fetching auction state:', error);
    next(error);
  }
};

/**
 * Start auction
 * POST /api/auction/start
 */
const startAuction = async (req, res, next) => {
  try {
    const { seasonId } = req.body;

    if (!seasonId) {
      return response.badRequest(res, 'Season ID is required');
    }

    const auctionState = await AuctionState.findOne({ where: { seasonId } });

    if (!auctionState) {
      return response.notFound(res, 'Auction state not found');
    }

    if (auctionState.status === AUCTION_STATUS.ACTIVE) {
      return response.badRequest(res, 'Auction is already running');
    }

    await auctionState.update({
      status: AUCTION_STATUS.ACTIVE,
      startedAt: new Date()
    });

    // Log auction start
    await AuctionLog.create({
      seasonId,
      eventType: 'AUCTION_STARTED',
      eventDetails: { startedAt: new Date() }
    });

    // Emit socket event
    AuctionSocket.auctionStarted({ seasonId, startedAt: new Date() });

    logger.info(`Auction started for season ${seasonId}`);

    return response.success(res, auctionState, 'Auction started successfully');
  } catch (error) {
    logger.error('Error starting auction:', error);
    next(error);
  }
};

/**
 * Pause auction
 * POST /api/auction/pause
 */
const pauseAuction = async (req, res, next) => {
  try {
    const { seasonId } = req.body;

    const auctionState = await AuctionState.findOne({ where: { seasonId } });

    if (!auctionState) {
      return response.notFound(res, 'Auction state not found');
    }

    await auctionState.update({
      status: AUCTION_STATUS.PAUSED,
      pausedAt: new Date()
    });

    AuctionSocket.auctionPaused({ seasonId, pausedAt: new Date() });

    return response.success(res, auctionState, 'Auction paused successfully');
  } catch (error) {
    logger.error('Error pausing auction:', error);
    next(error);
  }
};

/**
 * Resume auction
 * POST /api/auction/resume
 */
const resumeAuction = async (req, res, next) => {
  try {
    const { seasonId } = req.body;

    const auctionState = await AuctionState.findOne({ where: { seasonId } });

    if (!auctionState) {
      return response.notFound(res, 'Auction state not found');
    }

    await auctionState.update({
      status: AUCTION_STATUS.ACTIVE,
      pausedAt: null
    });

    AuctionSocket.auctionResumed({ seasonId });

    return response.success(res, auctionState, 'Auction resumed successfully');
  } catch (error) {
    logger.error('Error resuming auction:', error);
    next(error);
  }
};

/**
 * Bring player to bid
 * POST /api/auction/player-on-bid
 */
const bringPlayerToBid = async (req, res, next) => {
  try {
    const { seasonId, playerId } = req.body;

    if (!seasonId || !playerId) {
      return response.badRequest(res, 'Season ID and Player ID are required');
    }

    const player = await Player.findByPk(playerId);

    if (!player) {
      return response.notFound(res, 'Player not found');
    }

    if (player.status === PLAYER_STATUS.SOLD) {
      return response.badRequest(res, 'Player is already sold');
    }

    // Update auction state (create if doesn't exist)
    let auctionState = await AuctionState.findOne({ where: { seasonId } });

    if (!auctionState) {
      // Create auction state if it doesn't exist
      auctionState = await AuctionState.create({
        seasonId,
        status: AUCTION_STATUS.ACTIVE,
        currentPlayerId: playerId,
        currentCategory: player.category,
        timerSeconds: DEFAULT_TIMER,
        minBidIncrement: MIN_BID_INCREMENT
      });
    } else {
      await auctionState.update({
        currentPlayerId: playerId,
        currentCategory: player.category,
        timerSeconds: DEFAULT_TIMER
      });
    }

    // Update player status
    await player.update({
      status: PLAYER_STATUS.ON_BID,
      currentBid: player.basePrice
    });

    // Log event
    await AuctionLog.create({
      seasonId,
      playerId,
      eventType: 'PLAYER_ON_BID',
      eventDetails: {
        playerName: player.name,
        basePrice: player.basePrice
      }
    });

    // Emit socket event
    BidSocket.playerOnBid(player);

    // Start timer using timer service (will auto-sell when timer ends)
    await timerService.startTimer(seasonId, playerId);

    logger.info(`Player ${player.name} brought to bid with auto-sell timer`);

    return response.success(res, {
      player,
      auctionState
    }, 'Player brought to bid successfully');
  } catch (error) {
    logger.error('Error bringing player to bid:', error);
    next(error);
  }
};

/**
 * Place bid
 * POST /api/auction/bid
 */
const placeBid = async (req, res, next) => {
  try {
    const { seasonId, playerId, teamId, bidAmount } = req.body;

    // Validation
    if (!seasonId || !playerId || !teamId || !bidAmount) {
      return response.badRequest(res, 'All fields are required');
    }

    const player = await Player.findByPk(playerId);
    const team = await Team.findByPk(teamId);

    if (!player) {
      return response.notFound(res, 'Player not found');
    }

    if (!team) {
      return response.notFound(res, 'Team not found');
    }

    if (player.status !== PLAYER_STATUS.ON_BID) {
      return response.badRequest(res, 'Player is not currently on bid');
    }

    // Check if bid amount is valid
    const currentBid = player.currentBid || player.basePrice;
    if (bidAmount <= currentBid) {
      BidSocket.bidInvalid({
        teamId,
        reason: 'Bid amount must be higher than current bid',
        bidAmount
      });
      return response.badRequest(res, 'Bid amount must be higher than current bid');
    }

    if (bidAmount - currentBid < MIN_BID_INCREMENT) {
      BidSocket.bidInvalid({
        teamId,
        reason: `Minimum bid increment is ₹${MIN_BID_INCREMENT}`,
        bidAmount
      });
      return response.badRequest(res, `Minimum bid increment is ₹${MIN_BID_INCREMENT}`);
    }

    // Check team purse
    if (bidAmount > team.initial_purse) {
      BidSocket.bidInvalid({
        teamId,
        reason: 'Insufficient purse balance',
        bidAmount
      });
      return response.badRequest(res, 'Insufficient purse balance');
    }

    // Mark previous bids as not winning
    await Bid.update(
      { isWinning: false },
      {
        where: {
          seasonId,
          playerId,
          isWinning: true
        }
      }
    );

    // Create new bid
    const bid = await Bid.create({
      seasonId,
      playerId,
      teamId,
      bidAmount,
      isWinning: true
    });

    // Update player's current bid
    await player.update({ currentBid: bidAmount });

    // Get bid history
    const bidHistory = await Bid.findAll({
      where: { seasonId, playerId },
      include: [{ model: Team, attributes: ['id', 'name', 'shortName'] }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Log event
    await AuctionLog.create({
      seasonId,
      playerId,
      teamId,
      eventType: 'BID_PLACED',
      eventDetails: {
        bidAmount,
        teamName: team.name
      }
    });

    // Reset timer (new bid extends the timer)
    await timerService.resetTimer(seasonId, playerId, 10); // Reset to 10 seconds on new bid

    // Emit socket events
    BidSocket.bidPlaced({
      id: bid.id,
      playerId,
      teamId,
      teamName: team.name,
      bidAmount,
      previousBid: currentBid
    });

    BidSocket.bidUpdate({
      playerId,
      currentBid: bidAmount,
      leadingTeam: {
        id: team.id,
        name: team.name,
        shortName: team.shortName
      },
      totalBids: bidHistory.length,
      bidHistory: bidHistory.map(b => ({
        teamName: b.Team.name,
        amount: b.bidAmount,
        timestamp: b.createdAt
      }))
    });

    logger.info(`Bid placed: ₹${bidAmount} by ${team.name} for ${player.name} - Timer reset to 10s`);

    return response.success(res, {
      bid,
      currentBid: bidAmount,
      leadingTeam: team
    }, 'Bid placed successfully');
  } catch (error) {
    logger.error('Error placing bid:', error);
    next(error);
  }
};

/**
 * Mark player as sold
 * POST /api/auction/sold
 */
const markPlayerSold = async (req, res, next) => {
  try {
    const { seasonId, playerId } = req.body;

    const player = await Player.findByPk(playerId);

    if (!player) {
      return response.notFound(res, 'Player not found');
    }

    // Get winning bid
    const winningBid = await Bid.findOne({
      where: {
        seasonId,
        playerId,
        isWinning: true
      },
      include: [{ model: Team }]
    });

    if (!winningBid) {
      return response.badRequest(res, 'No bids found for this player');
    }

    const team = winningBid.Team;
    const finalAmount = winningBid.bidAmount;

    // Update player
    await player.update({
      status: PLAYER_STATUS.SOLD,
      teamId: team.id,
      soldPrice: finalAmount
    });

    // Update team purse
    await team.update({
      purse: team.initial_purse - finalAmount
    });

    // Create purchase record
    const totalBids = await Bid.count({ where: { seasonId, playerId } });

    await Purchase.create({
      seasonId,
      playerId,
      teamId: team.id,
      finalAmount,
      basePrice: player.basePrice,
      totalBids
    });

    // Stop timer
    timerService.stopTimer(seasonId);

    // Reset auction state
    const auctionState = await AuctionState.findOne({ where: { seasonId } });
    await auctionState.update({
      currentPlayerId: null,
      timerSeconds: DEFAULT_TIMER
    });

    // Log event
    await AuctionLog.create({
      seasonId,
      playerId,
      teamId: team.id,
      eventType: 'PLAYER_SOLD',
      eventDetails: {
        playerName: player.name,
        teamName: team.name,
        finalAmount,
        totalBids,
        manualSold: true
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
      remainingPurse: team.purse,
      spentAmount: finalAmount,
      canBid: team.purse > 0
    });

    logger.info(`Player ${player.name} manually sold to ${team.name} for ₹${finalAmount}`);

    return response.success(res, {
      player,
      team,
      finalAmount,
      totalBids
    }, 'Player marked as sold successfully');
  } catch (error) {
    logger.error('Error marking player as sold:', error);
    next(error);
  }
};

/**
 * Mark player as unsold
 * POST /api/auction/unsold
 */
const markPlayerUnsold = async (req, res, next) => {
  try {
    const { seasonId, playerId } = req.body;

    const player = await Player.findByPk(playerId);

    if (!player) {
      return response.notFound(res, 'Player not found');
    }

    // Stop timer
    timerService.stopTimer(seasonId);

    await player.update({
      status: PLAYER_STATUS.UNSOLD,
      currentBid: null
    });

    // Reset auction state
    const auctionState = await AuctionState.findOne({ where: { seasonId } });
    await auctionState.update({
      currentPlayerId: null,
      timerSeconds: DEFAULT_TIMER
    });

    // Log event
    await AuctionLog.create({
      seasonId,
      playerId,
      eventType: 'PLAYER_UNSOLD',
      eventDetails: {
        playerName: player.name,
        basePrice: player.basePrice,
        manualUnsold: true
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

    logger.info(`Player ${player.name} manually marked as unsold`);

    return response.success(res, player, 'Player marked as unsold successfully');
  } catch (error) {
    logger.error('Error marking player as unsold:', error);
    next(error);
  }
};

/**
 * Get bid history for a player
 * GET /api/auction/bids/:playerId
 */
const getBidHistory = async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const { seasonId } = req.query;

    const bids = await Bid.findAll({
      where: { playerId, seasonId },
      include: [
        {
          model: Team,
          attributes: ['id', 'name', 'shortName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return response.success(res, bids, 'Bid history retrieved successfully');
  } catch (error) {
    logger.error('Error fetching bid history:', error);
    next(error);
  }
};

module.exports = {
  getAuctionState,
  startAuction,
  pauseAuction,
  resumeAuction,
  bringPlayerToBid,
  placeBid,
  markPlayerSold,
  markPlayerUnsold,
  getBidHistory
};

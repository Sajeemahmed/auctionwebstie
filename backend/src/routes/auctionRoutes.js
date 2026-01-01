// src/routes/auctionRoutes.js
const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

/**
 * Auction Routes
 */

// Get auction state
router.get('/state', auctionController.getAuctionState);

// Start auction
router.post('/start', auctionController.startAuction);

// Pause auction
router.post('/pause', auctionController.pauseAuction);

// Resume auction
router.post('/resume', auctionController.resumeAuction);

// Bring player to bid
router.post('/player-on-bid', auctionController.bringPlayerToBid);

// Place bid
router.post('/bid', auctionController.placeBid);

// Mark player as sold
router.post('/sold', auctionController.markPlayerSold);

// Mark player as unsold
router.post('/unsold', auctionController.markPlayerUnsold);

// Get bid history for a player
router.get('/bids/:playerId', auctionController.getBidHistory);

module.exports = router;

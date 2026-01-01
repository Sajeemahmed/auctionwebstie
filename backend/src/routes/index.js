// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const teamRoutes = require('./teamRoutes');
const playerRoutes = require('./playerRoutes');
const auctionRoutes = require('./auctionRoutes');
const authRoutes = require('./authRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/teams', teamRoutes);
router.use('/players', playerRoutes);
router.use('/auction', auctionRoutes);
// router.use('/auth', authRoutes);

module.exports = router;
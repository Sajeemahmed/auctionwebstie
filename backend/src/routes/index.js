// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules (will create these next)
// const authRoutes = require('./authRoutes');
// const teamRoutes = require('./teamRoutes');
// const playerRoutes = require('./playerRoutes');
// const auctionRoutes = require('./auctionRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
// router.use('/auth', authRoutes);
// router.use('/teams', teamRoutes);
// router.use('/players', playerRoutes);
// router.use('/auction', auctionRoutes);

module.exports = router;
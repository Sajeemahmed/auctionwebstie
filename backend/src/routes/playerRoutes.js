// src/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { uploadPlayerPhoto, uploadExcel, uploadPlayersWithPhotos } = require('../middleware/uploadMiddleware');

/**
 * Player Routes
 */

// Get player statistics - MUST be before /:id route
router.get('/stats', playerController.getPlayerStats);

// Get all players
router.get('/', playerController.getAllPlayers);

// Get player by ID
router.get('/:id', playerController.getPlayerById);

// Create a single player
router.post('/', playerController.createPlayer);

// Bulk upload players from Excel
router.post('/bulk-upload', uploadExcel, playerController.bulkUploadPlayers);
// Bulk upload with photos (CSV + Photos)  -- NEW
router.post('/bulk-upload-with-photos', uploadPlayersWithPhotos, playerController.bulkUploadPlayersWithPhotos);

// Update player
router.put('/:id', playerController.updatePlayer);

// Upload player photo
router.patch('/:id/photo', uploadPlayerPhoto, playerController.uploadPlayerPhoto);

// Delete player
router.delete('/:id', playerController.deletePlayer);

module.exports = router;
// src/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { uploadTeamLogo } = require('../middleware/uploadMiddleware');

// Get all teams
router.get('/', teamController.getAllTeams);

// Get teams by season - MUST be before /:id
router.get('/season/:seasonId', teamController.getTeamsBySeason);

// Get team stats - MUST be before /:id
router.get('/:id/stats', teamController.getTeamStats);

// Get team by ID
router.get('/:id', teamController.getTeamById);

// Create team
router.post('/', teamController.createTeam);

// Update team
router.put('/:id', teamController.updateTeam);

// Update team purse
router.patch('/:id/purse', teamController.updateTeamPurse);

// Upload team logo
router.patch('/:id/logo', uploadTeamLogo, teamController.updateTeamLogo);

// Sponsor management
router.post('/:id/sponsors', teamController.addSponsor);
router.delete('/:id/sponsors/:sponsorId', teamController.removeSponsor);

// Delete team
router.delete('/:id', teamController.deleteTeam);

module.exports = router;
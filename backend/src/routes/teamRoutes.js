// src/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const validationMiddleware = require('../middleware/validationMiddleware');

/**
 * Team Routes
 */

// Create a new team
router.post('/', teamController.createTeam);

// Get all teams
router.get('/', teamController.getAllTeams);

// Get teams by season - MUST be before /:id to avoid route conflicts
router.get('/season/:seasonId', teamController.getTeamsBySeason);

// Get team by ID
router.get('/:id', teamController.getTeamById);

// Update team
router.put('/:id', teamController.updateTeam);

// Update team purse - MUST be before DELETE /:id
router.patch('/:id/purse', teamController.updateTeamPurse);

// Delete team
router.delete('/:id', teamController.deleteTeam);

module.exports = router;

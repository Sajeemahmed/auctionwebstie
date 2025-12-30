// src/controllers/teamController.js
const { Team, Season, User } = require('../models');
const logger = require('../utils/logger');
const response = require('../utils/response');

/**
 * Create a new team
 * POST /api/teams
 */
const createTeam = async (req, res, next) => {
  try {
    const { 
      name, 
      shortName, 
      seasonId, 
      ownerId, 
      ownerName,      // NEW
      tagline,        // NEW
      logoImage,      // NEW
      sponsors,       // NEW
      initialPurse, 
      logoUrl 
    } = req.body;

    // Validation
    if (!name || !seasonId) {
      return response.error(res, 'Team name and season ID are required', 400);
    }

    // Validate initial purse
    if (initialPurse && (isNaN(initialPurse) || initialPurse <= 0)) {
      return response.error(res, 'Initial purse must be a positive number', 400);
    }

    // Check if season exists
    const season = await Season.findByPk(seasonId);
    if (!season) {
      return response.error(res, 'Season not found', 404);
    }

    // If ownerId is provided, fetch owner name from users table
    let resolvedOwnerName = ownerName;
    if (ownerId && !ownerName) {
      const owner = await User.findByPk(ownerId);
      if (owner) {
        resolvedOwnerName = owner.username;
      }
    }

    // Check if team name already exists in this season
    const existingTeam = await Team.findOne({
      where: {
        name: name,
        seasonId: seasonId
      }
    });

    if (existingTeam) {
      return response.error(res, 'Team with this name already exists in this season', 409);
    }

    const purse = initialPurse || 10000000;

    // Parse sponsors if it's a string
    let parsedSponsors = sponsors;
    if (typeof sponsors === 'string') {
      try {
        parsedSponsors = JSON.parse(sponsors);
      } catch (e) {
        parsedSponsors = [];
      }
    }

    // Create team
    const team = await Team.create({
      name,
      shortName: shortName || name.substring(0, 3).toUpperCase(),
      seasonId,
      ownerId: ownerId || null,
      ownerName: resolvedOwnerName || null,  // NEW
      tagline: tagline || null,              // NEW
      logoImage: logoImage || null,          // NEW
      sponsors: parsedSponsors || [],        // NEW
      initialPurse: purse,
      remainingPurse: purse,
      maxSquadSize: 15,
      currentSquadSize: 0,
      logoUrl: logoUrl || null,
      isActive: true
    });

    logger.info(`Team created: ${team.name} (ID: ${team.id}) - Initial Purse: ₹${purse}`);

    return response.success(
      res,
      team,
      'Team created successfully',
      201
    );
  } catch (error) {
    logger.error('Error creating team:', error);
    next(error);
  }
};

/**
 * Get all teams
 * GET /api/teams
 */
const getAllTeams = async (req, res, next) => {
  try {
    const { seasonId } = req.query;

    const where = {};
    if (seasonId) where.seasonId = parseInt(seasonId);

    const teams = await Team.findAll({
      where,
      order: [['name', 'ASC']],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email'],
          required: false
        },
        {
          model: Season,
          attributes: ['id', 'seasonNumber', 'seasonName', 'year'],
          required: false
        }
      ]
    });

    return response.success(res, teams, 'Teams retrieved successfully');
  } catch (error) {
    logger.error('Error fetching teams:', error);
    next(error);
  }
};

/**
 * Get team by ID
 * GET /api/teams/:id
 */
const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email'],
          required: false
        },
        {
          model: Season,
          attributes: ['id', 'seasonNumber', 'seasonName', 'year'],
          required: false
        }
      ]
    });

    if (!team) {
      return response.error(res, 'Team not found', 404);
    }

    return response.success(res, team, 'Team retrieved successfully');
  } catch (error) {
    logger.error('Error fetching team:', error);
    next(error);
  }
};

/**
 * Update team
 * PUT /api/teams/:id
 */
const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      shortName, 
      ownerId, 
      ownerName,      // NEW
      tagline,        // NEW
      logoImage,      // NEW
      sponsors,       // NEW
      logoUrl, 
      isActive 
    } = req.body;

    const team = await Team.findByPk(id);

    if (!team) {
      return response.error(res, 'Team not found', 404);
    }

    // Check if new name already exists (if name is being updated)
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({
        where: {
          name: name,
          seasonId: team.seasonId
        }
      });

      if (existingTeam) {
        return response.error(res, 'Team with this name already exists in this season', 409);
      }
    }

    // If ownerId is being updated, fetch the new owner's name
    let resolvedOwnerName = ownerName;
    if (ownerId && !ownerName) {
      const owner = await User.findByPk(ownerId);
      if (owner) {
        resolvedOwnerName = owner.username;
      }
    }

    // Parse sponsors if it's a string
    let parsedSponsors = sponsors;
    if (typeof sponsors === 'string') {
      try {
        parsedSponsors = JSON.parse(sponsors);
      } catch (e) {
        parsedSponsors = sponsors;
      }
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (shortName !== undefined) updateData.shortName = shortName;
    if (ownerId !== undefined) updateData.ownerId = ownerId;
    if (resolvedOwnerName !== undefined) updateData.ownerName = resolvedOwnerName;  // NEW
    if (tagline !== undefined) updateData.tagline = tagline;                        // NEW
    if (logoImage !== undefined) updateData.logoImage = logoImage;                  // NEW
    if (parsedSponsors !== undefined) updateData.sponsors = parsedSponsors;         // NEW
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return response.error(res, 'No fields to update', 400);
    }

    // Update team
    await team.update(updateData);

    // Fetch updated team with relations
    const updatedTeam = await Team.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    logger.info(`Team updated: ${updatedTeam.name} (ID: ${updatedTeam.id})`);

    return response.success(res, updatedTeam, 'Team updated successfully');
  } catch (error) {
    logger.error('Error updating team:', error);
    next(error);
  }
};

/**
 * Delete team (hard delete)
 * DELETE /api/teams/:id
 */
const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id);

    if (!team) {
      return response.error(res, 'Team not found', 404);
    }

    const teamName = team.name;
    const teamId = team.id;

    logger.info(`Deleting team: ${teamName} (ID: ${teamId})`);

    // Hard delete - permanently remove from database
    await team.destroy({ force: true });

    logger.info(`Team permanently deleted: ${teamName} (ID: ${teamId})`);
    
    return response.success(res, 
      { 
        id: teamId, 
        name: teamName,
        message: 'Team permanently deleted from database'
      }, 
      'Team deleted successfully'
    );
  } catch (error) {
    logger.error('Error deleting team:', error);
    next(error);
  }
};

/**
 * Get teams by season
 * GET /api/teams/season/:seasonId
 */
const getTeamsBySeason = async (req, res, next) => {
  try {
    const { seasonId } = req.params;

    const season = await Season.findByPk(seasonId);
    if (!season) {
      return response.error(res, 'Season not found', 404);
    }

    const teams = await Team.findAll({
      where: {
        seasonId: seasonId,
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    return response.success(res, teams, 'Teams retrieved successfully');
  } catch (error) {
    logger.error('Error fetching teams by season:', error);
    next(error);
  }
};

/**
 * Update team purse
 * PATCH /api/teams/:id/purse
 */
const updateTeamPurse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remainingPurse } = req.body;

    if (remainingPurse === undefined || remainingPurse < 0) {
      return response.error(res, 'Valid remaining purse is required', 400);
    }

    const team = await Team.findByPk(id);

    if (!team) {
      return response.error(res, 'Team not found', 404);
    }

    await team.update({ remainingPurse });

    logger.info(`Team purse updated: ${team.name} - Remaining: ₹${remainingPurse}`);

    return response.success(res, 
      { 
        id: team.id, 
        name: team.name, 
        remainingPurse: team.remainingPurse 
      }, 
      'Team purse updated successfully'
    );
  } catch (error) {
    logger.error('Error updating team purse:', error);
    next(error);
  }
};

/**
 * Update team logo
 * PATCH /api/teams/:id/logo
 */
const updateTeamLogo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id);

    if (!team) {
      return response.error(res, 'Team not found', 404);
    }

    // Check if file was uploaded
    if (!req.file) {
      return response.error(res, 'No logo file uploaded', 400);
    }

    const logoPath = `/uploads/teams/${req.file.filename}`;

    await team.update({ 
      logoImage: logoPath,
      logoUrl: logoPath  // Also update logoUrl for backward compatibility
    });

    logger.info(`Team logo updated: ${team.name} - Logo: ${logoPath}`);

    return response.success(res, 
      { 
        id: team.id, 
        name: team.name, 
        logoImage: team.logoImage,
        logoUrl: team.logoUrl
      }, 
      'Team logo updated successfully'
    );
  } catch (error) {
    logger.error('Error updating team logo:', error);
    next(error);
  }
};

/**
 * Add sponsor to team
 * POST /api/teams/:id/sponsors
 */
const addSponsor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name: sponsorName, logo, amount } = req.body;

    if (!sponsorName) {
      return response.error(res, 'Sponsor name is required', 400);
    }

    const team = await Team.findByPk(id);

    if (!team) {
      return response.error(res, 'Team not found', 404);
    }

    // Get current sponsors
    const currentSponsors = team.sponsors || [];

    // Add new sponsor
    const newSponsor = {
      id: Date.now(),
      name: sponsorName,
      logo: logo || null,
      amount: amount || 0,
      addedAt: new Date()
    };

    currentSponsors.push(newSponsor);

    await team.update({ sponsors: currentSponsors });

    logger.info(`Sponsor added to team ${team.name}: ${sponsorName}`);

    return response.success(res, 
      { 
        id: team.id, 
        name: team.name, 
        sponsors: team.sponsors 
      }, 
      'Sponsor added successfully'
    );
  } catch (error) {
    logger.error('Error adding sponsor:', error);
    next(error);
  }
};

/**
 * Remove sponsor from team
 * DELETE /api/teams/:id/sponsors/:sponsorId
 */
const removeSponsor = async (req, res, next) => {
  try {
    const { id, sponsorId } = req.params;

    const team = await Team.findByPk(id);

    if (!team) {
      return response.error(res, 'Team not found', 404);
    }

    // Get current sponsors
    const currentSponsors = team.sponsors || [];

    // Remove sponsor by ID
    const updatedSponsors = currentSponsors.filter(
      sponsor => sponsor.id !== parseInt(sponsorId)
    );

    if (currentSponsors.length === updatedSponsors.length) {
      return response.error(res, 'Sponsor not found', 404);
    }

    await team.update({ sponsors: updatedSponsors });

    logger.info(`Sponsor removed from team ${team.name}: ID ${sponsorId}`);

    return response.success(res, 
      { 
        id: team.id, 
        name: team.name, 
        sponsors: team.sponsors 
      }, 
      'Sponsor removed successfully'
    );
  } catch (error) {
    logger.error('Error removing sponsor:', error);
    next(error);
  }
};

/**
 * Get team statistics
 * GET /api/teams/:id/stats
 */
const getTeamStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!team) {
      return response.error(res, 'Team not found', 404);
    }

    // Calculate statistics
    const stats = {
      teamId: team.id,
      teamName: team.name,
      shortName: team.shortName,
      ownerName: team.ownerName,
      tagline: team.tagline,
      initialPurse: team.initialPurse,
      remainingPurse: team.remainingPurse,
      spentAmount: team.initialPurse - team.remainingPurse,
      currentSquadSize: team.currentSquadSize,
      maxSquadSize: team.maxSquadSize,
      remainingSlots: team.maxSquadSize - team.currentSquadSize,
      sponsorsCount: (team.sponsors || []).length,
      sponsors: team.sponsors,
      isActive: team.isActive,
      owner: team.owner
    };

    return response.success(res, stats, 'Team statistics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching team stats:', error);
    next(error);
  }
};

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamsBySeason,
  updateTeamPurse,
  updateTeamLogo,      // NEW
  addSponsor,          // NEW
  removeSponsor,       // NEW
  getTeamStats         // NEW
};
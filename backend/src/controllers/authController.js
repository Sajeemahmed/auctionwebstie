// src/controllers/authController.js
const { User, Team } = require('../models');
const logger = require('../utils/logger');
const response = require('../utils/response');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, role, teamId } = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      return response.badRequest(res, 'Username, email, password, and role are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { username }
    });

    if (existingUser) {
      return response.conflict(res, 'Username already exists');
    }

    const existingEmail = await User.findOne({
      where: { email }
    });

    if (existingEmail) {
      return response.conflict(res, 'Email already exists');
    }

    // If role is TEAM_OWNER, validate teamId
    if (role === 'TEAM_OWNER') {
      if (!teamId) {
        return response.badRequest(res, 'Team ID is required for team owners');
      }

      const team = await Team.findByPk(teamId);
      if (!team) {
        return response.notFound(res, 'Team not found');
      }

      // Check if team already has an owner
      const existingOwner = await User.findOne({
        where: { teamId, role: 'TEAM_OWNER' }
      });

      if (existingOwner) {
        return response.conflict(res, 'This team already has an owner');
      }
    }

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash: password, // Will be hashed by model hook
      role,
      teamId: role === 'TEAM_OWNER' ? teamId : null,
      seasonId: 1 // Default season
    });

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        teamId: user.teamId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info(`New user registered: ${user.username} (${user.role})`);

    return response.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId
      }
    }, 'User registered successfully', 201);

  } catch (error) {
    logger.error('Error in user registration:', error);
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return response.badRequest(res, 'Username and password are required');
    }

    // Find user
    const user = await User.findOne({
      where: { username },
      include: [{
        model: Team,
        as: 'team',
        attributes: ['id', 'name', 'shortName', 'purse']
      }]
    });

    if (!user) {
      return response.unauthorized(res, 'Invalid username or password');
    }

    // Check if user is active
    if (!user.isActive) {
      return response.unauthorized(res, 'Account is inactive');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return response.unauthorized(res, 'Invalid username or password');
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        teamId: user.teamId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info(`User logged in: ${user.username} (${user.role})`);

    return response.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        team: user.team
      }
    }, 'Login successful');

  } catch (error) {
    logger.error('Error in user login:', error);
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware

    const user = await User.findByPk(userId, {
      include: [{
        model: Team,
        as: 'team',
        attributes: ['id', 'name', 'shortName', 'purse']
      }],
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return response.notFound(res, 'User not found');
    }

    return response.success(res, user, 'Profile retrieved successfully');

  } catch (error) {
    logger.error('Error fetching user profile:', error);
    next(error);
  }
};

/**
 * Get all available teams for registration
 * GET /api/auth/teams
 */
const getAvailableTeams = async (req, res, next) => {
  try {
    const teams = await Team.findAll({
      attributes: ['id', 'name', 'shortName'],
      order: [['name', 'ASC']]
    });

    // Check which teams already have owners
    const teamsWithOwners = await User.findAll({
      where: { role: 'TEAM_OWNER' },
      attributes: ['teamId']
    });

    const ownerTeamIds = teamsWithOwners.map(u => u.teamId);

    const availableTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      hasOwner: ownerTeamIds.includes(team.id)
    }));

    return response.success(res, availableTeams, 'Teams retrieved successfully');

  } catch (error) {
    logger.error('Error fetching teams:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAvailableTeams
};

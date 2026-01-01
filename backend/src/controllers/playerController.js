// src/controllers/playerController.js
const { Player, Season, Team } = require('../models');
const logger = require('../utils/logger');
const response = require('../utils/response');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Get all players
 * GET /api/players
 */
const getAllPlayers = async (req, res, next) => {
  try {
    const { seasonId, category, status, teamId } = req.query;

    const where = {};
    if (seasonId) where.seasonId = parseInt(seasonId);
    if (category) where.category = category;
    if (status) where.status = status;
    if (teamId) where.teamId = parseInt(teamId);

    const players = await Player.findAll({
      where,
      order: [['formNumber', 'ASC']],
      include: [
        {
          model: Team,
          attributes: ['id', 'name', 'shortName'],
          required: false
        },
        {
          model: Season,
          attributes: ['id', 'seasonNumber', 'seasonName'],
          required: false
        }
      ]
    });

    return response.success(res, players, 'Players retrieved successfully');
  } catch (error) {
    logger.error('Error fetching players:', error);
    next(error);
  }
};

/**
 * Get player by ID
 * GET /api/players/:id
 */
const getPlayerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const player = await Player.findByPk(id, {
      include: [
        {
          model: Team,
          attributes: ['id', 'name', 'shortName'],
          required: false
        },
        {
          model: Season,
          attributes: ['id', 'seasonNumber', 'seasonName'],
          required: false
        }
      ]
    });

    if (!player) {
      return response.notFound(res, 'Player not found');
    }

    return response.success(res, player, 'Player retrieved successfully');
  } catch (error) {
    logger.error('Error fetching player:', error);
    next(error);
  }
};

/**
 * Create a single player
 * POST /api/players
 */
const createPlayer = async (req, res, next) => {
  try {
    const {
      seasonId,
      formNumber,
      name,
      dateOfBirth,
      category,
      playerType,
      battingHand,
      battingPosition,
      bowlingArm,
      bowlingType,
      rating,
      basePrice,
      photoUrl
    } = req.body;

    // Validation
    if (!seasonId || !formNumber || !name || !category || !playerType) {
      return response.badRequest(res, 'Season ID, form number, name, category, and player type are required');
    }

    // Check if season exists
    const season = await Season.findByPk(seasonId);
    if (!season) {
      return response.notFound(res, 'Season not found');
    }

    // Check if form number already exists in this season
    const existingPlayer = await Player.findOne({
      where: {
        seasonId,
        formNumber
      }
    });

    if (existingPlayer) {
      return response.conflict(res, 'Player with this form number already exists in this season');
    }

    // Calculate age if DOB provided
    let age = null;
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
    }

    // Create player
    const player = await Player.create({
      seasonId,
      formNumber,
      name,
      photoUrl: photoUrl || null,
      dateOfBirth: dateOfBirth || null,
      age,
      category,
      playerType,
      battingHand: battingHand || null,
      battingPosition: battingPosition || null,
      bowlingArm: bowlingArm || null,
      bowlingType: bowlingType || null,
      rating: rating || 0,
      basePrice: basePrice || 50000,
      status: 'UNSOLD'
    });

    logger.info(`Player created: ${player.name} (Form: ${player.formNumber})`);

    return response.success(res, player, 'Player created successfully', 201);
  } catch (error) {
    logger.error('Error creating player:', error);
    next(error);
  }
};

/**
 * Bulk upload players from Excel
 * POST /api/players/bulk-upload
 */
const bulkUploadPlayers = async (req, res, next) => {
  try {
    if (!req.file) {
      return response.badRequest(res, 'Please upload an Excel file');
    }

    const { seasonId } = req.body;
    if (!seasonId) {
      return response.badRequest(res, 'Season ID is required');
    }

    // Check if season exists
    const season = await Season.findByPk(seasonId);
    if (!season) {
      return response.notFound(res, 'Season not found');
    }

    const filePath = req.file.path;
    
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      // Delete uploaded file
      fs.unlinkSync(filePath);
      return response.badRequest(res, 'Excel file is empty');
    }

    const results = {
      success: [],
      failed: [],
      duplicates: []
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Map Excel columns to database fields
        const formNumber = row['Form Number'] || row['form_number'] || row['FormNumber'];
        const name = row['Name'] || row['name'];
        const category = (row['Category'] || row['category'])?.toUpperCase();
        const playerType = (row['Player Type'] || row['player_type'] || row['Role'])?.toUpperCase().replace(/\s+/g, '_');
        const battingHand = (row['Batting Hand'] || row['batting_hand'])?.toUpperCase();
        const battingPosition = row['Batting Position'] || row['batting_position'];
        const bowlingArm = row['Bowling Arm'] || row['bowling_arm'];
        const bowlingType = row['Bowling Type'] || row['bowling_type'];
        const dateOfBirth = row['DOB'] || row['Date of Birth'] || row['date_of_birth'];
        const rating = parseFloat(row['Rating'] || row['rating'] || 0);
        const basePrice = parseFloat(row['Base Price'] || row['base_price'] || 50000);

        // Validate required fields
        if (!formNumber || !name || !category || !playerType) {
          results.failed.push({
            row: i + 2,
            formNumber: formNumber || 'N/A',
            name: name || 'N/A',
            reason: 'Missing required fields (form number, name, category, or player type)'
          });
          continue;
        }

        // Check for duplicate
        const existingPlayer = await Player.findOne({
          where: { seasonId, formNumber }
        });

        if (existingPlayer) {
          results.duplicates.push({
            row: i + 2,
            formNumber,
            name: existingPlayer.name
          });
          continue;
        }

        // Calculate age
        let age = null;
        if (dateOfBirth) {
          const dob = new Date(dateOfBirth);
          if (!isNaN(dob.getTime())) {
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
          }
        }

        // Create player
        const player = await Player.create({
          seasonId,
          formNumber,
          name,
          dateOfBirth: dateOfBirth || null,
          age,
          category,
          playerType,
          battingHand: battingHand || null,
          battingPosition: battingPosition || null,
          bowlingArm: bowlingArm || null,
          bowlingType: bowlingType || null,
          rating,
          basePrice,
          status: 'UNSOLD'
        });

        results.success.push({
          row: i + 2,
          formNumber: player.formNumber,
          name: player.name,
          category: player.category
        });

      } catch (rowError) {
        logger.error(`Error processing row ${i + 2}:`, rowError);
        results.failed.push({
          row: i + 2,
          formNumber: row['Form Number'] || 'N/A',
          name: row['Name'] || 'N/A',
          reason: rowError.message
        });
      }
    }

    // Delete uploaded file
    fs.unlinkSync(filePath);

    logger.info(`Bulk upload completed: ${results.success.length} success, ${results.failed.length} failed, ${results.duplicates.length} duplicates`);

    return response.success(res, {
      summary: {
        total: data.length,
        successful: results.success.length,
        failed: results.failed.length,
        duplicates: results.duplicates.length
      },
      details: results
    }, 'Bulk upload completed');

  } catch (error) {
    // Delete uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    logger.error('Error in bulk upload:', error);
    next(error);
  }
};
/**
 * Bulk upload players from CSV with photos
 * POST /api/players/bulk-upload-with-photos
 */
const bulkUploadPlayersWithPhotos = async (req, res, next) => {
  try {
    const { seasonId } = req.body;
    
    if (!seasonId) {
      return response.badRequest(res, 'Season ID is required');
    }

    // Check if season exists
    const season = await Season.findByPk(seasonId);
    if (!season) {
      return response.notFound(res, 'Season not found');
    }

    // Check if CSV file uploaded
    if (!req.files || !req.files.csvFile) {
      return response.badRequest(res, 'Please upload a CSV file');
    }

    const csvFile = req.files.csvFile[0];
    const photoFiles = req.files.photos || [];

    logger.info(`Received ${photoFiles.length} photos for upload`);

    // Read CSV file
    const csvPath = csvFile.path;
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    if (lines.length < 2) {
      fs.unlinkSync(csvPath);
      return response.badRequest(res, 'CSV file is empty or invalid');
    }

    // Parse CSV header
    const headers = lines[0].split(',').map(h => h.trim());
    
    const results = {
      success: [],
      failed: [],
      duplicates: []
    };

    // Create a map of photos by form number
    const photoMap = {};
    photoFiles.forEach(file => {
      // Extract form number from filename (e.g., "301_Abul_Hasan_Khalid.png" -> "301")
      const match = file.originalname.match(/^(\d+)_/);
      if (match) {
        photoMap[match[1]] = `/uploads/players/${file.filename}`;
      }
    });

    logger.info(`Photo mapping created for ${Object.keys(photoMap).length} players`);

    // Process each CSV row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        const formNumber = row['Form Number'];
        const name = row['Name'];
        const category = row['Category']?.toUpperCase();
        const playerType = row['Player Type']?.toUpperCase().replace(/\s+/g, '_');
        const battingHand = row['Batting Hand']?.toUpperCase() || null;
        const battingPosition = row['Batting Position'] || null;
        const bowlingArm = row['Bowling Arm'] || null;
        const bowlingType = row['Bowling Type'] || null;
        const dateOfBirth = row['DOB'] || null;
        const rating = parseFloat(row['Rating'] || 0);
        const basePrice = parseFloat(row['Base Price'] || 50000);

        // Validate required fields
        if (!formNumber || !name || !category || !playerType) {
          results.failed.push({
            row: i + 1,
            formNumber: formNumber || 'N/A',
            name: name || 'N/A',
            reason: 'Missing required fields'
          });
          continue;
        }

        // Check for duplicate
        const existingPlayer = await Player.findOne({
          where: { seasonId, formNumber }
        });

        if (existingPlayer) {
          results.duplicates.push({
            row: i + 1,
            formNumber,
            name: existingPlayer.name
          });
          continue;
        }

        // Calculate age
        let age = null;
        if (dateOfBirth) {
          const dob = new Date(dateOfBirth);
          if (!isNaN(dob.getTime())) {
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
          }
        }

        // Get photo URL if available
        const photoUrl = photoMap[formNumber] || null;

        // Create player
        const player = await Player.create({
          seasonId,
          formNumber,
          name,
          photoUrl,
          dateOfBirth,
          age,
          category,
          playerType,
          battingHand,
          battingPosition,
          bowlingArm,
          bowlingType,
          rating,
          basePrice,
          status: 'UNSOLD'
        });

        results.success.push({
          row: i + 1,
          formNumber: player.formNumber,
          name: player.name,
          category: player.category,
          hasPhoto: !!photoUrl
        });

        logger.info(`Player created: ${player.name} (Form: ${formNumber})${photoUrl ? ' with photo' : ''}`);

      } catch (rowError) {
        logger.error(`Error processing row ${i + 1}:`, rowError);
        results.failed.push({
          row: i + 1,
          reason: rowError.message
        });
      }
    }

    // Delete CSV file
    fs.unlinkSync(csvPath);

    logger.info(`Bulk upload completed: ${results.success.length} success, ${results.failed.length} failed, ${results.duplicates.length} duplicates`);

    return response.success(res, {
      summary: {
        total: lines.length - 1,
        successful: results.success.length,
        failed: results.failed.length,
        duplicates: results.duplicates.length,
        photosUploaded: results.success.filter(r => r.hasPhoto).length
      },
      details: results
    }, 'Bulk upload with photos completed');

  } catch (error) {
    logger.error('Error in bulk upload with photos:', error);
    next(error);
  }
};
/**
 * Update player
 * PUT /api/players/:id
 */
const updatePlayer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const player = await Player.findByPk(id);

    if (!player) {
      return response.notFound(res, 'Player not found');
    }

    // If updating DOB, recalculate age
    if (updateData.dateOfBirth) {
      const dob = new Date(updateData.dateOfBirth);
      const today = new Date();
      updateData.age = today.getFullYear() - dob.getFullYear();
    }

    await player.update(updateData);

    logger.info(`Player updated: ${player.name} (ID: ${player.id})`);

    return response.success(res, player, 'Player updated successfully');
  } catch (error) {
    logger.error('Error updating player:', error);
    next(error);
  }
};

/**
 * Delete player
 * DELETE /api/players/:id
 */
const deletePlayer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const player = await Player.findByPk(id);

    if (!player) {
      return response.notFound(res, 'Player not found');
    }

    const playerName = player.name;
    const playerId = player.id;

    await player.destroy();

    logger.info(`Player deleted: ${playerName} (ID: ${playerId})`);

    return response.success(res, {
      id: playerId,
      name: playerName
    }, 'Player deleted successfully');
  } catch (error) {
    logger.error('Error deleting player:', error);
    next(error);
  }
};

/**
 * Upload player photo
 * PATCH /api/players/:id/photo
 */
const uploadPlayerPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const player = await Player.findByPk(id);

    if (!player) {
      return response.notFound(res, 'Player not found');
    }

    if (!req.file) {
      return response.badRequest(res, 'No photo file uploaded');
    }

    const photoPath = `/uploads/players/${req.file.filename}`;

    await player.update({ photoUrl: photoPath });

    logger.info(`Player photo updated: ${player.name} - Photo: ${photoPath}`);

    return response.success(res, {
      id: player.id,
      name: player.name,
      photoUrl: player.photoUrl
    }, 'Player photo updated successfully');
  } catch (error) {
    logger.error('Error uploading player photo:', error);
    next(error);
  }
};

/**
 * Get player statistics
 * GET /api/players/stats
 */
const getPlayerStats = async (req, res, next) => {
  try {
    const { seasonId } = req.query;

    const where = seasonId ? { seasonId: parseInt(seasonId) } : {};

    const stats = await Player.findAll({
      where,
      attributes: [
        'category',
        'status',
        [Player.sequelize.fn('COUNT', Player.sequelize.col('id')), 'count']
      ],
      group: ['category', 'status']
    });

    const summary = {
      total: 0,
      byCategory: { A: 0, B: 0, C: 0, D: 0 },
      byStatus: { UNSOLD: 0, SOLD: 0, WITHDRAWN: 0, ON_BID: 0 }
    };

    stats.forEach(stat => {
      const count = parseInt(stat.dataValues.count);
      summary.total += count;
      summary.byCategory[stat.category] = (summary.byCategory[stat.category] || 0) + count;
      summary.byStatus[stat.status] = (summary.byStatus[stat.status] || 0) + count;
    });

    return response.success(res, summary, 'Player statistics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching player stats:', error);
    next(error);
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  bulkUploadPlayers,
    bulkUploadPlayersWithPhotos,
  updatePlayer,
  deletePlayer,
  uploadPlayerPhoto,
  getPlayerStats
};
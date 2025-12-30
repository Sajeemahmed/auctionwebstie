// src/seeders/seedDatabase.js
const { Season } = require('../models');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    // Check if default season exists
    const existingSeason = await Season.findOne({ where: { seasonNumber: 1 } });

    if (!existingSeason) {
      const season = await Season.create({
        seasonNumber: 1,
        seasonName: 'KBN Premier League 2025',
        year: 2025,
        isActive: true
      });

      logger.info(`Default season created: ${season.seasonName}`);
      return season;
    } else {
      logger.info('Default season already exists');
      return existingSeason;
    }
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;

// src/seeders/seedDatabase.js
const { Season, Team } = require('../models');
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
    }

    // Seed teams if they don't exist
    const existingTeams = await Team.count();
    if (existingTeams === 0) {
      const season = await Season.findOne({ where: { seasonNumber: 1 } });
      
      const teams = [
        { name: 'Royal Warriors', shortName: 'RW', seasonId: season.id, purse: 10000000, ownerId: null },
        { name: 'Thunder Knights', shortName: 'TK', seasonId: season.id, purse: 10000000, ownerId: null },
        { name: 'Storm Titans', shortName: 'ST', seasonId: season.id, purse: 10000000, ownerId: null },
        { name: 'Fire Eagles', shortName: 'FE', seasonId: season.id, purse: 10000000, ownerId: null },
        { name: 'Ice Dragons', shortName: 'ID', seasonId: season.id, purse: 10000000, ownerId: null },
        { name: 'Golden Lions', shortName: 'GL', seasonId: season.id, purse: 10000000, ownerId: null },
      ];

      await Team.bulkCreate(teams);
      logger.info(`${teams.length} teams created`);
    } else {
      logger.info(`Teams already exist: ${existingTeams}`);
    }
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;

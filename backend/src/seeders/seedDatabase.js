// src/seeders/seedDatabase.js
const { Season, Team, User } = require('../models');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    // Check if default season exists
    let season = await Season.findOne({ where: { seasonNumber: 1 } });

    if (!season) {
      season = await Season.create({
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

    // Seed a default admin user so the UI has working credentials
    const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@kbn.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ where: { username: adminUsername } });
    if (!existingAdmin) {
      await User.create({
        username: adminUsername,
        email: adminEmail,
        passwordHash: adminPassword,
        role: 'ADMIN',
        seasonId: season.id
      });
      logger.info(`Default admin created: ${adminUsername}/${adminEmail}`);
    } else {
      logger.info(`Default admin already exists: ${existingAdmin.username}`);
    }

    // Seed teams if they don't exist
    const existingTeams = await Team.count();
    if (existingTeams === 0) {
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

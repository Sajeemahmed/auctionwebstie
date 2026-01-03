// reset-db.js - Script to reset the database
require('dotenv').config();
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');

const resetDB = async () => {
  try {
    console.log('🗑️  Dropping all tables...');
    
    // Disable foreign key constraints
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    
    // Drop all tables
    await sequelize.drop({ cascade: false });
    
    // Re-enable foreign key constraints
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    
    console.log('✅ All tables dropped successfully');
    
    console.log('🔄 Syncing database with models...');
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    console.log('📝 Database has been reset successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
};

resetDB();

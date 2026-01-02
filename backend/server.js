// server.js
require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');
const http = require('http');
const socketHandler = require('./src/socket/socketHandler');
const seedDatabase = require('./src/seeders/seedDatabase');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketHandler.initialize(server);

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL Database connected successfully');
    
    // Sync models (use {alter: true} only in development)
    // In production, use migrations instead
    if (process.env.NODE_ENV === 'development') {
      // Drop and recreate to fix any schema issues
      const forceSync = process.env.FORCE_DB_SYNC === 'true';
      await sequelize.sync({ force: forceSync, alter: !forceSync });
      logger.info('✅ Database models synchronized');
      
      // Seed default data
      await seedDatabase();
    }
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🌐 API: http://localhost:${PORT}/api`);
    logger.info(`⚡ Socket.IO running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    sequelize.close();
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    sequelize.close();
    process.exit(0);
  });
});

startServer();
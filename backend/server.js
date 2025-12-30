// server.js
const app = require('./src/app');
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');
const http = require('http');
const socketHandler = require('./src/socket/socketHandler');

const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketHandler.initialize(server);

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL Database connected successfully');
    
    // Sync models (use {force: true} only in development to recreate tables)
    await sequelize.sync({ alter: true });
    logger.info('✅ Database models synchronized');
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
    logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
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

startServer();
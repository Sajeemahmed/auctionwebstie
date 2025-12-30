// src/socket/socketHandler.js
const { Server } = require('socket.io');
const logger = require('../utils/logger');
const { SOCKET_EVENTS } = require('../config/constants');

let io;

const initialize = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Handle user join
    socket.on('user:join', (data) => {
      logger.info(`User joined: ${data.userId} - ${data.role}`);
      
      // Join room based on role
      if (data.role === 'ADMIN') {
        socket.join('admin-room');
      } else if (data.role === 'TEAM_OWNER') {
        socket.join('owner-room');
        socket.join(`team-${data.teamId}`);
      } else if (data.role === 'VIEWER') {
        socket.join('viewer-room');
      }
      
      socket.join('auction-room'); // All users join main auction room
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ Socket.IO initialized successfully');
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit to all users in auction room
const emitToAuction = (event, data) => {
  if (io) {
    io.to('auction-room').emit(event, data);
  }
};

// Emit to specific room
const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

// Emit to all connected clients
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initialize,
  getIO,
  emitToAuction,
  emitToRoom,
  emitToAll
};
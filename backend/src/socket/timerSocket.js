// src/socket/timerSocket.js
const { emitToAuction } = require('./socketHandler');
const { SOCKET_EVENTS } = require('../config/constants');
const logger = require('../utils/logger');

class TimerSocket {
  // Emit timer started event
  static timerStarted(data) {
    logger.info(`Emitting: Timer Started - ${data.duration}s`);
    emitToAuction(SOCKET_EVENTS.TIMER_STARTED, {
      playerId: data.playerId,
      duration: data.duration
    });
  }

  // Emit timer tick event
  static timerTick(data) {
    emitToAuction(SOCKET_EVENTS.TIMER_TICK, {
      playerId: data.playerId,
      remainingSeconds: data.remainingSeconds
    });
  }

  // Emit timer reset event
  static timerReset(data) {
    logger.info(`Emitting: Timer Reset - ${data.resetTo}s`);
    emitToAuction(SOCKET_EVENTS.TIMER_RESET, {
      playerId: data.playerId,
      resetTo: data.resetTo,
      reason: data.reason || 'New bid placed'
    });
  }

  // Emit timer ended event
  static timerEnded(data) {
    logger.info(`Emitting: Timer Ended - Has Bids: ${data.hasBids}`);
    emitToAuction(SOCKET_EVENTS.TIMER_ENDED, {
      playerId: data.playerId,
      hasBids: data.hasBids
    });
  }
}

module.exports = TimerSocket;
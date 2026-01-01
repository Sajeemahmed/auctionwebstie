// src/services/socketService.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connect to socket server
  connect(role = 'VIEWER', userId = null) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);

      // Join auction room based on role
      this.socket.emit('user:join', { role, userId });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected. Call connect() first.');
      return;
    }

    // Store listener reference for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    this.socket.on(event, callback);
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from listeners map
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit an event
  emit(event, data) {
    if (!this.socket) {
      console.error('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.emit(event, data);
  }

  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Socket Events (constants for type safety)
  static EVENTS = {
    // Auction events
    AUCTION_STARTED: 'auction:started',
    AUCTION_PAUSED: 'auction:paused',
    AUCTION_RESUMED: 'auction:resumed',
    AUCTION_COMPLETED: 'auction:completed',

    // Player events
    PLAYER_ON_BID: 'player:onBid',
    PLAYER_SOLD: 'player:sold',
    PLAYER_UNSOLD: 'player:unsold',

    // Bid events
    BID_PLACED: 'bid:placed',
    BID_UPDATE: 'bid:update',
    BID_INVALID: 'bid:invalid',

    // Timer events
    TIMER_STARTED: 'timer:started',
    TIMER_TICK: 'timer:tick',
    TIMER_RESET: 'timer:reset',
    TIMER_ENDED: 'timer:ended',

    // Category events
    CATEGORY_CHANGED: 'category:changed',

    // Team events
    TEAM_PURSE_UPDATED: 'team:purse:updated'
  };
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

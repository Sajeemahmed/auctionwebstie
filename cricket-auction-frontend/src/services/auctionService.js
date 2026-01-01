// src/services/auctionService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const auctionService = {
  // Get current auction state
  getAuctionState: async (seasonId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auction/state?seasonId=${seasonId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch auction state');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching auction state:', error);
      return { success: false, error: error.message };
    }
  },

  // Start auction
  startAuction: async (seasonId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auction/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seasonId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start auction');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error starting auction:', error);
      return { success: false, error: error.message };
    }
  },

  // Pause auction
  pauseAuction: async (seasonId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auction/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seasonId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to pause auction');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error pausing auction:', error);
      return { success: false, error: error.message };
    }
  },

  // Resume auction
  resumeAuction: async (seasonId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auction/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seasonId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resume auction');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error resuming auction:', error);
      return { success: false, error: error.message };
    }
  },

  // Bring player to bid
  bringPlayerToBid: async (seasonId, playerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auction/player-on-bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seasonId, playerId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bring player to bid');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error bringing player to bid:', error);
      return { success: false, error: error.message };
    }
  },

  // Place bid
  placeBid: async (seasonId, playerId, teamId, bidAmount) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auction/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seasonId, playerId, teamId, bidAmount })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place bid');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error placing bid:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark player as sold
  markPlayerSold: async (seasonId, playerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auction/sold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seasonId, playerId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark player as sold');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error marking player as sold:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark player as unsold
  markPlayerUnsold: async (seasonId, playerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auction/unsold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seasonId, playerId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark player as unsold');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error marking player as unsold:', error);
      return { success: false, error: error.message };
    }
  },

  // Get bid history for a player
  getBidHistory: async (playerId, seasonId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auction/bids/${playerId}?seasonId=${seasonId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch bid history');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching bid history:', error);
      return { success: false, error: error.message };
    }
  }
};

export default auctionService;

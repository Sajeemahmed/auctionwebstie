// src/services/playerService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const playerService = {
  // Create a new player
  createPlayer: async (playerData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create player');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error creating player:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all players
  getAllPlayers: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.seasonId) queryParams.append('seasonId', filters.seasonId);
      if (filters.teamId) queryParams.append('teamId', filters.teamId);
      if (filters.status) queryParams.append('status', filters.status);

      const url = `${API_BASE_URL}/players${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching players:', error);
      return { success: false, error: error.message };
    }
  },

  // Get player by ID
  getPlayerById: async (playerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${playerId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch player');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching player:', error);
      return { success: false, error: error.message };
    }
  },

  // Get players by season
  getPlayersBySeason: async (seasonId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/season/${seasonId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching players by season:', error);
      return { success: false, error: error.message };
    }
  },

  // Get players by team
  getPlayersByTeam: async (teamId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching players by team:', error);
      return { success: false, error: error.message };
    }
  },

  // Update player
  updatePlayer: async (playerId, playerData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update player');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error updating player:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete player
  deletePlayer: async (playerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete player');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting player:', error);
      return { success: false, error: error.message };
    }
  }
};

export default playerService;

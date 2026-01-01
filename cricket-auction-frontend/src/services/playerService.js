// src/services/playerService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const playerService = {
  // Get all players with filters
  getAllPlayers: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.seasonId) queryParams.append('seasonId', filters.seasonId);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.teamId) queryParams.append('teamId', filters.teamId);

      const url = `${API_BASE_URL}/players${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const data = await response.json();
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching players:', error);
      return { success: false, error: error.message, data: [] };
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

  // Get player statistics
  getPlayerStats: async (seasonId = null) => {
    try {
      const url = seasonId 
        ? `${API_BASE_URL}/players/stats?seasonId=${seasonId}`
        : `${API_BASE_URL}/players/stats`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch player stats');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return { success: false, error: error.message };
    }
  },

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

  // Bulk upload players from Excel
  bulkUploadPlayers: async (excelFile, seasonId) => {
    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('seasonId', seasonId);

      console.log('Uploading Excel file for seasonId:', seasonId);

      const response = await fetch(`${API_BASE_URL}/players/bulk-upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload players');
      }

      const data = await response.json();
      console.log('Upload result:', data);
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error uploading players:', error);
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

  // Upload player photo
  uploadPlayerPhoto: async (playerId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      console.log('Uploading photo for player:', playerId);

      const response = await fetch(`${API_BASE_URL}/players/${playerId}/photo`, {
        method: 'PATCH',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload photo');
      }

      const data = await response.json();
      console.log('Photo uploaded:', data);
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error uploading photo:', error);
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
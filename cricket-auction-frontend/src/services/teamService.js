// src/services/teamService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const teamService = {

  // Create a new team
  createTeam: async (teamData) => {
    try {
      // Make sure sponsors is stringified if it's an array
      const payload = {
        ...teamData,
        sponsors: Array.isArray(teamData.sponsors) 
          ? JSON.stringify(teamData.sponsors) 
          : teamData.sponsors
      };

      console.log('Creating team with payload:', payload);

      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create team');
      }

      const data = await response.json();
      console.log('Team created:', data);
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error creating team:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all teams
  getAllTeams: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch teams');
      }

      const data = await response.json();
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching teams:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Upload team logo
  uploadTeamLogo: async (teamId, logoFile) => {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      console.log('Uploading logo for team:', teamId);

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/logo`, {
        method: 'PATCH',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload logo');
      }

      const data = await response.json();
      console.log('Logo uploaded:', data);
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error uploading logo:', error);
      return { success: false, error: error.message };
    }
  },

  // Get team by ID
  getTeamById: async (teamId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch team');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching team:', error);
      return { success: false, error: error.message };
    }
  },

  // Update team
  updateTeam: async (teamId, teamData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update team');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error updating team:', error);
      return { success: false, error: error.message };
    }
  },

  // Update team purse
  updateTeamPurse: async (teamId, remainingPurse) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/purse`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remainingPurse })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update team purse');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error updating team purse:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete team
  deleteTeam: async (teamId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete team');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting team:', error);
      return { success: false, error: error.message };
    }
  }
//   // Upload team logo
//   uploadTeamLogo: async (teamId, logoFile) => {
//     try {
//       const formData = new FormData();
//       formData.append('logo', logoFile);

//       const response = await fetch(`${API_BASE_URL}/teams/${teamId}/logo`, {
//         method: 'PATCH',
//         body: formData
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || 'Failed to upload logo');
//       }

//       const data = await response.json();
//       return { success: true, data: data.data };
//     } catch (error) {
//       console.error('Error uploading logo:', error);
//       return { success: false, error: error.message };
//     }
//   },
};

export default teamService;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock player data - representing 178 players from KBN Premier League
const generateMockPlayers = () => {
  const categories = [
    { cat: 'A', base: 50000, count: 46 },
    { cat: 'B', base: 30000, count: 14 },
    { cat: 'C', base: 20000, count: 51 },
    { cat: 'D', base: 10000, count: 67 }
  ];
  
  const roles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper'];
  const firstNames = ['Abul', 'Avinash', 'Sudhanwa', 'Rahul', 'Virat', 'Rohit', 'Mohammed', 'Sachin', 'Yusuf', 'Hardik', 'Ravindra', 'Jasprit', 'Shubman', 'Suryakumar', 'Rishabh', 'KL', 'Shreyas', 'Axar', 'Ravichandran', 'Kuldeep'];
  const lastNames = ['Hasan', 'Deshpande', 'Kumar', 'Sharma', 'Kohli', 'Pathan', 'Khan', 'Singh', 'Jadeja', 'Bumrah', 'Gill', 'Yadav', 'Pant', 'Rahul', 'Iyer', 'Patel', 'Ashwin', 'Chahal'];
  
  const players = [];
  let formNumber = 301;
  
  categories.forEach(({ cat, base, count }) => {
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
      
      players.push({
        id: `player-${formNumber}`,
        formNumber: formNumber,
        name: `${firstName} ${lastName}`,
        category: cat,
        role: role,
        basePrice: base,
        rating: rating,
        status: 'available', // available, sold, unsold
        soldTo: null,
        soldPrice: null,
        photo: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=200`
      });
      formNumber++;
    }
  });
  
  return players;
};

// Mock teams
const initialTeams = [
  { id: 'team-1', name: 'Royal Warriors', purse: 10000000, maxPlayers: 15, players: [], color: '#3B82F6' },
  { id: 'team-2', name: 'Thunder Knights', purse: 10000000, maxPlayers: 15, players: [], color: '#F59E0B' },
  { id: 'team-3', name: 'Storm Titans', purse: 10000000, maxPlayers: 15, players: [], color: '#10B981' },
  { id: 'team-4', name: 'Fire Eagles', purse: 10000000, maxPlayers: 15, players: [], color: '#EF4444' },
  { id: 'team-5', name: 'Ice Dragons', purse: 10000000, maxPlayers: 15, players: [], color: '#8B5CF6' },
  { id: 'team-6', name: 'Golden Lions', purse: 10000000, maxPlayers: 15, players: [], color: '#EC4899' },
];

const useAuctionStore = create(
  persist(
    (set, get) => ({
      // State
      players: generateMockPlayers(),
      teams: initialTeams,
      currentUser: (() => {
        try {
          return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
          return null;
        }
      })(),
      currentCategory: 'A',
      currentPlayer: null,
      currentBid: null,
      bidHistory: [],
      timer: 30,
      isTimerRunning: false,
      auctionStatus: 'idle', // idle, running, paused, finished
      
      // Auth Actions
      login: async (username, password) => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
          });

          const data = await response.json();

          if (response.ok) {
            const user = data.data.user;
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ currentUser: user });
            return { success: true, user };
          } else {
            return { success: false, error: data.message || 'Invalid credentials' };
          }
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: 'Network error. Please try again.' };
        }
      },

      register: async (username, email, password, role, teamId) => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, role, teamId, seasonId: 1 })
          });

          const data = await response.json();

          if (response.ok) {
            const user = data.data.user;
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ currentUser: user });
            return { success: true, user };
          } else {
            return { success: false, error: data.message || 'Registration failed' };
          }
        } catch (error) {
          console.error('Registration error:', error);
          return { success: false, error: 'Network error. Please try again.' };
        }
      },

      getAllTeams: async () => {
        try {
          const response = await fetch('http://localhost:5000/api/teams');
          if (response.ok) {
            const data = await response.json();
            return data.data || [];
          }
        } catch (error) {
          console.error('Error fetching teams:', error);
        }
        return [];
      },
      
      logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        set({ currentUser: null });
      },
      
      // Player Actions
      bringPlayerToBid: async (playerId) => {
        const player = get().players.find(p => p.id === playerId);
        if (!player || player.status !== 'available') {
          return { success: false, error: 'Player not available' };
        }

        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch('http://localhost:5000/api/auction/player-on-bid', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              seasonId: 1, // Using season 1
              playerId: playerId
            })
          });

          const data = await response.json();

          if (response.ok) {
            // Update local state immediately for admin UI
            set({
              currentPlayer: player,
              currentBid: { amount: player.basePrice, teamId: null, teamName: 'Base Price' },
              bidHistory: [],
              timer: 30,
              isTimerRunning: true
            });
            console.log('Player brought to bid:', player.name);
            return { success: true, player };
          } else {
            console.error('Failed to bring player to bid:', data.message);
            return { success: false, error: data.message || 'Failed to bring player to bid' };
          }
        } catch (error) {
          console.error('Error bringing player to bid:', error);
          return { success: false, error: 'Network error. Please try again.' };
        }
      },
      
      placeBid: (teamId, amount) => {
        const { teams, currentBid, currentPlayer } = get();
        const team = teams.find(t => t.id === teamId);
        
        if (!team || !currentPlayer) return { success: false, error: 'Invalid team or player' };
        if (team.purse < amount) return { success: false, error: 'Insufficient purse' };
        if (team.players.length >= team.maxPlayers) return { success: false, error: 'Team full' };
        if (currentBid && amount <= currentBid.amount) return { success: false, error: 'Bid must be higher' };
        
        const newBid = { amount, teamId, teamName: team.name, timestamp: Date.now() };
        
        set(state => ({
          currentBid: newBid,
          bidHistory: [newBid, ...state.bidHistory],
          timer: 30,
          isTimerRunning: true
        }));
        
        return { success: true };
      },
      
      soldPlayer: () => {
        const { currentPlayer, currentBid, players, teams } = get();
        
        if (!currentPlayer || !currentBid || !currentBid.teamId) {
          return { success: false, error: 'No valid bid' };
        }
        
        const updatedPlayers = players.map(p => 
          p.id === currentPlayer.id 
            ? { ...p, status: 'sold', soldTo: currentBid.teamId, soldPrice: currentBid.amount }
            : p
        );
        
        const updatedTeams = teams.map(t =>
          t.id === currentBid.teamId
            ? { 
                ...t, 
                purse: t.purse - currentBid.amount, 
                players: [...t.players, { ...currentPlayer, soldPrice: currentBid.amount }]
              }
            : t
        );
        
        set({
          players: updatedPlayers,
          teams: updatedTeams,
          currentPlayer: null,
          currentBid: null,
          bidHistory: [],
          timer: 30,
          isTimerRunning: false
        });
        
        return { success: true };
      },
      
      unsoldPlayer: () => {
        const { currentPlayer, players } = get();
        
        if (!currentPlayer) return { success: false };
        
        const updatedPlayers = players.map(p =>
          p.id === currentPlayer.id ? { ...p, status: 'unsold' } : p
        );
        
        set({
          players: updatedPlayers,
          currentPlayer: null,
          currentBid: null,
          bidHistory: [],
          timer: 30,
          isTimerRunning: false
        });
        
        return { success: true };
      },
      // Timer Actions
      decrementTimer: () => {
        const { timer, isTimerRunning } = get();
        if (isTimerRunning && timer > 0) {
          set({ timer: timer - 1 });
        }
        if (timer === 1) {
          set({ isTimerRunning: false });
        }
      },
      
      pauseTimer: () => set({ isTimerRunning: false }),
      resumeTimer: () => set({ isTimerRunning: true }),
      resetTimer: () => set({ timer: 30 }),
      
      // Category Actions
      setCategory: (category) => set({ currentCategory: category }),
      
      // Auction Control
      startAuction: () => set({ auctionStatus: 'running' }),
      pauseAuction: () => set({ auctionStatus: 'paused', isTimerRunning: false }),
      resumeAuction: () => set({ auctionStatus: 'running', isTimerRunning: true }),
      endAuction: () => set({ auctionStatus: 'finished', isTimerRunning: false }),
      
      // Team Actions
      addTeam: (teamName) => {
        const newTeam = {
          id: `team-${Date.now()}`,
          name: teamName,
          purse: 10000000,
          maxPlayers: 15,
          players: [],
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
        set(state => ({ teams: [...state.teams, newTeam] }));
      },
      
      // Reset
      resetAuction: () => set({
        players: generateMockPlayers(),
        teams: initialTeams,
        currentCategory: 'A',
        currentPlayer: null,
        currentBid: null,
        bidHistory: [],
        timer: 30,
        isTimerRunning: false,
        auctionStatus: 'idle'
      }),
      
      // Getters
      getPlayersByCategory: (category) => get().players.filter(p => p.category === category),
      getAvailablePlayers: (category) => get().players.filter(p => p.category === category && p.status === 'available'),
      getUnsoldPlayers: () => get().players.filter(p => p.status === 'unsold'),
      getSoldPlayers: () => get().players.filter(p => p.status === 'sold'),
      getTeamById: (teamId) => get().teams.find(t => t.id === teamId),
      
      // Fetch players and teams from backend
      fetchPlayers: async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch('http://localhost:5000/api/players', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });

          if (response.ok) {
            const data = await response.json();
            const players = (data.data || []).map(p => {
              // Map backend status to frontend status
              let status = 'available';
              if (p.status === 'SOLD') {
                status = 'sold';
              } else if (p.status === 'UNSOLD' || p.status === 'WITHDRAWN') {
                status = 'available';
              } else if (p.status === 'ON_BID') {
                status = 'available'; // Currently on bid players are still available
              }

              return {
                id: p.id,
                formNumber: p.formNumber,
                name: p.name,
                category: p.category,
                role: p.playerType || p.role || 'All-Rounder', // Use playerType from backend
                playerType: p.playerType,
                battingHand: p.battingHand,
                battingPosition: p.battingPosition,
                bowlingArm: p.bowlingArm,
                bowlingType: p.bowlingType,
                basePrice: parseFloat(p.basePrice) || 0,
                rating: parseFloat(p.rating) || 3,
                status: status,
                soldTo: p.teamId || p.soldTo || null, // teamId is used in backend
                soldPrice: p.soldPrice ? parseFloat(p.soldPrice) : null,
                photo: p.photoUrl || p.photo || `https://ui-avatars.com/api/?name=${p.name}&background=random&size=200`
              };
            });
            set({ players });
            console.log('Fetched players:', players.length);
            return players;
          } else {
            console.error('Failed to fetch players:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error fetching players:', error);
        }
        return get().players;
      },

      fetchTeams: async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch('http://localhost:5000/api/teams', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });

          if (response.ok) {
              const data = await response.json();
              const teams = (data.data || []).map(t => ({
                id: t.id,
                name: t.name,
                shortName: t.shortName,
                purse: t.remainingPurse || t.purse || t.initialPurse || t.initial_purse || 10000000,
                maxPlayers: t.maxSquadSize || t.maxPlayers || 15,
                players: t.players || [],
                color: t.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
              }));
            set({ teams });
            console.log('Fetched teams:', teams.length);
            return teams;
          } else {
            console.error('Failed to fetch teams:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error fetching teams:', error);
        }
        return get().teams;
      },

      getPlayerStats: () => {
        const players = get().players;
        return {
          total: players.length,
          catA: players.filter(p => p.category === 'A').length,
          catB: players.filter(p => p.category === 'B').length,
          catC: players.filter(p => p.category === 'C').length,
          catD: players.filter(p => p.category === 'D').length,
          sold: players.filter(p => p.status === 'sold').length,
          unsold: players.filter(p => p.status === 'unsold').length,
          available: players.filter(p => p.status === 'available').length
        };
      }
    }),
    {
      name: 'kbn-auction-storage',
      partialize: (state) => ({
        players: state.players,
        teams: state.teams,
        currentUser: state.currentUser,
        auctionStatus: state.auctionStatus
      })
    }
  )
);

export default useAuctionStore;

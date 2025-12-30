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
      currentUser: null,
      currentCategory: 'A',
      currentPlayer: null,
      currentBid: null,
      bidHistory: [],
      timer: 30,
      isTimerRunning: false,
      auctionStatus: 'idle', // idle, running, paused, finished
      
      // Auth Actions
      login: (username, password, role) => {
        const users = {
          admin: { username: 'admin', password: 'admin123', role: 'admin' },
          owner1: { username: 'warriors', password: 'team123', role: 'owner', teamId: 'team-1' },
          owner2: { username: 'knights', password: 'team123', role: 'owner', teamId: 'team-2' },
          owner3: { username: 'titans', password: 'team123', role: 'owner', teamId: 'team-3' },
          owner4: { username: 'eagles', password: 'team123', role: 'owner', teamId: 'team-4' },
          owner5: { username: 'dragons', password: 'team123', role: 'owner', teamId: 'team-5' },
          owner6: { username: 'lions', password: 'team123', role: 'owner', teamId: 'team-6' },
        };
        
        const user = Object.values(users).find(u => u.username === username && u.password === password);
        if (user) {
          set({ currentUser: user });
          return { success: true, user };
        }
        return { success: false, error: 'Invalid credentials' };
      },
      
      logout: () => set({ currentUser: null }),
      
      // Player Actions
      bringPlayerToBid: (playerId) => {
        const player = get().players.find(p => p.id === playerId);
        if (player && player.status === 'available') {
          set({
            currentPlayer: player,
            currentBid: { amount: player.basePrice, teamId: null, teamName: 'Base Price' },
            bidHistory: [],
            timer: 30,
            isTimerRunning: true
          });
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

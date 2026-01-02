import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Radio, Trophy, Users, Clock, TrendingUp, Star, Wallet, Target, CheckCircle } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import BidTimer from '../components/auction/BidTimer';
import BiddingPanel from '../components/auction/BiddingPanel';
import useAuctionStore from '../store/auctionStore';
import { toast } from 'sonner';
import socketService from '../services/socketService';

const formatCurrency = (amount) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
};

// Cricket Ball Animation Component
const CricketBall = ({ className }) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{ 
      rotate: 360,
      y: [0, -20, 0]
    }}
    transition={{ 
      rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
      y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }}
  >
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#E50914" stroke="#B20710" strokeWidth="2"/>
      <path d="M8 20C8 20 14 12 20 12C26 12 32 20 32 20" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M8 20C8 20 14 28 20 28C26 28 32 20 32 20" stroke="white" strokeWidth="2" fill="none"/>
    </svg>
  </motion.div>
);

// Cricket Bat Animation Component
const CricketBat = ({ className }) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{ 
      rotate: [-10, 10, -10]
    }}
    transition={{ 
      duration: 2, 
      repeat: Infinity, 
      ease: 'easeInOut' 
    }}
  >
    <svg width="60" height="120" viewBox="0 0 60 120" fill="none">
      <rect x="20" y="0" width="20" height="70" rx="5" fill="#8B4513"/>
      <rect x="15" y="70" width="30" height="45" rx="3" fill="#D2691E"/>
      <rect x="25" y="115" width="10" height="5" fill="#333"/>
    </svg>
  </motion.div>
);

// Stumps Animation Component
const Stumps = ({ className }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0.3 }}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 3, repeat: Infinity }}
  >
    <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
      <rect x="5" y="0" width="6" height="70" fill="#D2B48C"/>
      <rect x="27" y="0" width="6" height="70" fill="#D2B48C"/>
      <rect x="49" y="0" width="6" height="70" fill="#D2B48C"/>
      <rect x="0" y="15" width="60" height="4" fill="#8B4513"/>
      <rect x="0" y="25" width="60" height="4" fill="#8B4513"/>
    </svg>
  </motion.div>
);

// Sold Animation Overlay
const SoldAnimation = ({ player, team, onComplete }) => {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#E50914', '#ffffff', '#333']
    });
    
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="mb-8"
        >
          <img
            src={player.photo}
            alt={player.name}
            className="w-32 h-32 rounded-full mx-auto border-4 border-[#E50914] shadow-2xl"
          />
        </motion.div>
        
        <motion.h2
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.3 }}
          className="font-heading text-6xl font-bold text-[#E50914] mb-4 tracking-wider"
        >
          SOLD!
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-2xl text-white mb-2">{player.name}</p>
          <p className="text-xl text-gray-400">goes to</p>
          <p className="text-3xl font-heading text-white mt-2" style={{ color: team?.color }}>
            {team?.name}
          </p>
        </motion.div>
        
        {/* Flying animation to team */}
        <motion.div
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: 300, y: -100, scale: 0.3, opacity: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute"
        >
          <img
            src={player.photo}
            alt={player.name}
            className="w-20 h-20 rounded-full"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Team Player Card
const TeamPlayerCard = ({ player, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.08, y: -8 }}
    className="flex flex-col items-center p-3 rounded-lg bg-[#2F2F2F]/50 border border-[#404040] hover:border-[#E50914] hover:bg-[#E50914]/10 transition-all hover:shadow-lg hover:shadow-[#E50914]/30 cursor-pointer"
  >
    <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
      <img
        src={player.photo}
        alt={player.name}
        className="w-14 h-14 rounded-full object-cover border-2 border-[#E50914]/50 mb-2 shadow-md"
      />
    </motion.div>
    <p className="text-xs font-medium text-white text-center truncate w-full">{player.name.split(' ')[0]}</p>
    <Badge className={`text-[10px] mt-1 ${
      player.role.includes('Bat') ? 'bg-blue-600' :
      player.role.includes('Bowl') ? 'bg-green-600' :
      player.role.includes('All') ? 'bg-purple-600' : 'bg-orange-600'
    } text-white border-0`}>
      {player.role.includes('Bat') ? '🏏 Batsman' :
       player.role.includes('Bowl') ? '⚾ Bowler' :
       player.role.includes('All') ? '⭐ All-Rounder' : '🧤 Keeper'}
    </Badge>
  </motion.div>
);

const LiveView = () => {
  const {
    currentPlayer,
    currentBid,
    bidHistory,
    teams,
    auctionStatus,
    getPlayerStats,
    fetchPlayers,
    fetchTeams,
  } = useAuctionStore();

  const [showSoldAnimation, setShowSoldAnimation] = useState(false);
  const [soldPlayer, setSoldPlayer] = useState(null);
  const [soldTeam, setSoldTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const stats = getPlayerStats();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: false,
      easing: 'ease-out-cubic'
    });

    // Fetch players and teams from backend on mount
    fetchPlayers();
    fetchTeams();
  }, [fetchPlayers, fetchTeams]);

  // Load current user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
      // Find user's team if they're a team owner
      if (user.role === 'TEAM_OWNER' && user.teamId) {
        const team = teams.find(t => t.id === user.teamId);
        setUserTeam(team);
      }
    }
  }, [teams]);

  // Fetch current auction state on load
  useEffect(() => {
    const fetchAuctionState = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auction/state?seasonId=1');
        if (response.ok) {
          const data = await response.json();
          const auctionState = data.data;

          // If there's a current player on bid, set it
          if (auctionState.currentPlayer) {
            useAuctionStore.setState({
              currentPlayer: {
                id: auctionState.currentPlayer.id,
                formNumber: auctionState.currentPlayer.formNumber,
                name: auctionState.currentPlayer.name,
                category: auctionState.currentPlayer.category,
                role: auctionState.currentPlayer.playerType || 'All-Rounder',
                basePrice: parseFloat(auctionState.currentPlayer.basePrice) || 0,
                rating: parseFloat(auctionState.currentPlayer.rating) || 3,
                photo: auctionState.currentPlayer.photoUrl || `https://ui-avatars.com/api/?name=${auctionState.currentPlayer.name}&background=random&size=200`
              },
              currentBid: {
                amount: auctionState.currentPlayer.currentBid || auctionState.currentPlayer.basePrice,
                teamId: null,
                teamName: 'Base Price'
              },
              bidHistory: []
            });
            console.log('Loaded current player from auction state:', auctionState.currentPlayer.name);
          }
        }
      } catch (error) {
        console.error('Error fetching auction state:', error);
      }
    };

    fetchAuctionState();
  }, []);

  // Setup socket.io connection for real-time auction updates
  useEffect(() => {
    // Connect to socket as VIEWER
    socketService.connect('VIEWER');

    // Listen for player brought to bid
    socketService.on(socketService.constructor.EVENTS.PLAYER_ON_BID, (player) => {
      console.log('Player brought to bid:', player);
      useAuctionStore.setState({
        currentPlayer: player,
        currentBid: { amount: player.basePrice, teamId: null, teamName: 'Base Price' },
        bidHistory: []
      });
      toast.info(`${player.name} is now up for bidding!`);
    });

    // Listen for bid updates
    socketService.on(socketService.constructor.EVENTS.BID_UPDATE, (data) => {
      console.log('Bid update:', data);
      useAuctionStore.setState({
        currentBid: {
          amount: data.currentBid,
          teamId: data.leadingTeam.id,
          teamName: data.leadingTeam.name
        },
        bidHistory: data.bidHistory || []
      });
    });

    // Listen for player sold
    socketService.on(socketService.constructor.EVENTS.PLAYER_SOLD, (data) => {
      console.log('Player sold:', data);
      const team = teams.find(t => t.id === data.teamId);
      setSoldPlayer(data);
      setSoldTeam(team);
      setShowSoldAnimation(true);
    });

    // Listen for player unsold
    socketService.on(socketService.constructor.EVENTS.PLAYER_UNSOLD, () => {
      console.log('Player unsold');
      useAuctionStore.setState({
        currentPlayer: null,
        currentBid: null,
        bidHistory: []
      });
      toast.info('Player went unsold');
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [teams]);

  // Simulate sold animation (in real app, this would be triggered by socket event)
  const handleSoldDemo = () => {
    if (currentPlayer && currentBid?.teamId) {
      const team = teams.find(t => t.id === currentBid.teamId);
      setSoldPlayer(currentPlayer);
      setSoldTeam(team);
      setShowSoldAnimation(true);
    }
  };

  // Handle placing a bid
  const handlePlaceBid = async (bidAmount) => {
    if (!currentUser || !userTeam) {
      toast.error('Please log in as a team owner');
      return;
    }

    if (!currentPlayer) {
      toast.error('No player selected');
      return;
    }

    setIsPlacingBid(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auction/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          playerId: currentPlayer.id,
          teamId: userTeam.id,
          amount: bidAmount
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Bid placed successfully! ₹${(bidAmount / 100000).toFixed(2)}L`);
        // Update local state would happen via socket/polling in real app
      } else {
        toast.error(data.message || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Error placing bid. Please try again.');
    } finally {
      setIsPlacingBid(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-[#141414] via-[#141414]/95 to-[#141414]/80" />
      
      {/* Cricket Animations */}
      <CricketBall className="top-20 left-10 opacity-20" />
      <CricketBall className="top-40 right-20 opacity-15" />
      <CricketBall className="bottom-40 left-1/4 opacity-10" />
      <CricketBat className="top-32 right-10 opacity-10" />
      <Stumps className="bottom-20 right-1/4 opacity-10" />
      
      {/* Red spotlight */}
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#E50914]/15 to-transparent z-0" 
      />

      {/* Sold Animation Overlay */}
      <AnimatePresence>
        {showSoldAnimation && soldPlayer && soldTeam && (
          <SoldAnimation 
            player={soldPlayer} 
            team={soldTeam} 
            onComplete={() => setShowSoldAnimation(false)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-10 border-b border-[#333] bg-[#141414]/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <img
                src="https://static.wixstatic.com/media/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg/v1/fill/w_435,h_394,al_c,lg_1,q_80,enc_avif,quality_auto/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg"
                alt="KBN Logo"
                className="w-14 h-14 rounded-lg object-cover border border-[#E50914]/50"
              />
              <div>
                <h1 className="font-heading text-3xl font-bold text-white tracking-wider">
                  KBN PREMIER LEAGUE
                </h1>
                <p className="text-[#E50914] text-sm">Season 8 Live Auction</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-center px-4">
                  <p className="text-2xl font-heading font-bold text-white">{stats.sold}</p>
                  <p className="text-xs text-gray-500">SOLD</p>
                </div>
                <div className="w-px h-10 bg-[#333]" />
                <div className="text-center px-4">
                  <p className="text-2xl font-heading font-bold text-[#E50914]">{stats.available}</p>
                  <p className="text-xs text-gray-500">REMAINING</p>
                </div>
              </div>

              <Badge
                className={`text-base px-6 py-2.5 font-heading tracking-wider border-0 ${
                  auctionStatus === 'running' ? 'bg-[#E50914]' : 'bg-[#333]'
                } text-white`}
              >
                {auctionStatus === 'running' && (
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="mr-2"
                  >
                    <Radio className="h-4 w-4 inline" />
                  </motion.span>
                )}
                {auctionStatus === 'running' ? 'LIVE' : auctionStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Player Profile - Large Card */}
          <div className="lg:col-span-3" data-aos="fade-right">
            <AnimatePresence mode="wait">
              {currentPlayer ? (
                <motion.div
                  key={currentPlayer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="bg-[#181818]/95 border-[#333] backdrop-blur-lg overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Player Photo Section */}
                      <div className="relative p-8 flex items-center justify-center bg-gradient-to-br from-[#E50914]/10 to-transparent">
                        {/* Glow behind photo */}
                        <motion.div
                          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-64 h-64 rounded-full bg-[#E50914]/20 blur-3xl" />
                        </motion.div>
                        
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          className="relative cursor-pointer"
                        >
                          <motion.img
                            src={currentPlayer.photo}
                            alt={currentPlayer.name}
                            className="w-64 h-64 rounded-2xl object-cover shadow-2xl border-4 border-[#E50914]/50"
                            whileHover={{ borderColor: 'rgba(229, 9, 20, 1)' }}
                          />
                          
                          {/* Category Badge */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="absolute -top-4 -right-4"
                          >
                            <Badge className={`text-lg px-4 py-2 font-heading badge-cat-${currentPlayer.category.toLowerCase()}`}>
                              CAT {currentPlayer.category}
                            </Badge>
                          </motion.div>

                          {/* Form Number */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 form-highlight px-6 py-2 rounded-lg"
                          >
                            <span className="font-heading font-bold text-xl text-white">
                              #{currentPlayer.formNumber}
                            </span>
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Player Details Section */}
                      <div className="p-8 flex flex-col justify-center">
                        <motion.h2
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="font-heading text-4xl md:text-5xl font-bold text-white mb-2 tracking-wider"
                        >
                          {currentPlayer.name.toUpperCase()}
                        </motion.h2>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-3 mb-4"
                        >
                          <Badge className={`text-sm ${
                            currentPlayer.role.includes('Bat') ? 'bg-blue-600' : 
                            currentPlayer.role.includes('Bowl') ? 'bg-green-600' : 
                            currentPlayer.role.includes('All') ? 'bg-purple-600' : 'bg-orange-600'
                          } text-white border-0`}>
                            {currentPlayer.role.includes('Bat') ? '🏏 BATSMAN' : 
                             currentPlayer.role.includes('Bowl') ? '⚾ BOWLER' : 
                             currentPlayer.role.includes('All') ? '⭐ ALL-ROUNDER' : '🧤 WICKET KEEPER'}
                          </Badge>
                        </motion.div>

                        {/* Rating */}
                        <motion.div 
                          className="flex items-center gap-1 mb-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-6 w-6 ${
                                i < currentPlayer.rating
                                  ? 'text-white fill-white'
                                  : 'text-gray-700'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-gray-500">({currentPlayer.rating}/5)</span>
                        </motion.div>

                        {/* Price Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {/* Base Price Card */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="p-4 rounded-xl bg-[#2F2F2F] border border-[#404040]"
                          >
                            <p className="text-xs text-gray-500 mb-1">BASE PRICE</p>
                            <p className="font-heading text-3xl font-bold text-white">
                              {formatCurrency(currentPlayer.basePrice)}
                            </p>
                          </motion.div>

                          {/* Current Bid Card */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-[#E50914]/20 to-[#E50914]/5 border border-[#E50914]/30"
                          >
                            <p className="text-xs text-gray-400 mb-1">CURRENT BID</p>
                            <motion.p
                              key={currentBid?.amount}
                              initial={{ scale: 1.5 }}
                              animate={{ scale: 1 }}
                              className="font-heading text-3xl font-bold text-[#E50914]"
                            >
                              {formatCurrency(currentBid?.amount || currentPlayer.basePrice)}
                            </motion.p>
                          </motion.div>
                        </div>

                        {/* Leading Team */}
                        {currentBid?.teamName && currentBid.teamName !== 'Base Price' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-green-500/10 border border-green-500/30"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-gray-400">Leading Team</span>
                              </div>
                              <motion.span
                                key={currentBid.teamName}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="font-heading text-xl font-bold text-green-500"
                              >
                                {currentBid.teamName}
                              </motion.span>
                            </div>
                          </motion.div>
                        )}

                        {/* Timer */}
                        <div className="mt-6 flex justify-center">
                          <BidTimer size="large" />
                        </div>
                      </div>
                    </div>

                    {/* Bid History Bar */}
                    {bidHistory.length > 0 && (
                      <div className="border-t border-[#333] p-4 bg-[#141414]/50">
                        <div className="flex items-center gap-4 overflow-x-auto pb-2">
                          <span className="text-xs text-gray-500 whitespace-nowrap">RECENT BIDS:</span>
                          {bidHistory.slice(0, 6).map((bid, index) => (
                            <motion.div
                              key={bid.timestamp}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              whileHover={{ scale: 1.1, y: -2 }}
                              transition={{ delay: index * 0.05 }}
                              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
                                index === 0
                                  ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
                                  : 'bg-[#2F2F2F] text-gray-400 hover:bg-[#404040]'
                              }`}
                            >
                              <span className="text-xs">{bid.teamName}</span>
                              <span className="ml-2 font-bold text-sm">{formatCurrency(bid.amount)}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[500px] flex items-center justify-center"
                >
                  <Card className="bg-[#181818]/90 border-[#333] text-center py-16 px-12 backdrop-blur-lg">
                    <CardContent>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-32 h-32 rounded-full bg-[#2F2F2F] border border-[#404040] flex items-center justify-center mx-auto mb-6"
                      >
                        <Clock className="h-16 w-16 text-[#E50914]" />
                      </motion.div>
                      <h3 className="font-heading text-4xl font-bold text-white mb-2 tracking-wider">
                        WAITING FOR PLAYER
                      </h3>
                      <p className="text-gray-500">
                        Next player will appear shortly
                      </p>
                      
                      {/* Cricket ball animation */}
                      <motion.div
                        animate={{ x: [-100, 100, -100] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="mt-8"
                      >
                        <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
                          <circle cx="20" cy="20" r="18" fill="#E50914" stroke="#B20710" strokeWidth="2"/>
                          <path d="M8 20C8 20 14 12 20 12C26 12 32 20 32 20" stroke="white" strokeWidth="2" fill="none"/>
                          <path d="M8 20C8 20 14 28 20 28C26 28 32 20 32 20" stroke="white" strokeWidth="2" fill="none"/>
                        </svg>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bidding Panel - Show only for team owners */}
            {currentUser && currentUser.role === 'TEAM_OWNER' && currentPlayer && (
              <div className="mt-6">
                <BiddingPanel
                  currentPlayer={currentPlayer}
                  currentBid={currentBid}
                  team={userTeam}
                  onPlaceBid={handlePlaceBid}
                  isLoading={isPlacingBid}
                />
              </div>
            )}
          </div>

          {/* Team Standings with Player Lists */}
          <div className="lg:col-span-1" data-aos="fade-left">
            <Card className="bg-[#181818]/90 border-[#333] backdrop-blur-lg h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white font-heading tracking-wider">
                  <Trophy className="h-5 w-5 text-[#E50914]" />
                  TEAMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {teams.map((team, index) => {
                  const isLeading = currentBid?.teamId === team.id;
                  const isExpanded = selectedTeam === team.id;
                  
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Team Header */}
                      <motion.div
                        whileHover={{ scale: 1.03, x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTeam(isExpanded ? null : team.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isLeading
                            ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                            : 'border-[#333] bg-[#2F2F2F]/30 hover:border-[#E50914]/50 hover:bg-[#E50914]/5 hover:shadow-md hover:shadow-[#E50914]/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <motion.div
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ duration: 0.6 }}
                              className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold shadow-md"
                              style={{ backgroundColor: team.color }}
                            >
                              {team.name.charAt(0)}
                            </motion.div>
                            <div>
                              <span className="font-medium text-white text-sm">{team.name}</span>
                              {isLeading && (
                                <Badge className="ml-2 bg-green-500 text-white border-0 text-[10px]">
                                  LEADING
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-green-500 text-sm font-bold">
                            {formatCurrency(team.purse)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{team.players.length} players</span>
                          <span>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </motion.div>

                      {/* Expanded Team Players */}
                      <AnimatePresence>
                        {isExpanded && team.players.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-3 gap-2 p-3 bg-[#1a1a1a] rounded-b-lg border-x border-b border-[#333]">
                              {team.players.map((player, pIndex) => (
                                <TeamPlayerCard key={player.id} player={player} index={pIndex} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Show empty state */}
                      {isExpanded && team.players.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 bg-[#1a1a1a] rounded-b-lg border-x border-b border-[#333] text-center"
                        >
                          <p className="text-xs text-gray-500">No players yet</p>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveView;

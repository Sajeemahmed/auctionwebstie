import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Wallet, Users, Clock, CheckCircle, Flame, Loader } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../../components/layout/Navbar';
import CurrentPlayerDisplay from '../../components/auction/CurrentPlayerDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast } from 'sonner';
import socketService from '../../services/socketService';
import auctionService from '../../services/auctionService';
import teamService from '../../services/teamService';
import playerService from '../../services/playerService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatCurrency = (amount) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
};

const getPhotoUrl = (photoUrl) => {
  if (!photoUrl) return '/default-player.png';
  if (photoUrl.startsWith('http')) return photoUrl;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${photoUrl}`;
};

const OwnerBiddingLive = () => {
  // TODO: Get this from auth context or props
  const [currentTeamId] = useState(1); // Replace with actual team ID
  const seasonId = 1; // Replace with actual season ID

  const [myTeam, setMyTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [timer, setTimer] = useState(30);
  const [auctionStatus, setAuctionStatus] = useState('pending');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [mySquad, setMySquad] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: false,
      easing: 'ease-out-cubic'
    });

    // Load initial data
    loadTeamData();
    loadAllTeams();
    loadMySquad();

    // Connect to socket
    socketService.connect('TEAM_OWNER', currentTeamId);

    // Subscribe to socket events
    socketService.on(socketService.EVENTS.PLAYER_ON_BID, handlePlayerOnBid);
    socketService.on(socketService.EVENTS.BID_PLACED, handleBidPlaced);
    socketService.on(socketService.EVENTS.BID_UPDATE, handleBidUpdate);
    socketService.on(socketService.EVENTS.BID_INVALID, handleBidInvalid);
    socketService.on(socketService.EVENTS.PLAYER_SOLD, handlePlayerSold);
    socketService.on(socketService.EVENTS.PLAYER_UNSOLD, handlePlayerUnsold);
    socketService.on(socketService.EVENTS.TEAM_PURSE_UPDATED, handleTeamPurseUpdated);
    socketService.on(socketService.EVENTS.TIMER_TICK, handleTimerTick);
    socketService.on(socketService.EVENTS.AUCTION_STARTED, handleAuctionStarted);
    socketService.on(socketService.EVENTS.AUCTION_PAUSED, handleAuctionPaused);
    socketService.on(socketService.EVENTS.AUCTION_RESUMED, handleAuctionResumed);

    return () => {
      // Cleanup socket listeners
      socketService.off(socketService.EVENTS.PLAYER_ON_BID, handlePlayerOnBid);
      socketService.off(socketService.EVENTS.BID_PLACED, handleBidPlaced);
      socketService.off(socketService.EVENTS.BID_UPDATE, handleBidUpdate);
      socketService.off(socketService.EVENTS.BID_INVALID, handleBidInvalid);
      socketService.off(socketService.EVENTS.PLAYER_SOLD, handlePlayerSold);
      socketService.off(socketService.EVENTS.PLAYER_UNSOLD, handlePlayerUnsold);
      socketService.off(socketService.EVENTS.TEAM_PURSE_UPDATED, handleTeamPurseUpdated);
      socketService.off(socketService.EVENTS.TIMER_TICK, handleTimerTick);
      socketService.off(socketService.EVENTS.AUCTION_STARTED, handleAuctionStarted);
      socketService.off(socketService.EVENTS.AUCTION_PAUSED, handleAuctionPaused);
      socketService.off(socketService.EVENTS.AUCTION_RESUMED, handleAuctionResumed);

      socketService.disconnect();
    };
  }, []);

  // Load team data
  const loadTeamData = async () => {
    const result = await teamService.getTeamById(currentTeamId);
    if (result.success) {
      setMyTeam(result.data);
    }
  };

  // Load all teams
  const loadAllTeams = async () => {
    const result = await teamService.getAllTeams();
    if (result.success) {
      setTeams(result.data);
    }
  };

  // Load my squad (sold players for my team)
  const loadMySquad = async () => {
    const result = await playerService.getAllPlayers({
      seasonId,
      teamId: currentTeamId,
      status: 'SOLD'
    });
    if (result.success) {
      setMySquad(result.data);
    }
  };

  // Socket event handlers
  const handlePlayerOnBid = (data) => {
    console.log('Player on bid:', data);
    setCurrentPlayer({
      id: data.playerId,
      formNumber: data.formNumber,
      name: data.name,
      category: data.category,
      role: data.playerType,
      photo: getPhotoUrl(data.photoUrl),
      photoUrl: data.photoUrl,
      rating: data.rating || 4,
      basePrice: data.basePrice
    });
    setCurrentBid(null);
    setBidHistory([]);
    setTimer(30);
  };

  const handleBidPlaced = (data) => {
    console.log('Bid placed:', data);
    toast.info(`${data.teamName} bid ₹${formatCurrency(data.bidAmount)}`);
  };

  const handleBidUpdate = (data) => {
    console.log('Bid update:', data);
    setCurrentBid({
      amount: data.currentBid,
      teamId: data.leadingTeam?.id,
      teamName: data.leadingTeam?.name
    });
    setBidHistory(data.bidHistory || []);
  };

  const handleBidInvalid = (data) => {
    if (data.teamId === currentTeamId) {
      toast.error(data.reason);
    }
  };

  const handlePlayerSold = (data) => {
    console.log('Player sold:', data);

    // Show confetti if we won
    if (data.teamId === currentTeamId) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#E50914', '#ffffff', '#333']
      });
      toast.success(`🎉 You won ${data.playerName} for ${formatCurrency(data.finalAmount)}!`);

      // Reload squad
      loadMySquad();
    } else {
      toast.info(`${data.playerName} sold to ${data.teamName}`);
    }

    // Clear current player
    setCurrentPlayer(null);
    setCurrentBid(null);
    setBidHistory([]);
  };

  const handlePlayerUnsold = (data) => {
    console.log('Player unsold:', data);
    toast.info(`${data.playerName} went unsold`);
    setCurrentPlayer(null);
    setCurrentBid(null);
    setBidHistory([]);
  };

  const handleTeamPurseUpdated = (data) => {
    console.log('Team purse updated:', data);

    if (data.teamId === currentTeamId) {
      setMyTeam(prev => ({
        ...prev,
        purse: data.remainingPurse
      }));
    }

    // Update teams list
    setTeams(prev =>
      prev.map(t =>
        t.id === data.teamId ? { ...t, purse: data.remainingPurse } : t
      )
    );
  };

  const handleTimerTick = (data) => {
    setTimer(data.seconds);
  };

  const handleAuctionStarted = (data) => {
    console.log('Auction started:', data);
    setAuctionStatus('running');
    toast.success('Auction has started!');
  };

  const handleAuctionPaused = () => {
    setAuctionStatus('paused');
    toast.info('Auction paused');
  };

  const handleAuctionResumed = () => {
    setAuctionStatus('running');
    toast.success('Auction resumed');
  };

  const isLeading = currentBid?.teamId === currentTeamId;

  const bidIncrements = [
    { label: '+₹5K', value: 5000 },
    { label: '+₹10K', value: 10000 },
    { label: '+₹25K', value: 25000 },
    { label: '+₹50K', value: 50000 },
    { label: '+₹1L', value: 100000 },
  ];

  const handlePlaceBid = async (increment) => {
    if (!currentPlayer || !myTeam) return;

    setIsPlacingBid(true);
    const newBidAmount = (currentBid?.amount || currentPlayer.basePrice) + increment;

    if (newBidAmount > myTeam.purse) {
      toast.error('Insufficient purse!');
      setIsPlacingBid(false);
      return;
    }

    const result = await auctionService.placeBid(
      seasonId,
      currentPlayer.id,
      currentTeamId,
      newBidAmount
    );

    if (result.success) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#E50914', '#ffffff']
      });
      // Socket will handle the update
    } else {
      toast.error(result.error || 'Failed to place bid');
    }

    setIsPlacingBid(false);
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      {/* Hero Background */}
      <div className="relative">
        <div
          className="absolute inset-0 h-[300px]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 h-[300px] bg-gradient-to-b from-transparent via-[#141414]/80 to-[#141414]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Team Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4" data-aos="fade-right">
            {myTeam && (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-heading font-bold text-2xl shadow-lg bg-[#E50914]"
              >
                {myTeam.name?.charAt(0) || 'T'}
              </motion.div>
            )}
            <div>
              <h1 className="font-heading text-3xl font-bold text-white tracking-wider">
                {myTeam?.name || 'My Team'}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className="gap-1 bg-[#2F2F2F] text-white border-0">
                  <Wallet className="h-3 w-3" />
                  {formatCurrency(myTeam?.purse || 0)}
                </Badge>
                <Badge className="gap-1 bg-[#2F2F2F] text-white border-0">
                  <Users className="h-3 w-3" />
                  {mySquad.length || 0}/15
                </Badge>
              </div>
            </div>
          </div>

          {auctionStatus === 'running' && (
            <Badge className="bg-[#E50914] text-white border-0 text-sm px-4 py-2" data-aos="fade-left">
              <span className="w-2 h-2 rounded-full bg-white animate-ping mr-2" />
              LIVE AUCTION
            </Badge>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Player & Bidding */}
          <div className="lg:col-span-2 space-y-4" data-aos="fade-right">
            <CurrentPlayerDisplay
              player={currentPlayer}
              currentBid={currentBid}
              bidHistory={bidHistory}
            />

            {/* Bidding Controls */}
            {currentPlayer && auctionStatus === 'running' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
                data-aos="fade-up"
              >
                {isLeading && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center"
                  >
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-500">You are the leading bidder!</p>
                  </motion.div>
                )}

                <Card className={`bg-[#181818] border-[#333] ${isLeading ? 'opacity-75' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-white font-heading tracking-wider">
                      <Flame className="h-5 w-5 text-[#E50914]" />
                      QUICK BID
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {bidIncrements.map((increment, index) => {
                        const newTotal = (currentBid?.amount || currentPlayer.basePrice) + increment.value;
                        const canAfford = newTotal <= (myTeam?.purse || 0);

                        return (
                          <motion.div
                            key={increment.value}
                            whileTap={{ scale: 0.95 }}
                            data-aos="zoom-in"
                            data-aos-delay={index * 50}
                          >
                            <Button
                              size="lg"
                              className={`w-full h-16 flex flex-col font-heading tracking-wider ${
                                canAfford && !isLeading
                                  ? 'bg-[#E50914] hover:bg-[#F40612] text-white'
                                  : 'bg-[#333] text-gray-500 cursor-not-allowed'
                              }`}
                              onClick={() => handlePlaceBid(increment.value)}
                              disabled={isPlacingBid || isLeading || !canAfford || timer === 0}
                            >
                              {isPlacingBid ? (
                                <Loader className="h-6 w-6 animate-spin" />
                              ) : (
                                <>
                                  <span className="text-lg font-bold">{increment.label}</span>
                                  <span className="text-xs opacity-80">{formatCurrency(newTotal)}</span>
                                </>
                              )}
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!currentPlayer && (
              <Card className="bg-[#181818] border-[#333] text-center py-16" data-aos="fade-up">
                <CardContent>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-[#2F2F2F] border border-[#404040] flex items-center justify-center mx-auto mb-4"
                  >
                    <Clock className="h-10 w-10 text-[#E50914]" />
                  </motion.div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-2 tracking-wider">
                    WAITING FOR NEXT PLAYER
                  </h3>
                  <p className="text-gray-500">
                    The admin will bring a player to bid soon
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* My Squad Sidebar */}
          <div className="lg:col-span-1" data-aos="fade-left">
            <Card className="bg-[#181818] border-[#333] h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-white font-heading tracking-wider">
                  <span>MY SQUAD</span>
                  <Badge className="bg-[#E50914] text-white border-0">
                    {mySquad.length}/15
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[520px] px-4">
                  <div className="space-y-2 pb-4">
                    {mySquad.length > 0 ? (
                      <AnimatePresence mode="popLayout">
                        {mySquad.map((player, index) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-[#2F2F2F]/50 border border-[#404040] hover:border-[#E50914]/50 transition-all"
                          >
                            <img
                              src={getPhotoUrl(player.photoUrl)}
                              alt={player.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-white truncate">{player.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge className="text-xs bg-[#E50914] text-white">
                                  {player.category}
                                </Badge>
                                <span className="text-xs text-gray-500">{player.playerType}</span>
                              </div>
                            </div>
                            <span className="font-bold text-green-500 text-sm">
                              {formatCurrency(player.soldPrice)}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No players in squad yet</p>
                        <p className="text-sm mt-1">Start bidding to build your team!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerBiddingLive;

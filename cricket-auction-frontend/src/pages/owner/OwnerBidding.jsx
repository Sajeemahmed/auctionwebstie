import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { TrendingUp, Wallet, Users, Clock, SkipForward, CheckCircle, Flame } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../../components/layout/Navbar';
import CurrentPlayerDisplay from '../../components/auction/CurrentPlayerDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast } from 'sonner';
import useAuctionStore from '../../store/auctionStore';
import { useEffect } from 'react';

const formatCurrency = (amount) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
};

const OwnerBidding = () => {
  const {
    currentUser,
    teams,
    currentPlayer,
    currentBid,
    bidHistory,
    timer,
    auctionStatus,
    placeBid,
    fetchTeams,
    fetchPlayers,
  } = useAuctionStore();

  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [customBid, setCustomBid] = useState('');
  
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: false,
      easing: 'ease-out-cubic'
    });
  }, []);

  // Load live data from backend so owners get their actual team info
  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, [fetchTeams, fetchPlayers]);

  const myTeam = teams.find(
    t => String(t.id) === String(currentUser?.teamId || currentUser?.team?.id || '')
  );
  const isLeading = currentBid?.teamId === currentUser?.teamId;

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

    if (myTeam.players.length >= myTeam.maxPlayers) {
      toast.error('Team is full!');
      setIsPlacingBid(false);
      return;
    }

    const result = placeBid(myTeam.id, newBidAmount);

    if (result.success) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#E50914', '#ffffff']
      });
      toast.success(`Bid placed: ${formatCurrency(newBidAmount)}`);
    } else {
      toast.error(result.error || 'Failed to place bid');
    }

    setIsPlacingBid(false);
  };

  const handleCustomBid = async () => {
    if (!currentPlayer || !myTeam) return;

    const parsed = parseInt(customBid, 10);
    const baseline = currentBid?.amount || currentPlayer.basePrice;
    if (isNaN(parsed) || parsed <= baseline) {
      toast.error('Enter an amount higher than the current bid.');
      return;
    }

    const minIncrement = 5000;
    if (parsed - baseline < minIncrement) {
      toast.error(`Minimum increment is ₹${minIncrement}`);
      return;
    }

    if (parsed > myTeam.purse) {
      toast.error('Insufficient purse!');
      return;
    }

    const result = await placeBid(myTeam.id, parsed);
    if (result.success) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#E50914', '#ffffff']
      });
      toast.success(`Custom bid placed: ${formatCurrency(parsed)}`);
      setCustomBid('');
    } else {
      toast.error(result.error || 'Failed to place bid');
    }
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
                className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-heading font-bold text-2xl shadow-lg"
                style={{ backgroundColor: myTeam.color }}
              >
                {myTeam.name.charAt(0)}
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
                  {myTeam?.players.length || 0}/{myTeam?.maxPlayers || 15}
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
            {currentPlayer && (
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
                                canAfford
                                  ? 'bg-[#E50914] hover:bg-[#F40612] text-white'
                                  : 'bg-[#333] text-gray-500 cursor-not-allowed'
                              }`}
                              onClick={() => handlePlaceBid(increment.value)}
                              disabled={isPlacingBid || !canAfford || timer === 0}
                            >
                              <span className="text-lg font-bold">{increment.label}</span>
                              <span className="text-xs opacity-80">{formatCurrency(newTotal)}</span>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
                      <input
                        type="number"
                        min={(currentBid?.amount || currentPlayer.basePrice) + 1}
                        placeholder={`Enter more than ${formatCurrency(currentBid?.amount || currentPlayer.basePrice)}`}
                        value={customBid}
                        onChange={(e) => setCustomBid(e.target.value)}
                        className="w-full h-12 rounded-md bg-[#333] text-white px-3 border border-[#444] outline-none focus:border-[#E50914]"
                      />
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-[#E50914] hover:bg-[#F40612] text-white"
                        onClick={handleCustomBid}
                        disabled={isPlacingBid || timer === 0}
                      >
                        Place Custom Bid
                      </Button>
                    </div>

                    <div className="mt-4 text-center">
                      <Button variant="ghost" className="text-gray-500 hover:text-white gap-2">
                        <SkipForward className="h-4 w-4" />
                        Skip this player
                      </Button>
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
                    {myTeam?.players.length || 0}/{myTeam?.maxPlayers || 15}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[520px] px-4">
                  <div className="space-y-2 pb-4">
                    {myTeam?.players.length > 0 ? (
                      <AnimatePresence mode="popLayout">
                        {myTeam.players.map((player, index) => (
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
                              src={player.photo}
                              alt={player.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-white truncate">{player.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs badge-cat-${player.category.toLowerCase()}`}>
                                  {player.category}
                                </Badge>
                                <span className="text-xs text-gray-500">{player.role}</span>
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

export default OwnerBidding;

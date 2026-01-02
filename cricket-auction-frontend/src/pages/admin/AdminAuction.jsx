import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Play, Pause, Check, X, SkipForward, RotateCcw, Users, ChevronRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import PlayerCard from '../../components/auction/PlayerCard';
import CurrentPlayerDisplay from '../../components/auction/CurrentPlayerDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import useAuctionStore from '../../store/auctionStore';
import socketService from '../../services/socketService';

const AdminAuction = () => {
  const {
    players,
    teams,
    currentCategory,
    currentPlayer,
    currentBid,
    bidHistory,
    timer,
    isTimerRunning,
    auctionStatus,
    setCategory,
    bringPlayerToBid,
    soldPlayer,
    unsoldPlayer,
    pauseTimer,
    resumeTimer,
    startAuction,
    pauseAuction,
    resumeAuction,
    resetAuction,
    getAvailablePlayers,
    getUnsoldPlayers,
    getPlayerStats,
    fetchPlayers,
    fetchTeams,
  } = useAuctionStore();

  const [showSoldDialog, setShowSoldDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const stats = getPlayerStats();

  // Fetch players and teams from backend on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPlayers();
        await fetchTeams();
      } catch (error) {
        console.error('Error loading auction data:', error);
        toast.error('Failed to load auction data');
      }
    };
    loadData();
  }, [fetchPlayers, fetchTeams]);

  // Setup socket.io connection for real-time updates
  useEffect(() => {
    // Connect to socket as ADMIN
    socketService.connect('ADMIN');

    // Listen for timer end events - auto-sell player
    socketService.on(socketService.constructor.EVENTS.TIMER_ENDED, async () => {
      console.log('Timer ended, auto-selling player...');
      if (currentPlayer && currentBid?.teamId) {
        // Automatically mark player as sold
        setTimeout(() => handleSold(), 500);
      } else if (currentPlayer) {
        // No bids - mark as unsold
        setTimeout(() => handleUnsold(), 500);
      }
    });

    // Listen for bid placed events
    socketService.on(socketService.constructor.EVENTS.BID_PLACED, (data) => {
      console.log('Bid placed:', data);
      toast.success(`₹${(data.bidAmount / 100000).toFixed(2)}L bid by ${data.teamName}`);
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [currentPlayer, currentBid]);

  const categories = ['A', 'B', 'C', 'D', 'Unsold'];
  const availablePlayers = currentCategory === 'Unsold' 
    ? getUnsoldPlayers()
    : getAvailablePlayers(currentCategory);

  const handleSold = () => {
    if (!currentBid || !currentBid.teamId) {
      toast.error('No valid bid to confirm sale');
      return;
    }

    const result = soldPlayer();
    if (result.success) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setShowSoldDialog(true);
      toast.success(`Player sold to ${currentBid.teamName}!`);
    }
  };

  const handleUnsold = () => {
    const result = unsoldPlayer();
    if (result.success) {
      toast.info('Player marked as unsold');
    }
  };

  const handleReset = () => {
    resetAuction();
    setShowResetDialog(false);
    toast.success('Auction has been reset');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-2xl font-bold text-foreground">Live Auction Control</h1>
            <Badge
              variant={auctionStatus === 'running' ? 'destructive' : 'secondary'}
              className="text-sm"
            >
              {auctionStatus === 'running' && (
                <span className="w-2 h-2 rounded-full bg-current animate-ping mr-2" />
              )}
              {auctionStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {auctionStatus === 'idle' ? (
              <Button onClick={startAuction} className="gap-2">
                <Play className="h-4 w-4" />
                Start Auction
              </Button>
            ) : auctionStatus === 'running' ? (
              <Button onClick={pauseAuction} variant="warning" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button onClick={resumeAuction} className="gap-2">
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowResetDialog(true)}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Tabs value={currentCategory} onValueChange={setCategory}>
            <TabsList className="w-full justify-start h-auto p-1 gap-1 flex-wrap">
              {categories.map((cat) => {
                const count = cat === 'Unsold' 
                  ? stats.unsold 
                  : getAvailablePlayers(cat).length;
                const total = cat === 'Unsold'
                  ? stats.unsold
                  : players.filter(p => p.category === cat).length;
                
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <Badge
                      variant={cat === 'Unsold' ? 'secondary' : `cat${cat}`}
                      className="text-xs"
                    >
                      {cat}
                    </Badge>
                    <span className="text-sm">
                      {count}/{total}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Player Queue */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Player Queue
                  </span>
                  <Badge variant="secondary">
                    {availablePlayers.length} Available
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[520px] px-4">
                  <div className="space-y-3 pb-4">
                    <AnimatePresence mode="popLayout">
                      {availablePlayers.map((player, index) => (
                        <motion.div
                          key={player.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: Math.min(index * 0.05, 0.3) }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                        >
                          <img
                            src={player.photo}
                            alt={player.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {player.formNumber}
                              </Badge>
                              <Badge variant={`cat${player.category}`} className="text-xs">
                                {player.category}
                              </Badge>
                            </div>
                            <p className="font-medium truncate">{player.name}</p>
                            <p className="text-xs text-muted-foreground">{player.role}</p>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={async () => {
                              const result = await bringPlayerToBid(player.id);
                              if (!result.success) {
                                toast.error(result.error || 'Failed to bring player to bid');
                              }
                            }}
                            disabled={currentPlayer !== null}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {availablePlayers.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No players in this category</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Player & Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Current Player Display */}
            <CurrentPlayerDisplay
              player={currentPlayer}
              currentBid={currentBid}
              bidHistory={bidHistory}
            />

            {/* Action Buttons */}
            {currentPlayer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-3"
              >
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleSold}
                  disabled={!currentBid?.teamId}
                  className="flex-1 gap-2"
                >
                  <Check className="h-5 w-5" />
                  SOLD
                </Button>

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleUnsold}
                  className="flex-1 gap-2"
                >
                  <X className="h-5 w-5" />
                  UNSOLD
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={isTimerRunning ? pauseTimer : resumeTimer}
                  className="gap-2"
                >
                  {isTimerRunning ? (
                    <><Pause className="h-5 w-5" /> Pause</>
                  ) : (
                    <><Play className="h-5 w-5" /> Resume</>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Teams Quick View */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Team Standings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`p-3 rounded-lg border transition-all ${
                        currentBid?.teamId === team.id
                          ? 'border-success bg-success/10 shadow-success'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="font-medium text-sm truncate">{team.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{team.players.length} players</span>
                        <span className="font-semibold text-success">
                          ₹{(team.purse / 100000).toFixed(0)}L
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sold Dialog */}
        <Dialog open={showSoldDialog} onOpenChange={setShowSoldDialog}>
          <DialogContent className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="py-8"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-heading text-3xl font-bold text-success mb-2">SOLD!</h2>
              <p className="text-muted-foreground">Player has been successfully sold</p>
            </motion.div>
            <DialogFooter className="justify-center">
              <Button onClick={() => setShowSoldDialog(false)}>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Auction?</DialogTitle>
              <DialogDescription>
                This will reset all player statuses, team squads, and purses. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReset}>
                Reset Everything
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminAuction;

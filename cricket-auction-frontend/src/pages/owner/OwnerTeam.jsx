import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Wallet, Users, Download, Star, TrendingUp } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import TeamHeader from '../../components/layout/TeamHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import useAuctionStore from '../../store/auctionStore';

const formatCurrency = (amount) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
};

const OwnerTeam = () => {
  const { currentUser, teams } = useAuctionStore();
  const myTeam = teams.find(t => t.id === currentUser?.teamId);

  if (!myTeam) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Team not found</p>
        </div>
      </div>
    );
  }

  const spent = 10000000 - myTeam.purse;
  const spentPercentage = (spent / 10000000) * 100;
  const playersByCategory = {
    A: myTeam.players.filter(p => p.category === 'A'),
    B: myTeam.players.filter(p => p.category === 'B'),
    C: myTeam.players.filter(p => p.category === 'C'),
    D: myTeam.players.filter(p => p.category === 'D'),
  };

  const handleDownload = () => {
    const csvContent = myTeam.players.map(p => 
      `${p.formNumber},${p.name},${p.category},${p.role},${p.soldPrice}`
    ).join('\n');
    
    const blob = new Blob([`Form,Name,Category,Role,Price\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${myTeam.name.toLowerCase().replace(/\s+/g, '_')}_squad.csv`;
    a.click();
    toast.success('Team squad downloaded!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* New Team Header */}
      <TeamHeader 
        team={myTeam}
        stats={{
          playerCount: myTeam.players.length,
          maxPlayers: myTeam.maxPlayers,
          purseLeft: formatCurrency(myTeam.purse),
          season: '8'
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Wallet, label: 'Purse Left', value: formatCurrency(myTeam.purse), color: 'text-success' },
            { icon: TrendingUp, label: 'Total Spent', value: formatCurrency(spent), color: 'text-primary' },
            { icon: Users, label: 'Players', value: `${myTeam.players.length}/${myTeam.maxPlayers}`, color: 'text-amber-500' },
            { icon: Star, label: 'Avg Price', value: myTeam.players.length > 0 ? formatCurrency(spent / myTeam.players.length) : '₹0', color: 'text-accent' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`font-heading text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Budget Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Budget Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent: {formatCurrency(spent)}</span>
                  <span className="text-muted-foreground">Budget: ₹1 Crore</span>
                </div>
                <Progress value={spentPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground text-center">
                  {spentPercentage.toFixed(1)}% of budget utilized
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Squad by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">Squad List</h2>

          {myTeam.players.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(playersByCategory).map(([category, players]) => {
                if (players.length === 0) return null;
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={`cat${category}`} className="text-sm">
                        Category {category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {players.length} player{players.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {players.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                              <div className="flex items-center gap-4 p-4">
                                <img
                                  src={player.photo}
                                  alt={player.name}
                                  className="w-16 h-16 rounded-xl object-cover shadow"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      Form: {player.formNumber}
                                    </Badge>
                                  </div>
                                  <h3 className="font-semibold truncate">{player.name}</h3>
                                  <p className="text-sm text-muted-foreground">{player.role}</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 mb-1">
                                    {[...Array(player.rating)].map((_, i) => (
                                      <Star key={i} className="h-3 w-3 text-warning fill-warning" />
                                    ))}
                                  </div>
                                  <p className="font-bold text-success">
                                    {formatCurrency(player.soldPrice)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-16">
              <CardContent>
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Players Yet</h3>
                <p className="text-muted-foreground">Start bidding to build your squad!</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default OwnerTeam;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trophy, Users, Wallet, Download, Trash2, Edit2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import useAuctionStore from '../../store/auctionStore';

const formatCurrency = (amount) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
};

const AdminTeams = () => {
  const { teams, addTeam } = useAuctionStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');

  const handleAddTeam = () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }
    addTeam(newTeamName);
    setNewTeamName('');
    setShowAddDialog(false);
    toast.success(`${newTeamName} has been created!`);
  };

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setShowDetailsDialog(true);
  };

  const handleDownloadTeam = (team) => {
    const csvContent = team.players.map(p => 
      `${p.formNumber},${p.name},${p.category},${p.role},${p.soldPrice}`
    ).join('\n');
    
    const blob = new Blob([`Form,Name,Category,Role,Price\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${team.name.toLowerCase().replace(/\s+/g, '_')}_squad.csv`;
    a.click();
    toast.success(`${team.name} squad downloaded!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Team Management</h1>
            <p className="text-muted-foreground mt-1">{teams.length} teams registered</p>
          </div>

          <Button
            variant="default"
            onClick={() => setShowAddDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </motion.div>

        {/* Teams Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => {
            const spent = 10000000 - team.purse;
            const spentPercentage = (spent / 10000000) * 100;
            
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Team Header */}
                  <div
                    className="h-24 relative"
                    style={{ backgroundColor: team.color }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/20" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-background shadow-lg flex items-center justify-center">
                        <Trophy className="h-7 w-7" style={{ color: team.color }} />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-xl text-primary-foreground">
                          {team.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {team.players.length}/{team.maxPlayers} Players
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Purse Info */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Purse Left</span>
                        </div>
                        <span className="font-bold text-success">{formatCurrency(team.purse)}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Spent: {formatCurrency(spent)}</span>
                          <span>Budget: ₹1 Cr</span>
                        </div>
                        <Progress value={spentPercentage} className="h-2" />
                      </div>

                      {/* Recent Players */}
                      {team.players.length > 0 && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">Recent Signings</p>
                          <div className="flex flex-wrap gap-1">
                            {team.players.slice(-3).map((player) => (
                              <Badge key={player.id} variant="secondary" className="text-xs">
                                {player.name.split(' ')[0]}
                              </Badge>
                            ))}
                            {team.players.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{team.players.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewTeam(team)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          View Squad
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadTeam(team)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Add Team Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Add a new team to the auction. Default purse is ₹1 Crore.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Starting Purse</span>
                  <span className="font-semibold">₹1 Crore</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Max Players</span>
                  <span className="font-semibold">15</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTeam}>
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            {selectedTeam && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: selectedTeam.color }}
                    >
                      <Trophy className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {selectedTeam.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTeam.players.length} players • {formatCurrency(selectedTeam.purse)} remaining
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-96 overflow-y-auto">
                  {selectedTeam.players.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTeam.players.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant={`cat${player.category}`} className="text-xs">
                                  {player.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{player.role}</span>
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-success">
                            {formatCurrency(player.soldPrice)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No players in squad yet</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminTeams;

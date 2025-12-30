import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Upload, Download, Users, Grid, List } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import PlayerCard from '../../components/auction/PlayerCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import useAuctionStore from '../../store/auctionStore';

const AdminPlayers = () => {
  const { players, getPlayerStats } = useAuctionStore();
  const stats = getPlayerStats();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    { id: 'all', label: 'All Players', count: stats.total },
    { id: 'A', label: 'Category A', count: stats.catA, variant: 'catA' },
    { id: 'B', label: 'Category B', count: stats.catB, variant: 'catB' },
    { id: 'C', label: 'Category C', count: stats.catC, variant: 'catC' },
    { id: 'D', label: 'Category D', count: stats.catD, variant: 'catD' },
    { id: 'sold', label: 'Sold', count: stats.sold, variant: 'success' },
    { id: 'unsold', label: 'Unsold', count: stats.unsold, variant: 'secondary' },
  ];

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.formNumber.toString().includes(searchQuery) ||
        player.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (activeCategory === 'sold') {
        matchesCategory = player.status === 'sold';
      } else if (activeCategory === 'unsold') {
        matchesCategory = player.status === 'unsold';
      } else if (activeCategory !== 'all') {
        matchesCategory = player.category === activeCategory;
      }
      
      return matchesSearch && matchesCategory;
    });
  }, [players, searchQuery, activeCategory]);

  const handleUpload = () => {
    toast.info('Upload functionality is simulated. 178 players are pre-loaded.');
  };

  const handleDownload = () => {
    const csvContent = players.map(p => 
      `${p.formNumber},${p.name},${p.category},${p.role},${p.basePrice},${p.status}`
    ).join('\n');
    
    const blob = new Blob([`Form,Name,Category,Role,Base Price,Status\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kbn_players_season8.csv';
    a.click();
    toast.success('Players list downloaded!');
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
            <h1 className="font-heading text-3xl font-bold text-foreground">Player Management</h1>
            <p className="text-muted-foreground mt-1">{stats.total} players registered</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleUpload} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Excel
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8"
        >
          {categories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-xl border transition-all ${
                activeCategory === cat.id
                  ? 'border-primary bg-primary/5 shadow-glow-sm'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <Badge variant={cat.variant || 'default'} className="mb-2">
                {cat.count}
              </Badge>
              <p className="text-sm font-medium text-foreground">{cat.label}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, form number, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-4"
        >
          <p className="text-sm text-muted-foreground">
            Showing {filteredPlayers.length} of {stats.total} players
          </p>
        </motion.div>

        {/* Players Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${viewMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                >
                  <PlayerCard player={player} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No players found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminPlayers;

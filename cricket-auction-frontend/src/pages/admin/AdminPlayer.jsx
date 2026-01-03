import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Users, 
  Grid, 
  List,
  Plus,
  Loader,
  FileSpreadsheet,
  ChevronDown,
  X,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import PlayerCard from '../../components/auction/PlayerCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import playerService from '../../services/playerService';

const AdminPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byCategory: { A: 0, B: 0, C: 0, D: 0 },
    byStatus: { UNSOLD: 0, SOLD: 0, WITHDRAWN: 0, ON_BID: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Upload dialog
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPlayers();
    fetchStats();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    const result = await playerService.getAllPlayers({ seasonId: 1 });
    if (result.success) {
      setPlayers(result.data || []);
    } else {
      toast.error('Failed to load players: ' + result.error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const result = await playerService.getPlayerStats(1);
    if (result.success) {
      setStats(result.data);
    }
  };

  const categories = [
    { id: 'all', label: 'All Players', count: stats.total },
    { id: 'A', label: 'Category A', count: stats.byCategory.A, variant: 'catA' },
    { id: 'B', label: 'Category B', count: stats.byCategory.B, variant: 'catB' },
    { id: 'C', label: 'Category C', count: stats.byCategory.C, variant: 'catC' },
    { id: 'D', label: 'Category D', count: stats.byCategory.D, variant: 'catD' },
  ];

  const statusFilters = [
    { id: 'all', label: 'All Status', count: stats.total },
    { id: 'UNSOLD', label: 'Unsold', count: stats.byStatus.UNSOLD, variant: 'secondary' },
    { id: 'SOLD', label: 'Sold', count: stats.byStatus.SOLD, variant: 'success' },
    { id: 'ON_BID', label: 'On Bid', count: stats.byStatus.ON_BID, variant: 'warning' },
  ];

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.formNumber.toString().includes(searchQuery) ||
        (player.playerType && player.playerType.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = activeCategory === 'all' || player.category === activeCategory;
      
      // Status filter
      const matchesStatus = activeStatus === 'all' || player.status === activeStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [players, searchQuery, activeCategory, activeStatus]);

  const handleExcelChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid Excel file (.xlsx, .xls, or .csv)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setExcelFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!excelFile) {
      toast.error('Please select an Excel file');
      return;
    }

    setIsUploading(true);

    try {
      const result = await playerService.bulkUploadPlayers(excelFile, 1);

      if (result.success) {
        const { summary, details } = result.data;
        
        toast.success(
          `Upload completed! ${summary.successful} players added, ${summary.failed} failed, ${summary.duplicates} duplicates`
        );

        if (details.failed.length > 0) {
          console.error('Failed rows:', details.failed);
        }

        // Refresh players
        await fetchPlayers();
        await fetchStats();

        setShowUploadDialog(false);
        setExcelFile(null);
      } else {
        toast.error('Upload failed: ' + result.error);
      }
    } catch (error) {
      toast.error('An error occurred: ' + error.message);
    }

    setIsUploading(false);
  };

  const handlePhotoUpdate = (playerId, newPhotoUrl) => {
    // Update the player's photo URL in the local state
    setPlayers(prevPlayers =>
      prevPlayers.map(p =>
        p.id === playerId ? { ...p, photoUrl: newPhotoUrl } : p
      )
    );
  };

  const handleDownload = () => {
    const csvContent = players.map(p =>
      `${p.formNumber},${p.name},${p.category},${p.playerType},${p.basePrice},${p.status}`
    ).join('\n');

    const blob = new Blob([`Form Number,Name,Category,Player Type,Base Price,Status\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kbn_players_season8.csv';
    a.click();
    toast.success('Players list downloaded!');
  };

const handleDownloadTemplate = () => {
  const template = `Form Number,Name,Category,Player Type,Batting Hand,Batting Position,Bowling Arm,Bowling Type,DOB,Rating,Base Price
A001,Virat Kohli,A,BATSMAN,RH,Top Order,,,1988-11-05,5.0,200000
A002,Rohit Sharma,A,BATSMAN,RH,Top Order,,,1987-04-30,5.0,200000
A003,KL Rahul,A,WICKET_KEEPER,RH,Top Order,,,1992-04-18,4.8,180000
B001,Jasprit Bumrah,B,BOWLER,,,Right,Fast,1993-12-06,4.9,150000
B002,Mohammed Shami,B,BOWLER,,,Right,Fast,1990-09-03,4.7,140000
C001,Hardik Pandya,C,ALL_ROUNDER,RH,Middle Order,Right,Fast Medium,1993-10-11,4.6,120000
C002,Ravindra Jadeja,C,ALL_ROUNDER,LH,Lower Middle,Left,Slow Left Arm,1988-12-06,4.7,125000
D001,Shubman Gill,D,BATSMAN,RH,Top Order,,,1999-09-08,4.4,100000
D002,Ishan Kishan,D,WICKET_KEEPER,LH,Top Order,,,1998-07-18,4.2,95000`;
  
  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'kbn_players_upload_template.csv';
  link.click();
  toast.success('Template downloaded!');
};

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-2xl -z-10" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 p-8 shadow-lg">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                </motion.div>
                <h1 className="font-bold text-4xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Player Management
                </h1>
              </div>
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>{stats.total} players registered in auction</span>
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-start sm:justify-end">
              <Button variant="outline" onClick={() => setShowUploadDialog(true)} className="gap-2 border-primary/30 hover:border-primary/60">
                <Upload className="h-4 w-4" />
                Upload Excel
              </Button>
              <Button variant="outline" onClick={handleDownload} className="gap-2 border-primary/30 hover:border-primary/60">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Advanced Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-lg">
            {/* Filter Header */}
            <div className="flex items-center gap-3 mb-6">
              <Filter className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-lg text-blue-900">Advanced Filters</h2>
              {(activeCategory !== 'all' || activeStatus !== 'all') && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    setActiveCategory('all');
                    setActiveStatus('all');
                  }}
                  className="ml-auto px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Reset Filters
                </motion.button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Bar */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search players, form #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-white border-blue-300 focus:border-blue-500 rounded-xl"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full h-12 px-4 bg-white border border-blue-300 rounded-xl flex items-center justify-between hover:border-blue-500 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {activeCategory === 'all' ? 'All Categories' : `Category ${activeCategory}`}
                  </span>
                  <motion.div
                    animate={{ rotate: showCategoryDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-blue-600\" />
                  </motion.div>
                </button>

                {/* Category Dropdown Menu */}
                <AnimatePresence>
                  {showCategoryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="absolute top-14 left-0 right-0 bg-white border border-blue-200 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-xl"
                    >
                      {categories.map((cat, idx) => (
                        <motion.button
                          key={cat.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            setActiveCategory(cat.id);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-blue-50 transition-colors border-b border-blue-100 last:border-b-0 ${
                            activeCategory === cat.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-900'
                          }`}
                        >
                          <span>{cat.label}</span>
                          <Badge variant={cat.variant || 'default'} className="text-xs">
                            {cat.count}
                          </Badge>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full h-12 px-4 bg-white border border-blue-300 rounded-xl flex items-center justify-between hover:border-blue-500 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {activeStatus === 'all' ? 'All Status' : activeStatus}
                  </span>
                  <motion.div
                    animate={{ rotate: showStatusDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                  </motion.div>
                </button>

                {/* Status Dropdown Menu */}
                <AnimatePresence>
                  {showStatusDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="absolute top-14 left-0 right-0 bg-white border border-blue-200 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-xl"
                    >
                      {statusFilters.map((status, idx) => (
                        <motion.button
                          key={status.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            setActiveStatus(status.id);
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-blue-50 transition-colors border-b border-blue-100 last:border-b-0 ${
                            activeStatus === status.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-900'
                          }`}
                        >
                          <span>{status.label}</span>
                          <Badge variant={status.variant || 'default'} className="text-xs">
                            {status.count}
                          </Badge>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Mode Buttons */}
              <div className="flex items-center gap-2 bg-background/50 rounded-xl p-1 border border-border/50">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1 rounded-lg"
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1 rounded-lg"
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Summary */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-border/30 flex flex-wrap gap-2"
            >
              {(activeCategory !== 'all' || activeStatus !== 'all' || searchQuery !== '') && (
                <div className="flex flex-wrap gap-2 w-full items-center text-xs text-muted-foreground">
                  <span>Active filters:</span>
                  {activeCategory !== 'all' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-2"
                    >
                      Category: {activeCategory}
                      <button onClick={() => setActiveCategory('all')} className="hover:text-primary/60">
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  )}
                  {activeStatus !== 'all' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-2"
                    >
                      Status: {activeStatus}
                      <button onClick={() => setActiveStatus('all')} className="hover:text-primary/60">
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  )}
                  {searchQuery !== '' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-2"
                    >
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="hover:text-primary/60">
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold mb-1">TOTAL PLAYERS</p>
            <p className="text-2xl font-black text-foreground">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold mb-1">SOLD</p>
            <p className="text-2xl font-black text-green-600">{stats.byStatus.SOLD}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold mb-1">ON BID</p>
            <p className="text-2xl font-black text-yellow-600">{stats.byStatus.ON_BID}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold mb-1">UNSOLD</p>
            <p className="text-2xl font-black text-purple-600">{stats.byStatus.UNSOLD}</p>
          </div>
        </motion.div>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-6 px-2"
        >
          <p className="text-sm font-semibold text-foreground">
            <span className="text-primary">{filteredPlayers.length}</span> of <span className="text-primary">{stats.total}</span> players
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-64"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, linear: true }}>
                <Loader className="h-12 w-12 text-primary" />
              </motion.div>
              <p className="text-muted-foreground font-medium">Loading players...</p>
            </div>
          </motion.div>
        )}

        {/* Players Grid/List */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${activeStatus}-${viewMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: Math.min(index * 0.03, 0.5), type: 'spring' }}
                  >
                    <PlayerCard player={player} onPhotoUpdate={handlePhotoUpdate} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full py-20 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Users className="h-20 w-20 text-muted-foreground/40 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">No players found</h3>
                  <p className="text-muted-foreground text-lg">Try adjusting your filters or search query</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Players from Excel</DialogTitle>
              <DialogDescription>
                Upload an Excel file (.xlsx, .xls, or .csv) with player data
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Excel File</label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelChange}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                {excelFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {excelFile.name} ({(excelFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Need a template?</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Download our Excel template to see the required format
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTemplate}
                      className="gap-2"
                    >
                      <Download className="h-3 w-3" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <strong>Required columns:</strong> Form Number, Name, Category, Player Type
                  <br />
                  <strong>Optional columns:</strong> Batting Hand, Batting Position, Bowling Arm, Bowling Type, DOB, Rating, Base Price
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadDialog(false);
                  setExcelFile(null);
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button onClick={handleBulkUpload} disabled={isUploading || !excelFile}>
                {isUploading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Players
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminPlayers;
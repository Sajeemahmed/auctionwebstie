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
  FileSpreadsheet
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
            <Button variant="outline" onClick={() => setShowUploadDialog(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Excel
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Category Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Filter by Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
          </div>
        </motion.div>

        {/* Status Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Filter by Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statusFilters.map((status, index) => (
              <motion.button
                key={status.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.03 }}
                onClick={() => setActiveStatus(status.id)}
                className={`p-4 rounded-xl border transition-all ${
                  activeStatus === status.id
                    ? 'border-primary bg-primary/5 shadow-glow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <Badge variant={status.variant || 'default'} className="mb-2">
                  {status.count}
                </Badge>
                <p className="text-sm font-medium text-foreground">{status.label}</p>
              </motion.button>
            ))}
          </div>
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Players Grid */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${activeStatus}-${viewMode}`}
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
                    <PlayerCard player={player} onPhotoUpdate={handlePhotoUpdate} />
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
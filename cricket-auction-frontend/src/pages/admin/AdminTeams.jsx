import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trophy,
  Users,
  Wallet,
  Download,
  Trash2,
  Edit2,
  Loader,
  Upload,
  X,
  Tag,
  UserCircle,
  Building2,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import useAuctionStore from "../../store/auctionStore";
import teamService from "../../services/teamService";

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
  const [dbTeams, setDbTeams] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPurseDialog, setShowPurseDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Form fields
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamShortName, setNewTeamShortName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [newSponsorName, setNewSponsorName] = useState("");
  const [newSponsorAmount, setNewSponsorAmount] = useState("");
  
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamShortName, setEditTeamShortName] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editLogoPreview, setEditLogoPreview] = useState(null);
  const [purseAmount, setPurseAmount] = useState("");
  const [initialPurse, setInitialPurse] = useState("10000000");
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    const result = await teamService.getAllTeams();
    if (result.success) {
      setDbTeams(result.data || []);
    } else {
      toast.error("Failed to load teams: " + result.error);
    }
    setLoading(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleEditLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo must be less than 5MB");
        return;
      }
      
      setEditLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditLogo = () => {
    setEditLogoFile(null);
    setEditLogoPreview(null);
  };

  const addSponsor = () => {
    if (!newSponsorName.trim()) {
      toast.error("Please enter sponsor name");
      return;
    }
    const sponsor = {
      id: Date.now(),
      name: newSponsorName.trim(),
      amount: parseFloat(newSponsorAmount) || 0,
    };
    setSponsors([...sponsors, sponsor]);
    setNewSponsorName("");
    setNewSponsorAmount("");
  };

  const removeSponsor = (sponsorId) => {
    setSponsors(sponsors.filter(s => s.id !== sponsorId));
  };

  const resetForm = () => {
    setNewTeamName("");
    setNewTeamShortName("");
    setOwnerName("");
    setTagline("");
    setLogoFile(null);
    setLogoPreview(null);
    setSponsors([]);
    setNewSponsorName("");
    setNewSponsorAmount("");
    setInitialPurse("10000000");
  };

 const handleAddTeam = async () => {
  if (!newTeamName.trim()) {
    toast.error("Please enter a team name");
    return;
  }

  if (!initialPurse || isNaN(initialPurse) || parseFloat(initialPurse) <= 0) {
    toast.error("Please enter a valid initial purse amount");
    return;
  }

  setIsCreating(true);

  try {
    console.log('Creating team with sponsors:', sponsors);

    // Create team data object
    const teamData = {
      name: newTeamName.trim(),
      shortName: newTeamShortName.trim() || newTeamName.substring(0, 3).toUpperCase(),
      seasonId: 1,
      initialPurse: parseFloat(initialPurse),
      ownerName: ownerName.trim() || null,
      tagline: tagline.trim() || null,
      sponsors: sponsors, // Send as array, service will stringify it
    };

    console.log('Team data before sending:', teamData);

    const result = await teamService.createTeam(teamData);

    if (result.success) {
      const createdTeam = result.data;
      console.log('Team created successfully:', createdTeam);

      // If logo is selected, upload it
      if (logoFile) {
        console.log('Uploading logo...');
        const logoResult = await teamService.uploadTeamLogo(createdTeam.id, logoFile);
        if (logoResult.success) {
          console.log('Logo uploaded successfully');
        } else {
          console.warn('Logo upload failed:', logoResult.error);
          toast.warning("Team created but logo upload failed");
        }
      }

      // Update both local store and DB teams
      addTeam(newTeamName);
      await fetchTeams();

      resetForm();
      setShowAddDialog(false);
      toast.success(`${newTeamName} created successfully!`);
    } else {
      console.error('Team creation failed:', result.error);
      toast.error("Failed to create team: " + result.error);
    }
  } catch (error) {
    console.error('Exception during team creation:', error);
    toast.error("An error occurred: " + error.message);
  }

  setIsCreating(false);
};

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setShowDetailsDialog(true);
  };

  const handleOpenDetailsDialog = (team) => {
    setSelectedTeam(team);
    setShowDetailsDialog(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      const result = await teamService.deleteTeam(teamId);
      if (result.success) {
        await fetchTeams();
        toast.success("Team deleted successfully!");
      } else {
        toast.error("Failed to delete team: " + result.error);
      }
    }
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setEditTeamName(team.name);
    setEditTeamShortName(team.shortName || "");
    setEditOwnerName(team.ownerName || "");
    setEditTagline(team.tagline || "");
    setEditLogoPreview(
      team.logoImage || team.logoUrl
        ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${team.logoImage || team.logoUrl}`
        : null
    );
    setEditLogoFile(null);
    setShowEditDialog(true);
  };

  const handleSaveTeamUpdate = async () => {
    if (!editTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    setIsUpdating(true);
    
    // Prepare update data
    const updateData = {
      name: editTeamName.trim(),
      shortName: editTeamShortName.trim() || editTeamName.substring(0, 3).toUpperCase(),
      ownerName: editOwnerName.trim(),
      tagline: editTagline.trim(),
    };

    // Handle logo upload if a new file was selected
    if (editLogoFile) {
      const logoResult = await teamService.uploadTeamLogo(selectedTeam.id, editLogoFile);
      if (logoResult.success) {
        updateData.logoUrl = logoResult.data.logoUrl;
      } else {
        toast.error("Failed to upload logo: " + logoResult.error);
        setIsUpdating(false);
        return;
      }
    }

    const result = await teamService.updateTeam(selectedTeam.id, updateData);

    if (result.success) {
      await fetchTeams();
      setShowEditDialog(false);
      setEditLogoFile(null);
      setEditLogoPreview(null);
      toast.success("Team updated successfully!");
    } else {
      toast.error("Failed to update team: " + result.error);
    }
    setIsUpdating(false);
  };

  const handleOpenPurseDialog = (team) => {
    setSelectedTeam(team);
    setPurseAmount(team.remainingPurse?.toString() || "0");
    setShowPurseDialog(true);
  };

  const handleUpdatePurse = async () => {
    if (!purseAmount || isNaN(purseAmount) || parseFloat(purseAmount) < 0) {
      toast.error("Please enter a valid purse amount");
      return;
    }

    setIsUpdating(true);
    const result = await teamService.updateTeamPurse(
      selectedTeam.id,
      parseFloat(purseAmount)
    );

    if (result.success) {
      await fetchTeams();
      setShowPurseDialog(false);
      setPurseAmount("");
      toast.success("Team purse updated successfully!");
    } else {
      toast.error("Failed to update purse: " + result.error);
    }
    setIsUpdating(false);
  };

  const handleDownloadTeam = (team) => {
    const csvContent = (team.Players || [])
      .map(
        (p) =>
          `${p.formNumber || p.id},${p.name},${p.category},${p.role},${
            p.soldPrice
          }`
      )
      .join("\n");

    const blob = new Blob([`Form,Name,Category,Role,Price\n${csvContent}`], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${team.name.toLowerCase().replace(/\s+/g, "_")}_squad.csv`;
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
            <h1 className="font-bold text-4xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-gray-600 mt-1">
              {dbTeams.length > 0
                ? `${dbTeams.length} teams registered`
                : "No teams created yet"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Teams Grid */}
        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbTeams.length > 0 ? (
              dbTeams.map((team, index) => {
                const spent = (team.initialPurse || 10000000) - (team.remainingPurse || 0);
                const spentPercentage = (spent / (team.initialPurse || 10000000)) * 100;
                const players = team.Players || [];
                const teamSponsors = team.sponsors || [];

                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    className="group h-full"
                  >
                    <Card className="relative overflow-hidden transition-all duration-300 flex flex-col h-full border border-gray-200 bg-white hover:shadow-lg hover:border-red-300">
                      {/* Team Header - Logo and Name Section */}
                      <div className="px-4 py-4 flex items-center gap-4 border-b border-gray-100 bg-white">
                        {/* Logo */}
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-red-300">
                          {team.logoImage || team.logoUrl ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${team.logoImage || team.logoUrl}`}
                              alt={team.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg></div>';
                              }}
                            />
                          ) : (
                            <Trophy className="h-8 w-8 text-white" />
                          )}
                        </div>

                        {/* Team Name */}
                        <div className="flex-grow">
                          <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-bold text-lg leading-tight"
                          >
                            {team.name}
                            {team.shortName && (
                              <span className="text-red-600 ml-2 font-bold text-sm">[{team.shortName}]</span>
                            )}
                          </motion.h3>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="px-4 py-3 flex-grow flex flex-col justify-between bg-white">
                        {/* Owner and Tagline Info */}
                        <div>
                          {/* Owner Info */}
                          {team.ownerName && (
                            <motion.p
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 }}
                              className="text-red-700 text-xs font-semibold uppercase tracking-wide"
                            >
                              👤 Owner: {team.ownerName}
                            </motion.p>
                          )}

                          {/* Tagline */}
                          {team.tagline && (
                            <motion.p
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="text-gray-600 text-xs italic mt-1 line-clamp-2"
                            >
                              "{team.tagline}"
                            </motion.p>
                          )}
                        </div>

                        {/* Team Stats */}
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {/* Players Count */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-semibold">Players</span>
                            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                              {players.length}/{team.maxSquadSize || 15}
                            </Badge>
                          </div>

                          {/* Purse Info */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500 font-semibold">Purse Left</span>
                              <span className="text-sm font-bold text-orange-600">
                                {formatCurrency(team.remainingPurse || 10000000)}
                              </span>
                            </div>
                            <Progress value={spentPercentage} className="h-2" />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex gap-2">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetailsDialog(team)}
                            className="w-full text-xs border-red-300 text-red-600 hover:bg-red-50"
                          >
                            View Details
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTeam(team)}
                            className="text-xs border-gray-300 hover:bg-gray-100"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-12"
              >
                <Trophy className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Teams Yet</h3>
                <p className="text-gray-500 text-sm mb-4">Create your first team to get started</p>
                <Button
                  onClick={() => setShowAddDialog(true)}
              className="gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4" />
                  Create First Team
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {/* Add Team Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Add a new team with complete details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Team Logo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Logo</label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-border"
                      />
                      <button
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={isCreating}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5MB • PNG, JPG, WEBP
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Name *</label>
                  <Input
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Short Name</label>
                  <Input
                    placeholder="e.g., MW"
                    value={newTeamShortName}
                    onChange={(e) => setNewTeamShortName(e.target.value)}
                    maxLength="5"
                    disabled={isCreating}
                  />
                </div>
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner Name</label>
                <Input
                  placeholder="Enter owner name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Tagline</label>
                <Input
                  placeholder="Enter team tagline or motto"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              {/* Initial Purse */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Initial Purse (in ₹)
                </label>
                <Input
                  type="number"
                  placeholder="10000000"
                  value={initialPurse}
                  onChange={(e) => setInitialPurse(e.target.value)}
                  min="1"
                  disabled={isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  Current: ₹
                  {initialPurse
                    ? parseFloat(initialPurse).toLocaleString("en-IN")
                    : "0"}
                </p>
              </div>

              {/* Sponsors */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sponsors</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Sponsor name"
                    value={newSponsorName}
                    onChange={(e) => setNewSponsorName(e.target.value)}
                    disabled={isCreating}
                  />
                  <Input
                    type="number"
                    placeholder="Amount (optional)"
                    value={newSponsorAmount}
                    onChange={(e) => setNewSponsorAmount(e.target.value)}
                    className="w-40"
                    disabled={isCreating}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSponsor}
                    disabled={isCreating}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {sponsors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sponsors.map((sponsor) => (
                      <Badge
                        key={sponsor.id}
                        variant="secondary"
                        className="pr-1"
                      >
                        {sponsor.name}
                        {sponsor.amount > 0 && ` (₹${sponsor.amount.toLocaleString()})`}
                        <button
                          onClick={() => removeSponsor(sponsor.id)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Players</span>
                  <span className="font-semibold">15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sponsors Added</span>
                  <span className="font-semibold">{sponsors.length}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTeam} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Other dialogs remain the same... */}
        {/* Team Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            {selectedTeam && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-600 overflow-hidden">
                      {selectedTeam.logoImage || selectedTeam.logoUrl ? (
                        <img 
                          src={selectedTeam.logoImage || selectedTeam.logoUrl} 
                          alt={selectedTeam.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy className="h-5 w-5 text-primary-foreground" />
                      )}
                    </div>
                    {selectedTeam.name}
                  </DialogTitle>
                  <DialogDescription>
                    {(selectedTeam.Players || []).length} players •{" "}
                    {formatCurrency(selectedTeam.remainingPurse || 0)} remaining
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-96 overflow-y-auto">
                  {(selectedTeam.Players || []).length > 0 ? (
                    <div className="space-y-2">
                      {selectedTeam.Players.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            {player.photo && (
                              <img
                                src={player.photo}
                                alt={player.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <div className="flex items-center gap-2">
                                {player.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {player.category}
                                  </Badge>
                                )}
                                {player.role && (
                                  <span className="text-xs text-muted-foreground">
                                    {player.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-success">
                            {formatCurrency(player.soldPrice || 0)}
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

        {/* Edit Team Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Team Details</DialogTitle>
              <DialogDescription>Update all team information including logo</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Team Logo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Logo</label>
                <div className="flex items-center gap-4">
                  {editLogoPreview ? (
                    <div className="relative">
                      <img
                        src={editLogoPreview}
                        alt="Logo preview"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-border"
                      />
                      <button
                        onClick={removeEditLogo}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label
                      htmlFor="edit-logo-input"
                      className="flex items-center justify-center px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted text-sm font-medium"
                    >
                      Upload Logo
                    </label>
                    <input
                      id="edit-logo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleEditLogoChange}
                      disabled={isUpdating}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Max 5MB. Formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Name *</label>
                <Input
                  placeholder="Enter team name"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  disabled={isUpdating}
                />
              </div>

              {/* Short Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Name</label>
                <Input
                  placeholder="e.g., RW (optional)"
                  value={editTeamShortName}
                  onChange={(e) => setEditTeamShortName(e.target.value)}
                  maxLength="5"
                  disabled={isUpdating}
                />
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner Name</label>
                <Input
                  placeholder="Enter owner/captain name"
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  disabled={isUpdating}
                />
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Tagline</label>
                <Textarea
                  placeholder="e.g., 'Play with passion, win with pride'"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  disabled={isUpdating}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditLogoFile(null);
                  setEditLogoPreview(null);
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveTeamUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Purse Dialog */}
        <Dialog open={showPurseDialog} onOpenChange={setShowPurseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Team Balance</DialogTitle>
              <DialogDescription>
                {selectedTeam &&
                  `Manage purse balance for ${selectedTeam.name}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedTeam && (
                <>
                  <div className="p-4 rounded-lg bg-muted space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Team:</span>
                      <span className="font-semibold">{selectedTeam.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Initial Purse:
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(selectedTeam.initialPurse || 10000000)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Current Balance:
                      </span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedTeam.remainingPurse || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      New Balance Amount *
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter new purse amount"
                      value={purseAmount}
                      onChange={(e) => setPurseAmount(e.target.value)}
                      disabled={isUpdating}
                      min="0"
                      step="100000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the total remaining balance amount in rupees
                    </p>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPurseDialog(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdatePurse} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Balance"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminTeams;

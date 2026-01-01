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
    setShowEditDialog(true);
  };

  const handleSaveTeamUpdate = async () => {
    if (!editTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    setIsUpdating(true);
    const result = await teamService.updateTeam(selectedTeam.id, {
      name: editTeamName.trim(),
      shortName: editTeamShortName.trim() || editTeamName.substring(0, 3).toUpperCase(),
    });

    if (result.success) {
      await fetchTeams();
      setShowEditDialog(false);
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
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Team Management
            </h1>
            <p className="text-muted-foreground mt-1">
              {dbTeams.length > 0
                ? `${dbTeams.length} teams registered`
                : "No teams created yet"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
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
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Team Header with Better Logo */}
              <div className="h-32 relative bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/20" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  {/* Larger Logo Display */}
                  <div className="w-16 h-16 rounded-xl bg-background shadow-xl flex items-center justify-center overflow-hidden ring-2 ring-white/20">
                    {team.logoImage || team.logoUrl ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${team.logoImage || team.logoUrl}`}
                        alt={team.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', team.logoImage || team.logoUrl);
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg></div>';
                        }}
                      />
                    ) : (
                      <Trophy className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-xl text-primary-foreground">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {players.length}/{team.maxSquadSize || 15} Players
                      </Badge>
                      {team.shortName && (
                        <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                          {team.shortName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Owner & Tagline */}
                {(team.ownerName || team.tagline) && (
                  <div className="mb-4 p-3 rounded-lg bg-muted/30 space-y-2">
                    {team.ownerName && (
                      <div className="flex items-center gap-2 text-sm">
                        <UserCircle className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Owner:</span>
                        <span className="font-semibold text-foreground">{team.ownerName}</span>
                      </div>
                    )}
                    {team.tagline && (
                      <div className="flex items-start gap-2 text-sm">
                        <Tag className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-muted-foreground italic">"{team.tagline}"</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Sponsors */}
                {teamSponsors.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                        Sponsors ({teamSponsors.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teamSponsors.map((sponsor, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100"
                        >
                          {sponsor.name}
                          {sponsor.amount > 0 && (
                            <span className="ml-1 opacity-70">
                              • ₹{(sponsor.amount / 100000).toFixed(1)}L
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purse Info */}
                <div className="space-y-4">
                  <div
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleOpenPurseDialog(team)}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Purse Left
                      </span>
                    </div>
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-lg">
                      {formatCurrency(team.remainingPurse || 10000000)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Spent: {formatCurrency(spent)}</span>
                      <span>
                        Initial: {formatCurrency(team.initialPurse || 10000000)}
                      </span>
                    </div>
                    <Progress value={spentPercentage} className="h-2" />
                  </div>

                  {/* Team Info */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Short Name:</span>
                      <Badge variant="outline">{team.shortName || "N/A"}</Badge>
                    </div>
                  </div>

                  {/* Primary Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenPurseDialog(team)}
                    >
                      <Wallet className="h-4 w-4 mr-1" />
                      Balance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewTeam(team)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Squad
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditTeam(team)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownloadTeam(team)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })
    ) : (
      <div className="col-span-full text-center py-12">
        <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg text-muted-foreground">No teams created yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Click 'Create Team' to add your first team
        </p>
      </div>
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600 overflow-hidden">
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team Details</DialogTitle>
              <DialogDescription>Update team information</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Name *</label>
                <Input
                  placeholder="Enter team name"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  disabled={isUpdating}
                />
              </div>

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
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
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
                      <span className="font-semibold text-blue-600">
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
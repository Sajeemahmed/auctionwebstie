import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Upload, Save, X, Camera, User, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import playerService from '../../services/playerService';

const PlayerRegistration = () => {
  const seasonId = 1; // Replace with actual season ID

  const [formData, setFormData] = useState({
    formNumber: '',
    name: '',
    dateOfBirth: '',
    category: 'A',
    playerType: 'BATSMAN',
    battingHand: '',
    battingPosition: '',
    bowlingArm: '',
    bowlingType: '',
    rating: 3,
    basePrice: 50000,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'A', label: 'Category A', color: 'bg-red-600' },
    { value: 'B', label: 'Category B', color: 'bg-orange-600' },
    { value: 'C', label: 'Category C', color: 'bg-yellow-600' },
    { value: 'D', label: 'Category D', color: 'bg-green-600' },
  ];

  const playerTypes = [
    { value: 'BATSMAN', label: '🏏 Batsman' },
    { value: 'BOWLER', label: '⚾ Bowler' },
    { value: 'ALL_ROUNDER', label: '⭐ All-Rounder' },
    { value: 'WICKET_KEEPER', label: '🧤 Wicket Keeper' },
  ];

  const battingHands = [
    { value: 'RH', label: 'Right Handed (RH)' },
    { value: 'LH', label: 'Left Handed (LH)' },
  ];

  const battingPositions = [
    'Top Order',
    'Middle Order',
    'Lower Order',
    'Lower Middle',
    'Opener',
  ];

  const bowlingArms = [
    { value: 'Right', label: 'Right Arm' },
    { value: 'Left', label: 'Left Arm' },
  ];

  const bowlingTypes = [
    'Fast',
    'Fast Medium',
    'Medium',
    'Slow',
    'Leg Spin',
    'Off Spin',
    'Slow Left Arm',
    'Chinaman',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const validateForm = () => {
    if (!formData.formNumber) {
      toast.error('Form Number is required');
      return false;
    }
    if (!formData.name) {
      toast.error('Player Name is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      toast.error('Date of Birth is required');
      return false;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return false;
    }
    if (!formData.playerType) {
      toast.error('Player Type is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create player
      const playerData = {
        seasonId,
        formNumber: formData.formNumber,
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        category: formData.category,
        playerType: formData.playerType,
        battingHand: formData.battingHand || null,
        battingPosition: formData.battingPosition || null,
        bowlingArm: formData.bowlingArm || null,
        bowlingType: formData.bowlingType || null,
        rating: parseFloat(formData.rating) || 3,
        basePrice: parseFloat(formData.basePrice) || 50000,
      };

      const result = await playerService.createPlayer(playerData);

      if (result.success) {
        const playerId = result.data.id;

        // Step 2: Upload photo if provided
        if (photoFile) {
          const photoResult = await playerService.uploadPlayerPhoto(playerId, photoFile);

          if (!photoResult.success) {
            toast.warning('Player created but photo upload failed: ' + photoResult.error);
          }
        }

        toast.success(`✅ Player ${formData.name} registered successfully!`);

        // Reset form
        setFormData({
          formNumber: '',
          name: '',
          dateOfBirth: '',
          category: 'A',
          playerType: 'BATSMAN',
          battingHand: '',
          battingPosition: '',
          bowlingArm: '',
          bowlingType: '',
          rating: 3,
          basePrice: 50000,
        });
        setPhotoFile(null);
        setPhotoPreview(null);
      } else {
        toast.error('Registration failed: ' + result.error);
      }
    } catch (error) {
      toast.error('An error occurred: ' + error.message);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      <header className="sticky top-0 z-50 bg-card/95 border-b border-border backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="https://static.wixstatic.com/media/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg/v1/fill/w_435,h_394,al_c,lg_1,q_80,enc_avif,quality_auto/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg"
                alt="KBN Logo"
                className="h-10 w-10 rounded object-cover"
              />
              <div>
                <h1 className="font-heading font-bold text-lg text-foreground leading-tight tracking-wider">
                  KBN PREMIER LEAGUE
                </h1>
                <p className="text-xs text-primary">Player Registration</p>
              </div>
            </div>

            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Player Registration</h1>
              <p className="text-muted-foreground">Register a new player for the auction</p>
            </div>
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
                <CardDescription>Fill in all required details to register a player</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-border rounded-lg bg-muted/30">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Player preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  <div className="text-center">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                        <span className="font-medium">
                          {photoPreview ? 'Change Photo' : 'Upload Photo'}
                        </span>
                      </div>
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Form Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="formNumber"
                      value={formData.formNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., A001, B050"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Player Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Date of Birth <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Base Price (₹)
                    </label>
                    <Input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.category === cat.value
                            ? `${cat.color} text-white border-transparent shadow-lg`
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <div className="font-heading font-bold text-lg">{cat.value}</div>
                        <div className="text-xs mt-1 opacity-90">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Player Type <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {playerTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, playerType: type.value }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.playerType === type.value
                            ? 'bg-primary text-primary-foreground border-transparent shadow-lg'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium text-sm">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Player Rating (1-5)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                      step="0.5"
                      className="flex-1"
                    />
                    <Badge variant="outline" className="min-w-[60px] justify-center">
                      {formData.rating} ⭐
                    </Badge>
                  </div>
                </div>

                {/* Batting Details */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    🏏 Batting Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Batting Hand</label>
                      <select
                        name="battingHand"
                        value={formData.battingHand}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      >
                        <option value="">Select...</option>
                        {battingHands.map((hand) => (
                          <option key={hand.value} value={hand.value}>
                            {hand.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Batting Position</label>
                      <select
                        name="battingPosition"
                        value={formData.battingPosition}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      >
                        <option value="">Select...</option>
                        {battingPositions.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bowling Details */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    ⚾ Bowling Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bowling Arm</label>
                      <select
                        name="bowlingArm"
                        value={formData.bowlingArm}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      >
                        <option value="">Select...</option>
                        {bowlingArms.map((arm) => (
                          <option key={arm.value} value={arm.value}>
                            {arm.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bowling Type</label>
                      <select
                        name="bowlingType"
                        value={formData.bowlingType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      >
                        <option value="">Select...</option>
                        {bowlingTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Player Profile Preview */}
                {formData.name && (
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold mb-3">Profile Preview</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Form Number:</span>
                        <span className="font-medium">{formData.formNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="outline">{formData.category}</Badge>
                      </div>
                      {formData.battingHand && formData.battingPosition && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Batting:</span>
                          <span className="font-medium">
                            {formData.battingHand}: {formData.battingPosition}
                          </span>
                        </div>
                      )}
                      {formData.bowlingArm && formData.bowlingType && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bowling:</span>
                          <span className="font-medium">
                            {formData.bowlingArm} Arm: {formData.bowlingType}
                          </span>
                        </div>
                      )}
                      {formData.dateOfBirth && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date of Birth:</span>
                          <span className="font-medium">
                            {new Date(formData.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Register Player
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        formNumber: '',
                        name: '',
                        dateOfBirth: '',
                        category: 'A',
                        playerType: 'BATSMAN',
                        battingHand: '',
                        battingPosition: '',
                        bowlingArm: '',
                        bowlingType: '',
                        rating: 3,
                        basePrice: 50000,
                      });
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default PlayerRegistration;

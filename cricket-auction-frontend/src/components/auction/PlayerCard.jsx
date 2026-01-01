import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Flame, Upload, Loader } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import playerService from '../../services/playerService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatCurrency = (amount) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
};

const getPhotoUrl = (photoUrl) => {
  if (!photoUrl) return '/default-player.png';
  if (photoUrl.startsWith('http')) return photoUrl;
  // Remove /api from API_BASE_URL if present and add the photoUrl
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${photoUrl}`;
};

const getCategoryBadge = (category) => {
  const variants = {
    'A': 'catA',
    'B': 'catB',
    'C': 'catC',
    'D': 'catD'
  };
  return variants[category] || 'default';
};

const PlayerCard = ({ player, showBidButton, onBringToBid, isHighlighted, size = 'default', onPhotoUpdate }) => {
  const isLarge = size === 'large';
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [localPhotoUrl, setLocalPhotoUrl] = useState(player.photoUrl);
  const fileInputRef = useRef(null);

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

    setIsUploadingPhoto(true);

    try {
      const result = await playerService.uploadPlayerPhoto(player.id, file);

      if (result.success) {
        const newPhotoUrl = result.data.photoUrl;
        setLocalPhotoUrl(newPhotoUrl);
        toast.success(`Photo uploaded successfully for ${player.name}!`);

        // Notify parent component if callback provided
        if (onPhotoUpdate) {
          onPhotoUpdate(player.id, newPhotoUrl);
        }
      } else {
        toast.error('Failed to upload photo: ' + result.error);
      }
    } catch (error) {
      toast.error('An error occurred while uploading photo');
    }

    setIsUploadingPhoto(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isHighlighted ? 1 : 1.03, y: isHighlighted ? 0 : -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`${isHighlighted ? 'relative' : ''} card-hover`}
    >
      {isHighlighted && (
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 blur-xl" 
        />
      )}
      
      <Card className={`relative overflow-hidden transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm ${
        isHighlighted 
          ? 'border-2 border-primary shadow-glow-lg bg-card' 
          : 'hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30'
      } ${player.status === 'sold' ? 'opacity-75' : ''}`}>
        
        {/* Form Number Badge - Highlighted */}
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className={`absolute top-3 right-3 z-10 ${
            isHighlighted ? 'form-highlight' : 'bg-gradient-to-r from-primary to-primary-dark'
          } text-primary-foreground px-3 py-1.5 rounded-lg font-heading font-bold text-sm shadow-lg tracking-wider`}
        >
          FORM: {player.formNumber}
        </motion.div>
        
        {/* Status Badge */}
        {player.status !== 'available' && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant={player.status === 'sold' ? 'success' : 'secondary'}>
              {player.status.toUpperCase()}
            </Badge>
          </div>
        )}
        
        {/* Hot Badge for Category A */}
        {player.category === 'A' && player.status === 'available' && (
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-3 left-3 z-10"
          >
            <Badge className="bg-accent text-accent-foreground gap-1">
              <Flame className="h-3 w-3" />
              HOT
            </Badge>
          </motion.div>
        )}
        
        <CardContent className={`p-0 ${isLarge ? 'flex' : ''}`}>
          {/* Player Photo */}
          <div className={`relative overflow-hidden group ${
            isLarge ? 'w-48 h-48 flex-shrink-0' : 'w-full aspect-square'
          }`}>
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handlePhotoChange}
              className="hidden"
            />

            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
              src={getPhotoUrl(localPhotoUrl || player.photoUrl || player.photo)}
              alt={player.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

            {/* Photo Upload Overlay */}
            <div
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
              onClick={handlePhotoClick}
            >
              {isUploadingPhoto ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader className="h-8 w-8 text-white animate-spin" />
                  <span className="text-white text-sm font-medium">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-white" />
                  <span className="text-white text-sm font-medium">Upload Photo</span>
                </div>
              )}
            </div>

            {/* Category Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge variant={getCategoryBadge(player.category)} className="text-xs font-heading tracking-wider">
                CATEGORY {player.category}
              </Badge>
            </div>
          </div>
          
          {/* Player Info */}
          <div className={`p-4 ${isLarge ? 'flex-1 flex flex-col justify-center' : ''}`}>
            <h3 className={`font-heading font-bold text-foreground ${
              isLarge ? 'text-2xl' : 'text-lg'
            } mb-1 tracking-wider`}>
              {player.name.toUpperCase()}
            </h3>
            
            <p className="text-muted-foreground text-sm mb-2">{player.role}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  <Star
                    className={`h-4 w-4 ${
                      i < player.rating 
                        ? 'text-accent fill-accent' 
                        : 'text-muted/30'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
            
            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Base Price</p>
                <p className={`font-heading font-bold text-primary ${
                  isLarge ? 'text-2xl' : 'text-lg'
                }`}>
                  {formatCurrency(player.basePrice)}
                </p>
              </div>
              
              {player.status === 'sold' && player.soldPrice && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Sold For</p>
                  <p className="font-heading font-bold text-success text-lg">
                    {formatCurrency(player.soldPrice)}
                  </p>
                </div>
              )}
            </div>
            
            {/* Bring to Bid Button */}
            {showBidButton && player.status === 'available' && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="red"
                  className="w-full mt-4 font-heading tracking-wider"
                  onClick={() => onBringToBid(player.id)}
                >
                  BRING TO BID
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlayerCard;

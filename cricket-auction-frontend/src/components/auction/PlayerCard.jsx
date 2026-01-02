import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Flame, Upload, Loader, TrendingUp, Trophy, Zap, Shield, Award, DollarSign } from 'lucide-react';
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

const getSafeRating = (rating) => {
  if (!rating) return 0;
  const numRating = parseFloat(rating);
  return isNaN(numRating) ? 0 : Math.min(Math.max(numRating, 0), 5);
};

const PlayerCard = ({ player, showBidButton, onBringToBid, isHighlighted, size = 'default', onPhotoUpdate }) => {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [localPhotoUrl, setLocalPhotoUrl] = useState(player.photoUrl);
  const fileInputRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: isHighlighted ? 1 : 1.04, y: isHighlighted ? 0 : -12 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`${isHighlighted ? 'relative' : ''} group h-full`}
    >
      {isHighlighted && (
        <motion.div 
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.08, 0.95] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-orange-500/40 via-orange-400/30 to-orange-500/40 blur-2xl -z-10" 
        />
      )}
      
      <Card className={`relative overflow-hidden h-full transition-all duration-500 flex flex-col ${
        isHighlighted 
          ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/40 bg-white' 
          : 'border border-gray-200 bg-white hover:shadow-2xl hover:shadow-blue-500/30 hover:border-blue-400 group-hover:border-blue-500'
      }`}>
        
        {/* Premium Header with Player Info */}
        <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-5 py-4">
          <motion.div
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent"
          />
          
          {/* Status and Form Number */}
          <div className="relative z-10 flex items-start justify-between mb-3">
            <div className="flex flex-col gap-2">
              {player.status !== 'available' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Badge 
                    className="text-xs font-bold px-2.5 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/50 backdrop-blur-sm"
                  >
                    {player.status === 'sold' ? '✨ SOLD' : '🔒 ' + player.status.toUpperCase()}
                  </Badge>
                </motion.div>
              )}
              {player.category === 'A' && player.status === 'available' && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white gap-1 font-bold px-2.5 py-1 text-xs shadow-lg shadow-orange-500/50">
                    <Flame className="h-3 w-3" />
                    HOT
                  </Badge>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.12, rotate: -5 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-lg font-black text-xs shadow-lg"
            >
              #{player.formNumber}
            </motion.div>
          </div>

          {/* Player Name and Role */}
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-black text-blue-900 text-xl mb-0.5 leading-tight"
          >
            {player.name.toUpperCase()}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-600 text-xs font-bold uppercase tracking-wide"
          >
            {player.role}
          </motion.p>
        </div>

        {/* Player Photo Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 h-40 group/photo">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
            src={getPhotoUrl(localPhotoUrl || player.photoUrl || player.photo)}
            alt={player.name}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Photo Upload Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover/photo:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploadingPhoto ? (
              <div className="flex flex-col items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, linear: true }}>
                  <Loader className="h-8 w-8 text-white" />
                </motion.div>
                <span className="text-white text-xs font-semibold">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-7 w-7 text-white" />
                <span className="text-white text-xs font-semibold">Upload</span>
              </div>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3 z-20">
            <Badge 
              className="text-xs font-black px-2.5 py-1 bg-white/95 text-blue-600 border border-white/60 backdrop-blur-sm"
            >
              CAT {player.category}
            </Badge>
          </div>

          {/* Availability Indicator */}
          {player.status === 'available' && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-bold">LIVE</span>
            </div>
          )}
        </div>

        {/* Rating Section */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 font-bold mb-1.5">RATING</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} whileHover={{ scale: 1.2, rotate: 15 }}>
                <Star
                  className={`h-4 w-4 ${
                    i < getSafeRating(player.rating)
                      ? 'text-orange-400 fill-orange-400' 
                      : 'text-slate-600'
                  }`}
                />
              </motion.div>
            ))}
            <span className="ml-1.5 text-xs text-slate-300 font-bold">{getSafeRating(player.rating).toFixed(1)}/5</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-5 py-4 flex-grow space-y-3 bg-slate-900/50">
          {/* Price Display */}
          <div className="bg-gradient-to-br from-slate-800/70 to-slate-700/70 rounded-lg p-3.5 border border-slate-600/40">
            <p className="text-slate-400 text-xs font-bold mb-1.5">BASE PRICE</p>
            <p className="text-orange-400 font-black text-2xl">{formatCurrency(player.basePrice)}</p>
          </div>

          {/* Price Details */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Base:</span>
              <span className="text-white font-semibold">₹{(player.basePrice / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Category:</span>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40 text-xs font-bold px-2 py-0.5">
                {player.category}
              </Badge>
            </div>
            {player.status === 'sold' && player.soldPrice && (
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-600/40">
                <span className="text-slate-400 font-medium">Sold:</span>
                <span className="text-green-400 font-bold">₹{(player.soldPrice / 1000).toFixed(0)}K</span>
              </div>
            )}
          </div>

          {/* Skill Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {getSafeRating(player.rating) >= 4.5 && (
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold px-1.5 py-0.5">
                <Zap className="h-2.5 w-2.5 mr-1" />
                Elite
              </Badge>
            )}
            {player.category === 'A' && (
              <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-bold px-1.5 py-0.5">
                <TrendingUp className="h-2.5 w-2.5 mr-1" />
                Premium
              </Badge>
            )}
            {player.status === 'available' && (
              <Badge className="bg-green-500/20 text-green-300 border border-green-500/40 text-xs font-bold px-1.5 py-0.5">
                <Shield className="h-2.5 w-2.5 mr-1" />
                Ready
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        {showBidButton && player.status === 'available' && (
          <div className="px-5 py-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-t border-slate-700/50">
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                className="w-full font-black tracking-wider uppercase text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all text-white rounded-lg py-2.5"
                onClick={() => onBringToBid(player.id)}
              >
                🔨 Bring to Bid
              </Button>
            </motion.div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PlayerCard;

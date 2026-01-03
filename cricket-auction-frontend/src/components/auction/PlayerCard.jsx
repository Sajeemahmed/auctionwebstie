import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import playerService from '../../services/playerService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatCurrency = (amount = 0) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${(amount / 1000).toFixed(0)} K`;
};

const getPhotoUrl = (photoUrl) => {
  if (!photoUrl) return '/default-player.png';
  if (photoUrl.startsWith('http')) return photoUrl;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${photoUrl}`;
};

const getCategoryBadge = (category) => {
  const variants = {
    A: 'catA',
    B: 'catB',
    C: 'catC',
    D: 'catD'
  };
  return variants[category] || 'default';
};

const getSafeRating = (rating) => {
  if (!rating) return 0;
  const numRating = parseFloat(rating);
  return Number.isNaN(numRating) ? 0 : Math.min(Math.max(numRating, 0), 5);
};

const PlayerCard = ({ player, showBidButton, onBringToBid, isHighlighted, size = 'default', onPhotoUpdate }) => {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [localPhotoUrl, setLocalPhotoUrl] = useState(player.photoUrl);
  const fileInputRef = useRef(null);

  const playerSpecs = [player.role, player.battingStyle, player.bowlingStyle].filter(Boolean).join(' | ');

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
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="group h-full"
    >
      <Card className="relative overflow-hidden transition-all duration-300 flex flex-col h-full border border-gray-200 bg-white hover:shadow-lg hover:border-blue-300">
        {/* Player Photo Section */}
        <div className="relative overflow-hidden bg-gray-300 h-48 group/photo">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <motion.img
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.5 }}
            src={getPhotoUrl(localPhotoUrl || player.photoUrl || player.photo)}
            alt={player.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Photo Upload Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover/photo:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer"
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
                <Upload className="h-6 w-6 text-white" />
                <span className="text-white text-xs font-semibold">Upload</span>
              </div>
            )}
          </div>

          {/* Status Badge - Top Right */}
          {player.status !== 'available' && (
            <div className="absolute top-2 right-2 z-20">
              <Badge
                className={`text-xs font-bold px-2 py-1 ${
                  player.status === 'sold' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                }`}
              >
                {player.status === 'sold' ? 'SOLD' : player.status.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="px-4 py-3 flex-grow flex flex-col justify-between bg-white">
          {/* Player Name and Category */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-red-600 text-lg mb-1 leading-tight bg-red-50 px-2 py-1 rounded inline-block"
            >
              {player.name}
              <span className="text-orange-600 ml-1 font-bold">[{player.category}]</span>
            </motion.h3>

            {/* Player Type */}
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="text-red-700 text-xs font-bold uppercase tracking-wide mt-2"
            >
              {player.player_type ? player.player_type.replace(/_/g, ' ') : player.role || 'Player'}
            </motion.p>
          </div>

          {/* Base Price and Rating */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Base Price</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(player.basePrice)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-semibold mb-1">Rating</p>
                <p className="text-lg font-bold text-yellow-600">
                  {player.rating || '0.0'} ⭐
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {showBidButton && player.status === 'available' && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full font-semibold text-xs bg-orange-600 hover:bg-orange-700 text-white rounded-md py-2 transition-all"
                onClick={() => onBringToBid(player.id)}
              >
                Bid Now
              </Button>
            </motion.div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PlayerCard;

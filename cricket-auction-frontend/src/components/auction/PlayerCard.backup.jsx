import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Flame, Upload, Loader, TrendingUp, Trophy, Zap, Shield, Heart, Sparkles, Award, Clock, DollarSign } from 'lucide-react';
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
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: isHighlighted ? 1 : 1.04, y: isHighlighted ? 0 : -12 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`${isHighlighted ? 'relative' : ''} group h-full`}
    >
      {/* Premium Glow Effect for Highlighted */}
      {isHighlighted && (
        <>
          <motion.div 
            animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary/60 via-accent/40 to-primary/60 blur-3xl -z-10 opacity-75" 
          />
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3], rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, linear: true }}
            className="absolute -inset-2 rounded-3xl border-2 border-transparent bg-gradient-to-r from-primary via-accent to-primary bg-clip-border blur-sm -z-10" 
          />
        </>
      )}
      
      <Card className={`relative overflow-hidden transition-all duration-500 ${
        isHighlighted 
          ? 'border-2 border-primary shadow-2xl shadow-primary/50 bg-gradient-to-br from-card via-card to-card/90' 
          : 'border-1 border-border/30 bg-gradient-to-br from-card to-card/70 hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/60 group-hover:border-primary/50'
      } ${player.status === 'sold' ? 'opacity-65' : ''} rounded-3xl overflow-hidden backdrop-blur-xl`}>
        
        {/* Premium Card Shine Effect */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            repeatDelay: 6,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-30 pointer-events-none"
        />
        
        {/* Prismatic Light Effect */}
        <motion.div
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/5 z-[5]"
        />
        
        {/* Animated Decorative Top Accent Bar */}
        <motion.div 
          animate={{ backgroundPosition: ['0% center', '100% center'] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          className="h-1 bg-gradient-to-r from-primary via-accent via-primary to-accent absolute top-0 left-0 right-0" 
          style={{ backgroundSize: '200% 100%' }}
        />
        
        {/* Corner Accent Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
        
        {/* Animated Corner Decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/30 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/30 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/30 rounded-br-3xl" />

        {/* Floating Particles Effect */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-10 right-10 w-2 h-2 bg-primary/40 rounded-full blur-sm"
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute top-20 right-16 w-1.5 h-1.5 bg-accent/40 rounded-full blur-sm"
        />
        
        {/* Premium Form Number Badge */}
        <motion.div 
          whileHover={{ scale: 1.2, rotate: -8, y: -4 }}
          whileTap={{ scale: 0.95 }}
          className={`absolute top-5 right-5 z-10 ${
            isHighlighted 
              ? 'bg-gradient-to-135 from-primary via-accent to-primary shadow-2xl shadow-primary/60' 
              : 'bg-gradient-to-135 from-primary/85 to-accent/70 shadow-xl shadow-primary/40'
          } text-white px-3.5 py-2 rounded-2xl font-black text-xs shadow-lg tracking-widest cursor-pointer border border-white/30 backdrop-blur-sm`}
        >
          #{player.formNumber}
        </motion.div>
        
        {/* Enhanced Status Badge */}
        {player.status !== 'available' && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-5 left-5 z-10"
          >
            <Badge 
              variant={player.status === 'sold' ? 'success' : 'secondary'} 
              className="text-xs font-bold px-3.5 py-1.5 backdrop-blur-xl shadow-lg border border-white/40 bg-opacity-90"
            >
              {player.status === 'sold' ? '✨ SOLD' : '🔒 ' + player.status.toUpperCase()}
            </Badge>
          </motion.div>
        )}
        
        {/* Premium Hot Badge for Category A */}
        {player.category === 'A' && player.status === 'available' && (
          <motion.div
            animate={{ 
              rotate: [0, -15, 10, -12, 0], 
              scale: [1, 1.15, 1.1, 1.12, 1],
              y: [0, -4, -2, -3, 0]
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-5 left-5 z-10"
          >
            <Badge className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white gap-2 font-black px-3.5 py-1.5 shadow-2xl shadow-orange-500/60 animate-pulse border border-white/40 backdrop-blur-sm">
              <Flame className="h-4 w-4 animate-bounce" />
              HOT PICK
            </Badge>
          </motion.div>
        )}
        
        {/* Trophy Badge for Top Performers */}
        {player.rating >= 4 && player.status === 'available' && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="absolute top-5 right-20 z-10"
          >
            <Badge className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-black gap-1.5 font-bold px-2.5 py-1 text-xs shadow-2xl shadow-yellow-400/50 border border-yellow-200/60 backdrop-blur-sm">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, linear: true }}>
                <Trophy className="h-3.5 w-3.5" />
              </motion.div>
              STAR
            </Badge>
          </motion.div>
        )}
        
        {/* Premium Badge for Special Players */}
        {player.category === 'A' && player.rating >= 5 && (
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute top-5 right-5 z-[11]"
          >
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white gap-1.5 font-bold px-3 py-1.5 text-xs shadow-2xl shadow-purple-600/60 border border-purple-300/50 backdrop-blur-sm">
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Sparkles className="h-4 w-4" />
              </motion.div>
              ELITE
            </Badge>
          </motion.div>
        )}
        
        <CardContent className={`p-0 ${isLarge ? 'flex' : ''}`}>
          {/* Enhanced Player Photo Section */}
          <div className={`relative overflow-hidden group/photo ${
            isLarge ? 'w-56 h-56 flex-shrink-0' : 'w-full aspect-square'
          }`}>
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handlePhotoChange}
              className="hidden"
            />

            {/* Animated Background Gradient */}
            <motion.div 
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 z-0"
              style={{ backgroundSize: '200% 200%' }}
            />

            {/* Photo Image with Enhanced Effects */}
            <motion.img
              whileHover={{ scale: 1.2, rotateZ: 2 }}
              transition={{ duration: 0.6, type: 'spring' }}
              src={getPhotoUrl(localPhotoUrl || player.photoUrl || player.photo)}
              alt={player.name}
              className="w-full h-full object-cover relative z-5 filter brightness-105"
            />
            
            {/* Multi-layer Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <motion.div 
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 z-10"
            />

            {/* Shine Effect on Hover */}
            <motion.div
              whileHover={{ x: ['100%', '-100%'] }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/photo:opacity-100 z-15"
            />

            {/* Enhanced Photo Upload Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 backdrop-blur-md opacity-0 group-hover/photo:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer z-20"
              onClick={handlePhotoClick}
            >
              {isUploadingPhoto ? (
                <motion.div 
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, linear: true }}>
                    <Loader className="h-12 w-12 text-white drop-shadow-lg" />
                  </motion.div>
                  <span className="text-white text-sm font-bold tracking-wide">Uploading...</span>
                </motion.div>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div 
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-white/25 p-4 rounded-full backdrop-blur-sm border border-white/40"
                  >
                    <Upload className="h-8 w-8 text-white drop-shadow-lg" />
                  </motion.div>
                  <span className="text-white text-sm font-bold tracking-wide">Click to Upload</span>
                </motion.div>
              )}
            </div>

            {/* Enhanced Category Badge */}
            <motion.div 
              whileHover={{ scale: 1.15 }}
              className="absolute bottom-4 left-4 z-20"
            >
              <Badge 
                variant={getCategoryBadge(player.category)} 
                className="text-xs font-black px-3.5 py-1.5 backdrop-blur-xl shadow-xl border border-white/40 text-white tracking-wider"
              >
                CAT {player.category}
              </Badge>
            </motion.div>

            {/* Players Available Indicator */}
            {player.status === 'available' && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-4 right-4 z-20"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/60 border-2 border-white animate-pulse" />
              </motion.div>
            )}
          </div>
          
          {/* Enhanced Player Info Section */}
          <div className={`p-6 flex flex-col justify-between ${isLarge ? 'flex-1' : ''} relative`}>
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            {/* Player Name and Role */}
            <div>
              <div className="relative">
                {/* Glowing Name Background */}
                <motion.div
                  animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [0.95, 1.05, 0.95]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl rounded-lg"
                />
                
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`font-black text-foreground relative z-10 ${
                    isLarge ? 'text-3xl' : 'text-xl'
                  } mb-1 tracking-tight leading-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent`}
                >
                  {player.name.toUpperCase()}
                </motion.h3>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full" />
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                  {player.role}
                </p>
              </motion.div>
              
              {/* Skill Highlight Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex gap-2 mb-3 flex-wrap"
              >
                {player.rating >= 4.5 && (
                  <motion.div whileHover={{ scale: 1.15, rotate: -5, y: -2 }}>
                    <Badge className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-700 dark:text-purple-300 border border-purple-500/50 text-xs font-bold px-2.5 py-1 backdrop-blur-sm">
                      <Zap className="h-3.5 w-3.5 mr-1" />
                      Elite
                    </Badge>
                  </motion.div>
                )}
                {player.category === 'A' && (
                  <motion.div whileHover={{ scale: 1.15, rotate: 5, y: -2 }}>
                    <Badge className="bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-700 dark:text-orange-300 border border-orange-500/50 text-xs font-bold px-2.5 py-1 backdrop-blur-sm">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      Premium
                    </Badge>
                  </motion.div>
                )}
                {player.status === 'available' && (
                  <motion.div whileHover={{ scale: 1.15, y: -2 }}>
                    <Badge className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-700 dark:text-green-300 border border-green-500/50 text-xs font-bold px-2.5 py-1 backdrop-blur-sm">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      Ready
                    </Badge>
                  </motion.div>
                )}
                {player.rating >= 3 && player.rating < 4.5 && (
                  <motion.div whileHover={{ scale: 1.15, y: -2 }}>
                    <Badge className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-700 dark:text-blue-300 border border-blue-500/50 text-xs font-bold px-2.5 py-1 backdrop-blur-sm">
                      <Award className="h-3.5 w-3.5 mr-1" />
                      Skilled
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
              
              {/* Enhanced Star Rating */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {/* Glow effect behind stars */}
                <motion.div
                  animate={{ 
                    opacity: [0.4, 0.7, 0.4],
                    scale: [0.95, 1.08, 0.95]
                  }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/30 blur-lg rounded-lg"
                />
                
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/15 to-yellow-500/15 w-fit px-3 py-2 rounded-xl border border-amber-500/30 backdrop-blur-sm relative z-10 shadow-lg shadow-amber-500/20">
                    {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.4, rotate: 20, y: -6 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="cursor-pointer relative"
                    >
                      {i < player.rating && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                          className="absolute inset-0 bg-yellow-400/40 blur-md rounded-full"
                        />
                      )}
                      <Star
                        className={`h-4 w-4 transition-all relative z-10 ${
                          i < player.rating 
                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' 
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
            
            {/* Enhanced Price Section with Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {/* Base Price Card with Enhanced Visual */}
              <motion.div 
                whileHover={{ scale: 1.03, y: -3 }}
                className="relative overflow-hidden rounded-xl p-4 border-2 border-primary/50 shadow-lg hover:shadow-2xl transition-all"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10" />
                
                {/* Animated shine effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    <motion.p animate={{ fontSize: [14, 12, 14] }} transition={{ duration: 2, repeat: Infinity }} className="text-xs text-primary font-bold uppercase tracking-wide">
                      Base Price
                    </motion.p>
                  </div>
                  <p className={`font-black text-primary ${
                    isLarge ? 'text-3xl' : 'text-2xl'
                  } tracking-tight`}>
                    {formatCurrency(player.basePrice)}
                  </p>
                </div>
              </motion.div>
              
              {/* Sold Price Card - Enhanced */}
              {player.status === 'sold' && player.soldPrice && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="relative overflow-hidden rounded-xl p-4 border-2 border-green-500/50 shadow-lg hover:shadow-2xl transition-all"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-500/5" />
                  
                  {/* Animated shine effect */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  
                  <div className="relative z-10">
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, linear: true }}>
                        <Trophy className="h-3.5 w-3.5" />
                      </motion.div>
                      Sold Price
                    </p>
                    <p className="font-black text-green-600 dark:text-green-400 text-2xl tracking-tight">
                      {formatCurrency(player.soldPrice)}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
            
            {/* Bring to Bid Button - Premium */}
            {showBidButton && player.status === 'available' && (
              <motion.div
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-5"
              >
                <motion.div
                  animate={{ boxShadow: ['0 0 20px rgba(var(--primary),0)', '0 0 40px rgba(var(--primary),0.3)', '0 0 20px rgba(var(--primary),0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Button
                    variant="red"
                    className="w-full font-black tracking-wider uppercase text-sm shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group/btn"
                    onClick={() => onBringToBid(player.id)}
                  >
                    <motion.span
                      animate={{ x: [-20, 20, -20] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      🔨 Bring to Bid
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlayerCard;
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, User, Award } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import BidTimer from './BidTimer';

const formatCurrency = (amount) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
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

const CurrentPlayerDisplay = ({ player, currentBid, bidHistory, showTimer = true }) => {
  if (!player) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/50 border-dashed">
        <CardContent className="text-center py-16">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-heading font-semibold text-muted-foreground">
            No Player Selected
          </h3>
          <p className="text-muted-foreground mt-2">Select a player to start bidding</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl animate-pulse-glow" />
      
      <Card className="relative overflow-hidden border-2 border-primary/50 shadow-glow-lg">
        <CardContent className="p-0">
          {/* Header with Form Number */}
          <div className="bg-hero text-primary-foreground p-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="form-highlight px-6 py-3 rounded-xl font-heading font-bold text-2xl"
              >
                FORM: {player.formNumber}
              </motion.div>
              
              <Badge variant={getCategoryBadge(player.category)} className="text-base px-4 py-2">
                Category {player.category}
              </Badge>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-6">
            <div className="flex gap-6">
              {/* Player Photo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-48 h-48 flex-shrink-0"
              >
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full h-full object-cover rounded-xl shadow-xl"
                />
                <div className="absolute inset-0 rounded-xl ring-4 ring-primary/30" />
              </motion.div>
              
              {/* Player Info */}
              <div className="flex-1">
                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="font-heading font-bold text-3xl text-foreground mb-2"
                >
                  {player.name}
                </motion.h2>
                
                <p className="text-lg text-muted-foreground mb-3">{player.role}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < player.rating 
                          ? 'text-warning fill-warning' 
                          : 'text-muted'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-muted-foreground">({player.rating}/5)</span>
                </div>
                
                {/* Base Price */}
                <div className="bg-muted rounded-lg p-3 inline-block">
                  <p className="text-xs text-muted-foreground">Base Price</p>
                  <p className="font-heading font-bold text-xl text-primary">
                    {formatCurrency(player.basePrice)}
                  </p>
                </div>
              </div>
              
              {/* Timer */}
              {showTimer && (
                <div className="flex flex-col items-center">
                  <BidTimer size="large" />
                </div>
              )}
            </div>
            
            {/* Current Bid Section */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-success/10 to-accent/10 border border-success/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Current Bid</span>
                  </div>
                  <motion.p
                    key={currentBid?.amount}
                    initial={{ scale: 1.2, color: 'hsl(var(--success))' }}
                    animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                    className="font-heading font-bold text-4xl"
                  >
                    {formatCurrency(currentBid?.amount || player.basePrice)}
                  </motion.p>
                </div>
                
                {currentBid?.teamName && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Leading Team</p>
                    <motion.p
                      key={currentBid.teamName}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="font-heading font-bold text-xl text-success"
                    >
                      {currentBid.teamName}
                    </motion.p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bid History */}
            {bidHistory && bidHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Recent Bids</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {bidHistory.slice(0, 5).map((bid, index) => (
                      <motion.div
                        key={bid.timestamp}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          index === 0 ? 'bg-success/10 border border-success/20' : 'bg-muted/50'
                        }`}
                      >
                        <span className="font-medium">{bid.teamName}</span>
                        <span className="font-bold">{formatCurrency(bid.amount)}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CurrentPlayerDisplay;

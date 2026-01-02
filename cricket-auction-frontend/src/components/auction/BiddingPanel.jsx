import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { DollarSign, Send, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

const BiddingPanel = ({ 
  currentPlayer, 
  currentBid, 
  team, 
  onPlaceBid 
}) => {
  const [bidAmount, setBidAmount] = useState(currentBid?.amount || currentPlayer?.basePrice || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentPlayer) {
    return null;
  }

  const minBidAmount = currentBid?.amount ? Math.floor(currentBid.amount * 1.1) : currentPlayer.basePrice;
  const canBid = team && team.purse >= minBidAmount && bidAmount >= minBidAmount;

  const handleBidChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setBidAmount(value);
  };

  const handlePlaceBid = async () => {
    if (!canBid) {
      toast.error('Invalid bid amount or insufficient purse');
      return;
    }

    setIsSubmitting(true);
    try {
      await onPlaceBid(bidAmount);
      setBidAmount(minBidAmount);
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBid = (percentage) => {
    const newAmount = Math.floor(minBidAmount * (1 + percentage / 100));
    setBidAmount(newAmount);
  };

  return (
    <div
      className="w-full"
    >
      <Card className="bg-[#181818]/95 border-[#E50914]/30 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white font-heading tracking-wider">
            <DollarSign className="h-5 w-5 text-[#E50914]" />
            PLACE YOUR BID
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Team Info */}
          {team && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-[#2F2F2F] border border-[#404040]"
            >
              <p className="text-xs text-gray-500 mb-1">YOUR TEAM</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-white text-sm">{team.name}</span>
                <span className="text-green-500 font-bold">
                  ₹{(team.purse / 100000).toFixed(2)}L
                </span>
              </div>
            </motion.div>
          )}

          {/* Min Bid Amount Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-3 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30"
          >
            <p className="text-xs text-gray-400 mb-1">MINIMUM BID AMOUNT</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-heading font-bold text-[#E50914]">
                ₹{(minBidAmount / 100000).toFixed(2)}L
              </span>
              {currentBid?.amount && currentBid.teamName !== 'Base Price' && (
                <Badge className="bg-orange-600 text-white border-0 text-[10px]">
                  +10% from current bid
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Current Bid Info */}
          {currentBid?.amount && currentBid.teamName !== 'Base Price' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-3 rounded-lg bg-[#2F2F2F] border border-[#404040]"
            >
              <p className="text-xs text-gray-500 mb-1">CURRENT LEADING BID</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">
                  ₹{(currentBid.amount / 100000).toFixed(2)}L
                </span>
                <Badge className="bg-green-600 text-white border-0 text-[10px]">
                  {currentBid.teamName}
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Bid Input */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-300">YOUR BID AMOUNT</label>
            <div className="relative group">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#E50914] transition-colors" />
              <Input
                type="number"
                value={bidAmount}
                onChange={handleBidChange}
                min={minBidAmount}
                step={10000}
                className="pl-10 h-12 bg-[#333] border-[#404040] text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20"
                placeholder={`Min: ₹${(minBidAmount / 100000).toFixed(2)}L`}
              />
            </div>
            <p className="text-[10px] text-gray-500">
              Your bid: ₹{(bidAmount / 100000).toFixed(2)}L
            </p>
          </motion.div>

          {/* Quick Bid Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-2"
          >
            <button
              onClick={() => handleQuickBid(10)}
              className="p-2 text-xs rounded-lg bg-[#2F2F2F] border border-[#404040] text-gray-300 hover:border-[#E50914] hover:text-[#E50914] transition-all"
            >
              +10%
            </button>
            <button
              onClick={() => handleQuickBid(25)}
              className="p-2 text-xs rounded-lg bg-[#2F2F2F] border border-[#404040] text-gray-300 hover:border-[#E50914] hover:text-[#E50914] transition-all"
            >
              +25%
            </button>
            <button
              onClick={() => handleQuickBid(50)}
              className="p-2 text-xs rounded-lg bg-[#2F2F2F] border border-[#404040] text-gray-300 hover:border-[#E50914] hover:text-[#E50914] transition-all"
            >
              +50%
            </button>
          </motion.div>

          {/* Validation Messages */}
          {team && bidAmount < minBidAmount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-2"
            >
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">
                Bid amount must be at least ₹{(minBidAmount / 100000).toFixed(2)}L
              </p>
            </motion.div>
          )}

          {team && bidAmount > team.purse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-2"
            >
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">
                Insufficient purse. Available: ₹{(team.purse / 100000).toFixed(2)}L
              </p>
            </motion.div>
          )}

          {!team && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex gap-2"
            >
              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400">
                Team information not available. Please log in again.
              </p>
            </motion.div>
          )}

          {/* Place Bid Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={handlePlaceBid}
              disabled={!canBid || isSubmitting}
              className={`w-full h-12 font-heading text-lg tracking-wider border-0 ${
                canBid
                  ? 'bg-[#E50914] hover:bg-[#F40612] text-white'
                  : 'bg-[#2F2F2F] text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <motion.div className="flex items-center gap-2 justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-5 w-5"
                  >
                    <TrendingUp className="h-5 w-5" />
                  </motion.div>
                  <span>PLACING BID...</span>
                </motion.div>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2 inline" />
                  PLACE BID
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BiddingPanel;

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import useAuctionStore from '../../store/auctionStore';

const BidTimer = ({ size = 'default' }) => {
  const { timer, isTimerRunning, decrementTimer } = useAuctionStore();
  
  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        decrementTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, decrementTimer]);
  
  const isUrgent = timer <= 10;
  const isCritical = timer <= 5;
  const isLarge = size === 'large';
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={timer}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`relative flex flex-col items-center justify-center ${
          isLarge ? 'w-36 h-36' : 'w-24 h-24'
        } rounded-full border-4 ${
          isCritical 
            ? 'border-destructive bg-destructive/20 timer-urgent shadow-glow-lg' 
            : isUrgent
            ? 'border-warning bg-warning/10'
            : 'border-success bg-success/10'
        } transition-all duration-300`}
      >
        {/* Pulse ring for urgent */}
        {isUrgent && (
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`absolute inset-0 rounded-full ${
              isCritical ? 'bg-destructive/30' : 'bg-warning/30'
            }`}
          />
        )}
        
        {/* Circular Progress */}
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className={isCritical ? 'text-destructive/20' : isUrgent ? 'text-warning/20' : 'text-success/20'}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={isCritical ? 'text-destructive' : isUrgent ? 'text-warning' : 'text-success'}
            initial={{ pathLength: 1 }}
            animate={{ pathLength: timer / 30 }}
            transition={{ duration: 0.3, ease: 'linear' }}
            style={{
              strokeDasharray: '283',
              strokeDashoffset: '0',
            }}
          />
        </svg>
        
        {/* Timer Icon */}
        <motion.div
          animate={isCritical ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.3, repeat: isCritical ? Infinity : 0 }}
        >
          {isCritical ? (
            <AlertTriangle className={`${
              isLarge ? 'h-6 w-6' : 'h-4 w-4'
            } text-destructive mb-1`} />
          ) : (
            <Clock className={`${
              isLarge ? 'h-6 w-6' : 'h-4 w-4'
            } ${isUrgent ? 'text-warning' : 'text-success'} mb-1`} />
          )}
        </motion.div>
        
        {/* Timer Display */}
        <motion.span
          key={timer}
          initial={{ y: -10, opacity: 0, scale: 1.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          className={`font-heading font-bold ${
            isLarge ? 'text-5xl' : 'text-3xl'
          } ${isCritical ? 'text-destructive' : isUrgent ? 'text-warning' : 'text-success'} tracking-wider`}
        >
          {timer}
        </motion.span>
        
        <span className={`text-xs ${
          isCritical ? 'text-destructive' : isUrgent ? 'text-warning' : 'text-success'
        } font-medium`}>
          {timer === 1 ? 'SECOND' : 'SECONDS'}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export default BidTimer;

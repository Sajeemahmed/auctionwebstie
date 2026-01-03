import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const TeamHeader = ({ team, stats = {} }) => {
  if (!team) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 shadow-md"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ backgroundColor: team.color }}
        />
        <div 
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{ backgroundColor: team.color }}
        />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 sm:gap-8">
            {/* Left Section - Stats */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Players Count */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center sm:text-left"
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Players
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900">
                    {stats.playerCount || '0'}/{stats.maxPlayers || '15'}
                  </p>
                </motion.div>

                {/* Purse Left */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center sm:text-left"
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Purse Left
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-600">
                    {stats.purseLeft || '₹0'}
                  </p>
                </motion.div>

                {/* Season Info - Hidden on mobile */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="hidden sm:block text-center sm:text-left"
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Season
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900">
                    {stats.season || '8'}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Right Section - Logo and Team Name */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 sm:gap-4 shrink-0"
            >
              {/* Logo */}
              <motion.div
                whileHover={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ 
                  backgroundColor: team.color,
                  boxShadow: `0 4px 20px ${team.color}40`
                }}
              >
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              {/* Team Name */}
              <div className="flex flex-col justify-center">
                <motion.h2 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight"
                  style={{ color: team.color }}
                >
                  {team.name}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {team.code || team.name.split(' ').map(w => w[0]).join('')}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamHeader;

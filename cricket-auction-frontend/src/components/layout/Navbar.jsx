import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, LayoutDashboard, Users, Trophy, Gavel, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import useAuctionStore from '../../store/auctionStore';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, auctionStatus } = useAuctionStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/players', label: 'Players', icon: Users },
    { path: '/admin/teams', label: 'Teams', icon: Trophy },
    { path: '/admin/auction', label: 'Auction', icon: Gavel },
  ];

  const ownerLinks = [
    { path: '/owner/bid', label: 'Live Bidding', icon: Gavel },
    { path: '/owner/team', label: 'My Team', icon: Trophy },
  ];

  const links = currentUser?.role === 'ADMIN' ? adminLinks : ownerLinks;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/98 border-b border-slate-200 backdrop-blur-xl shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Logo */}
          <Link 
            to={currentUser?.role === 'ADMIN' ? '/admin' : '/owner/bid'} 
            className="flex items-center gap-2 flex-shrink-0"
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="hidden sm:flex flex-col">
                <h1 className="font-bold text-sm lg:text-base text-slate-900 tracking-wide">
                  KBN
                </h1>
                <p className="text-xs text-red-600 font-semibold leading-none">
                  PREMIER LEAGUE
                </p>
              </div>
            </motion.div>
          </Link>

          {/* Center Navigation - Desktop Only */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auction Status */}
            {auctionStatus === 'running' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="hidden sm:block"
              >
                <Badge variant="destructive" className="gap-1.5 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </Badge>
              </motion.div>
            )}
            
            {/* User Info - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <User className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-slate-900">{currentUser?.username}</span>
              </div>
            </div>

            {/* Logout Button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 hover:bg-red-50 h-9 w-9 sm:h-10 sm:w-10"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-900 h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 py-4 bg-white/95"
          >
            <div className="space-y-2">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-slate-200 pt-2 mt-2">
                <div className="px-4 py-3 rounded-lg bg-slate-50 flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-slate-900">{currentUser?.username}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

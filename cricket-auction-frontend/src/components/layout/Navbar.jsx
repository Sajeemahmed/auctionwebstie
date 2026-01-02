import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, LayoutDashboard, Users, Trophy, Gavel, Eye, Menu, X } from 'lucide-react';
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
    { path: '/owner/bid', label: 'Bidding', icon: Gavel },
    { path: '/owner/team', label: 'My Team', icon: Trophy },
  ];

  const links = currentUser?.role === 'ADMIN' ? adminLinks : ownerLinks;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/95 border-b border-gray-200 backdrop-blur-lg shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={currentUser?.role === 'ADMIN' ? '/admin' : '/owner/bid'} className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="https://static.wixstatic.com/media/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg/v1/fill/w_435,h_394,al_c,lg_1,q_80,enc_avif,quality_auto/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg"
                  alt="KBN Logo"
                  className="h-10 w-10 rounded object-cover shadow-lg shadow-[#E50914]/20 hover:shadow-[#E50914]/40 transition-shadow"
                />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="font-heading font-bold text-lg text-gray-900 leading-tight tracking-wider transition-all hover:text-[#E50914]">
                  KBN PREMIER LEAGUE
                </h1>
                <motion.p
                  className="text-xs text-[#E50914] font-semibold"
                  whileHover={{ scale: 1.1 }}
                >
                  Season 8
                </motion.p>
              </div>
            </motion.div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    {!isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#E50914]/0 via-[#E50914]/10 to-[#E50914]/0"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                    <Icon className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}
            
            {/* Live View Link */}
            <Link to="/live" target="_blank">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#E50914]/0 via-[#E50914]/10 to-[#E50914]/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <Eye className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Live View</span>
              </motion.div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Auction Status */}
            {auctionStatus === 'running' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="hidden sm:block"
              >
                <Badge variant="destructive" className="gap-1.5 px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  LIVE
                </Badge>
              </motion.div>
            )}
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-gray-50 border border-gray-200">
                <User className="h-4 w-4 text-[#E50914]" />
                <span className="text-sm font-medium text-gray-900">{currentUser?.username}</span>
                <Badge variant="secondary" className="text-xs">
                  {currentUser?.role}
                </Badge>
              </div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-[#E50914] hover:bg-[#E50914]/10"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4 bg-white"
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
                    className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${
                      isActive
                        ? 'bg-[#E50914] text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                to="/live"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <Eye className="h-5 w-5" />
                Live View
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

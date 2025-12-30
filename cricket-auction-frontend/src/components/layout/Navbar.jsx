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

  const links = currentUser?.role === 'admin' ? adminLinks : ownerLinks;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-[#141414]/95 border-b border-[#333] backdrop-blur-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={currentUser?.role === 'admin' ? '/admin' : '/owner/bid'} className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3"
            >
              <img 
                src="https://static.wixstatic.com/media/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg/v1/fill/w_435,h_394,al_c,lg_1,q_80,enc_avif,quality_auto/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg" 
                alt="KBN Logo" 
                className="h-10 w-10 rounded object-cover"
              />
              <div className="hidden sm:block">
                <h1 className="font-heading font-bold text-lg text-white leading-tight tracking-wider">
                  KBN PREMIER LEAGUE
                </h1>
                <p className="text-xs text-[#E50914]">Season 8</p>
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
                    className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-[#E50914] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#333]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </motion.div>
                </Link>
              );
            })}
            
            {/* Live View Link */}
            <Link to="/live" target="_blank">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded font-medium text-gray-400 hover:text-white hover:bg-[#333] transition-all duration-300"
              >
                <Eye className="h-4 w-4" />
                Live View
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-[#2F2F2F] border border-[#404040]">
                <User className="h-4 w-4 text-[#E50914]" />
                <span className="text-sm font-medium text-white">{currentUser?.username}</span>
                <Badge variant="secondary" className="text-xs">
                  {currentUser?.role}
                </Badge>
              </div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-[#E50914] hover:bg-[#E50914]/10"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
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
            className="md:hidden border-t border-[#333] py-4"
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
                        : 'text-gray-400 hover:bg-[#333]'
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
                className="flex items-center gap-3 px-4 py-3 rounded text-gray-400 hover:bg-[#333]"
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

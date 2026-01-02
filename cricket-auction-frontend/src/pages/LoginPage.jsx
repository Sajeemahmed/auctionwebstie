import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, User, Lock, Eye, EyeOff, Trophy, Users, Gavel, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import useAuctionStore from '../store/auctionStore';

// Loading Component - Netflix Style
const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]"
  >
    <div className="text-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl font-heading text-[#E50914] mb-4"
      >
        KBN
      </motion.div>
      <div className="loader mx-auto" />
    </div>
  </motion.div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuctionStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = await login(username, password);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.username}!`);
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/owner/bid');
      }
    } else {
      toast.error(result.error || 'Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  const quickLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <>
      <AnimatePresence>
        {pageLoading && <LoadingScreen />}
      </AnimatePresence>

      <div className="min-h-screen relative overflow-hidden">
        {/* Full Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Dark Gradient Overlay - Netflix style */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-[#141414]/60" />
        
        {/* Red spotlight from top */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#E50914]/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: pageLoading ? 1.5 : 0 }}
            className="w-full max-w-5xl"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Branding */}
              <motion.div 
                className="text-center lg:text-left"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: pageLoading ? 1.7 : 0.2, duration: 0.8 }}
              >
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <img
                      src="https://static.wixstatic.com/media/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg/v1/fill/w_435,h_394,al_c,lg_1,q_80,enc_avif,quality_auto/7b13bf_f6a160ae93ec448ebf9f67f86323e8a2~mv2.jpg"
                      alt="KBN University"
                      className="w-20 h-20 rounded-lg shadow-2xl object-cover border-2 border-[#E50914]/50"
                    />
                  </motion.div>
                  <Badge className="bg-[#E50914] text-white px-4 py-2 text-sm font-bold border-0">
                    SEASON 8
                  </Badge>
                </div>

                <motion.h1 
                  className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-wider"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: pageLoading ? 2.0 : 0.5 }}
                >
                  KBN PREMIER
                  <span className="block text-[#E50914]">LEAGUE</span>
                </motion.h1>

                <motion.p 
                  className="text-lg text-gray-400 max-w-md mx-auto lg:mx-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: pageLoading ? 2.2 : 0.6 }}
                >
                  The ultimate cricket auction platform. Bid, compete, and build your dream team.
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: pageLoading ? 2.3 : 0.7 }}
                  className="flex justify-center lg:justify-start gap-8 mt-8"
                >
                  {[
                    { icon: Users, value: '178', label: 'Players' },
                    { icon: Trophy, value: '6', label: 'Teams' },
                    { icon: Gavel, value: 'Live', label: 'Auction' },
                  ].map((stat, index) => (
                    <motion.div 
                      key={index} 
                      className="text-center group"
                      whileHover={{ scale: 1.1, y: -5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <motion.div 
                        className="w-14 h-14 rounded-lg bg-[#2F2F2F] border border-[#404040] flex items-center justify-center mx-auto mb-2 group-hover:border-[#E50914] group-hover:bg-[#E50914]/10 transition-all duration-300"
                      >
                        <stat.icon className="h-7 w-7 text-white group-hover:text-[#E50914] transition-colors" />
                      </motion.div>
                      <p className="font-heading text-3xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Side - Login Form */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: pageLoading ? 2.0 : 0.3, duration: 0.8 }}
              >
                <Card className="bg-[#141414]/95 border-[#333] shadow-2xl backdrop-blur-sm">
                  <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="font-heading text-3xl tracking-wider text-white">SIGN IN</CardTitle>
                    <CardDescription className="text-gray-400">Access your auction account</CardDescription>
                  </CardHeader>

                  <CardContent className="p-6 pt-4">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#E50914] transition-colors" />
                          <Input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 h-12 bg-[#333] border-[#404040] text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#E50914] transition-colors" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 bg-[#333] border-[#404040] text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 font-heading text-lg tracking-wider bg-[#E50914] hover:bg-[#F40612] text-white border-0"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <motion.div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>SIGNING IN...</span>
                          </motion.div>
                        ) : (
                          <>
                            <LogIn className="h-5 w-5 mr-2" />
                            SIGN IN
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#333]">
                      <p className="text-sm text-gray-500 text-center mb-4">Quick Demo Access</p>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quickLogin('admin', 'admin123')}
                            className="w-full text-sm border-[#404040] bg-transparent text-gray-300 hover:bg-[#E50914]/10 hover:border-[#E50914] hover:text-white"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Admin
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quickLogin('warriors', 'team123')}
                            className="w-full text-sm border-[#404040] bg-transparent text-gray-300 hover:bg-[#E50914]/10 hover:border-[#E50914] hover:text-white"
                          >
                            <Trophy className="h-4 w-4 mr-2" />
                            Team Owner
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <motion.div className="text-center pt-3 border-t border-[#333]">
                        <p className="text-sm text-gray-400 mb-3">
                          Don't have an account?{' '}
                          <button
                            onClick={() => navigate('/signup')}
                            className="text-[#E50914] hover:text-[#F40612] font-medium transition-colors"
                          >
                            Sign up
                          </button>
                        </p>
                      </motion.div>

                      <motion.div className="text-center">
                        <a
                          href="/live"
                          className="text-sm text-gray-400 hover:text-[#E50914] flex items-center justify-center gap-2 transition-colors"
                        >
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-[#E50914]"
                          />
                          Watch Live Auction
                        </a>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

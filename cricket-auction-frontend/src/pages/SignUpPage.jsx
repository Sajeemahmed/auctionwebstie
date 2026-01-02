import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, User, Lock, Eye, EyeOff, Mail, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const LoadingScreen = () => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]"
  >
    <div className="text-center">
      <div
        className="text-6xl font-heading text-[#E50914] mb-4"
      >
        KBN
      </div>
      <div className="loader mx-auto" />
    </div>
  </div>
);

const SignUpPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'TEAM_OWNER',
    teamId: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fetch teams from backend
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/teams');
        if (response.ok) {
          const data = await response.json();
          setTeams(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        // If API fails, use mock teams
        setTeams([
          { id: 'team-1', name: 'Royal Warriors' },
          { id: 'team-2', name: 'Thunder Knights' },
          { id: 'team-3', name: 'Storm Titans' },
          { id: 'team-4', name: 'Fire Eagles' },
          { id: 'team-5', name: 'Ice Dragons' },
          { id: 'team-6', name: 'Golden Lions' },
        ]);
      }
    };
    fetchTeams();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    
    if (!formData.email.includes('@')) {
      toast.error('Valid email is required');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.role === 'TEAM_OWNER' && !formData.teamId) {
      toast.error('Team selection is required for team owners');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          teamId: formData.role === 'TEAM_OWNER' ? formData.teamId : null,
          seasonId: 1
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        toast.success('Account created successfully!');
        
        // Redirect based on role
        if (formData.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/owner/bid');
        }
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error('Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {pageLoading && <LoadingScreen />}

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
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-[#141414]/60" />
        
        {/* Red spotlight from top */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#E50914]/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: pageLoading ? 1.5 : 0 }}
            className="w-full max-w-2xl"
          >
            <div className="grid lg:grid-cols-1 gap-8">
              {/* Sign Up Form */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: pageLoading ? 1.8 : 0.2, duration: 0.8 }}
              >
                <Card className="bg-[#141414]/95 border-[#333] shadow-2xl backdrop-blur-sm">
                  <CardHeader className="text-center pb-2 pt-8">
                    <motion.div 
                      className="flex items-center justify-center gap-2 mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                    >
                      <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-lg hover:bg-[#2F2F2F] transition-colors"
                      >
                        <ArrowLeft className="h-5 w-5 text-gray-400" />
                      </button>
                      <div className="flex-1" />
                    </motion.div>
                    <CardTitle className="font-heading text-3xl tracking-wider text-white">CREATE ACCOUNT</CardTitle>
                    <CardDescription className="text-gray-400">Register as Admin or Team Owner</CardDescription>
                  </CardHeader>

                  <CardContent className="p-6 pt-4">
                    <form onSubmit={handleSignUp} className="space-y-5">
                      {/* Role Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Account Type</label>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'ADMIN' }))}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.role === 'ADMIN'
                                ? 'border-[#E50914] bg-[#E50914]/10'
                                : 'border-[#333] bg-[#2F2F2F] hover:border-[#404040]'
                            }`}
                          >
                            <User className={`h-5 w-5 mx-auto mb-1 ${
                              formData.role === 'ADMIN' ? 'text-[#E50914]' : 'text-gray-500'
                            }`} />
                            <span className={`text-sm font-medium ${
                              formData.role === 'ADMIN' ? 'text-[#E50914]' : 'text-gray-400'
                            }`}>
                              Admin
                            </span>
                          </motion.button>

                          <motion.button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'TEAM_OWNER' }))}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.role === 'TEAM_OWNER'
                                ? 'border-[#E50914] bg-[#E50914]/10'
                                : 'border-[#333] bg-[#2F2F2F] hover:border-[#404040]'
                            }`}
                          >
                            <Trophy className={`h-5 w-5 mx-auto mb-1 ${
                              formData.role === 'TEAM_OWNER' ? 'text-[#E50914]' : 'text-gray-500'
                            }`} />
                            <span className={`text-sm font-medium ${
                              formData.role === 'TEAM_OWNER' ? 'text-[#E50914]' : 'text-gray-400'
                            }`}>
                              Team Owner
                            </span>
                          </motion.button>
                        </div>
                      </div>

                      {/* Username */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#E50914] transition-colors" />
                          <Input
                            type="text"
                            name="username"
                            placeholder="Choose username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="pl-10 h-12 bg-[#333] border-[#404040] text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#E50914] transition-colors" />
                          <Input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="pl-10 h-12 bg-[#333] border-[#404040] text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20"
                            required
                          />
                        </div>
                      </div>

                      {/* Team Selection (only for Team Owner) */}
                      {formData.role === 'TEAM_OWNER' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Select Team</label>
                          <select
                            name="teamId"
                            value={formData.teamId}
                            onChange={handleInputChange}
                            className="w-full h-12 px-4 bg-[#333] border border-[#404040] text-white rounded-lg focus:border-[#E50914] focus:ring-[#E50914]/20 transition-all"
                            required
                          >
                            <option value="">Choose a team...</option>
                            {teams.map(team => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#E50914] transition-colors" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="pl-10 pr-10 h-12 bg-[#333] border-[#404040] text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20"
                            autoComplete="current-password"
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

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#E50914] transition-colors" />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="pl-10 pr-10 h-12 bg-[#333] border-[#404040] text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>CREATING ACCOUNT...</span>
                          </div>
                        ) : (
                          'CREATE ACCOUNT'
                        )}
                      </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#333] text-center">
                      <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <button
                          onClick={() => navigate('/')}
                          className="text-[#E50914] hover:text-[#F40612] font-medium transition-colors"
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;

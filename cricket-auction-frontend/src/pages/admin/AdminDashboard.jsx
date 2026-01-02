import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Gavel, Play, Upload, TrendingUp, DollarSign, PieChart, Zap, Target, Award, ArrowRight } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../../components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import useAuctionStore from '../../store/auctionStore';

const formatCurrency = (amount) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { players, teams, auctionStatus, getPlayerStats, fetchPlayers, fetchTeams } = useAuctionStore();
  const stats = getPlayerStats();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      easing: 'ease-out-cubic',
      offset: 50
    });
  }, []);

  // Fetch players and teams from backend on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPlayers();
        await fetchTeams();
      } catch (error) {
        console.error('Error loading auction data:', error);
      }
    };
    loadData();
  }, [fetchPlayers, fetchTeams]);

  const totalPurse = teams.reduce((acc) => acc + 10000000, 0);
  const spentPurse = teams.reduce((acc, team) => acc + (10000000 - team.purse), 0);
  const totalPlayers = teams.reduce((acc, team) => acc + team.players.length, 0);

  const categoryData = [
    { name: 'Category A', count: stats.catA, color: 'bg-white', textColor: 'text-white', sold: players.filter(p => p.category === 'A' && p.status === 'sold').length },
    { name: 'Category B', count: stats.catB, color: 'bg-gray-400', textColor: 'text-gray-400', sold: players.filter(p => p.category === 'B' && p.status === 'sold').length },
    { name: 'Category C', count: stats.catC, color: 'bg-gray-600', textColor: 'text-gray-500', sold: players.filter(p => p.category === 'C' && p.status === 'sold').length },
    { name: 'Category D', count: stats.catD, color: 'bg-[#E50914]', textColor: 'text-[#E50914]', sold: players.filter(p => p.category === 'D' && p.status === 'sold').length },
  ];

  const quickActions = [
    { icon: Upload, label: 'Manage Players', desc: '178 players registered', path: '/admin/players' },
    { icon: Trophy, label: 'Manage Teams', desc: '6 teams ready', path: '/admin/teams' },
    { icon: Gavel, label: 'Start Auction', desc: 'Begin live bidding', path: '/admin/auction' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Stadium Background */}
      <div className="relative h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E50914]/20 via-transparent to-[#E50914]/10" />
        
        {/* Header Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <Badge
                  className={`mb-4 ${auctionStatus === 'running' ? 'bg-[#E50914]' : 'bg-gray-700'} text-white border-0`}
                >
                  {auctionStatus === 'running' && <span className="w-2 h-2 rounded-full bg-white animate-ping mr-2" />}
                  {auctionStatus.toUpperCase()}
                </Badge>
                <h1 className="font-heading text-5xl sm:text-6xl font-bold text-white tracking-wider drop-shadow-lg">
                  ADMIN DASHBOARD
                </h1>
                <p className="text-white/90 mt-2 font-medium drop-shadow">KBN Premier League - Season 8</p>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => navigate('/admin/auction')}
                  className="gap-2 font-heading tracking-wider bg-[#E50914] hover:bg-[#F40612] text-white border-0 shadow-netflix"
                >
                  <Play className="h-5 w-5" />
                  {auctionStatus === 'idle' ? 'START AUCTION' : 'GO TO AUCTION'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-16">
        {/* Stats Cards - Slide from Left */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Players', value: stats.total, subValue: `${stats.sold} Sold`, color: 'text-[#E50914]' },
            { icon: Trophy, label: 'Teams', value: teams.length, subValue: `${totalPlayers} Players`, color: 'text-white' },
            { icon: DollarSign, label: 'Total Purse', value: formatCurrency(totalPurse), subValue: `${formatCurrency(spentPurse)} Spent`, color: 'text-green-500' },
            { icon: Target, label: 'Available', value: stats.available, subValue: `${stats.unsold} Unsold`, color: 'text-gray-400' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              data-aos={index % 2 === 0 ? 'fade-right' : 'fade-left'}
              data-aos-delay={index * 100}
            >
              <motion.div whileHover={{ scale: 1.03, y: -5 }} className="card-hover">
                <Card className="bg-white border-gray-200 hover:border-[#E50914]/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                        <p className={`font-heading text-4xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
                      </div>
                      <motion.div
                        className="p-3 rounded-lg bg-gray-50"
                        whileHover={{ rotate: 10 }}
                      >
                        <stat.icon className={`h-7 w-7 ${stat.color}`} />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions - Slide from Left */}
          <div
            data-aos="fade-right"
            data-aos-delay="200"
            className="lg:col-span-1"
          >
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading tracking-wider text-gray-900">
                  <Zap className="h-5 w-5 text-[#E50914]" />
                  QUICK ACTIONS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    whileHover={{ scale: 1.03, x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    data-aos="fade-right"
                    data-aos-delay={300 + index * 100}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-4 px-4 border-gray-200 bg-gray-50 hover:bg-[#E50914]/10 hover:border-[#E50914] text-gray-900 transition-all hover:shadow-lg hover:shadow-[#E50914]/20 group"
                      onClick={() => navigate(action.path)}
                    >
                      <motion.div
                        className="p-2 rounded-lg bg-[#E50914] mr-3"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </motion.div>
                      <div className="text-left">
                        <span className="font-medium block">{action.label}</span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">{action.desc}</span>
                      </div>
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        className="ml-auto"
                      >
                        <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-[#E50914]" />
                      </motion.div>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown - Slide from Right */}
          <div
            data-aos="fade-left"
            data-aos-delay="300"
            className="lg:col-span-2"
          >
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading tracking-wider text-gray-900">
                  <PieChart className="h-5 w-5 text-[#E50914]" />
                  CATEGORY BREAKDOWN
                </CardTitle>
                <CardDescription className="text-gray-600">Player distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {categoryData.map((cat, index) => (
                    <div
                      key={cat.name}
                      data-aos={index % 2 === 0 ? 'fade-right' : 'fade-left'}
                      data-aos-delay={400 + index * 100}
                      className="space-y-2 group"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <motion.div
                            className={`w-4 h-4 rounded ${cat.color}`}
                            whileHover={{ scale: 1.3 }}
                          />
                          <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{cat.name}</span>
                        </div>
                        <span className="text-gray-600">
                          <span className={`font-semibold ${cat.textColor}`}>{cat.sold}</span>/{cat.count} Sold
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(cat.sold / cat.count) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`absolute top-0 left-0 h-full rounded-full ${cat.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Teams Overview - Slide up */}
        <div
          data-aos="fade-up"
          data-aos-delay="400"
          className="mt-6"
        >
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading tracking-wider text-gray-900">
                <Award className="h-5 w-5 text-[#E50914]" />
                TEAMS OVERVIEW
              </CardTitle>
              <CardDescription className="text-gray-600">Current team standings and purse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    data-aos={index % 2 === 0 ? 'fade-right' : 'fade-left'}
                    data-aos-delay={500 + index * 80}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="card-hover"
                  >
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-[#E50914]/50 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-heading font-bold text-xl shadow-md"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.name.charAt(0)}
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{team.name}</h3>
                          <p className="text-xs text-gray-600">{team.players.length}/{team.maxPlayers} Players</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Purse Left</span>
                          <span className="font-semibold text-green-600">{formatCurrency(team.purse)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(team.purse / 10000000) * 100}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-[#E50914] rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

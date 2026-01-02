import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import useAuctionStore from './store/auctionStore';

// Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlayers from './pages/admin/AdminPlayer';
import AdminTeams from './pages/admin/AdminTeams';
import AdminAuction from './pages/admin/AdminAuction';
import PlayerRegistration from './pages/admin/PlayerRegistration';
import OwnerBidding from './pages/owner/OwnerBidding';
import OwnerTeam from './pages/owner/OwnerTeam';
import LiveView from './pages/LiveView';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuctionStore();
  
  if (!currentUser) {
    // Check localStorage as fallback
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/live" element={<LiveView />} />
          <Route path="/register-player" element={<PlayerRegistration />} />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/players" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPlayers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/teams" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminTeams />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/auction"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAuction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/register-player"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PlayerRegistration />
              </ProtectedRoute>
            }
          />

          {/* Team Owner Routes */}
          <Route 
            path="/owner/bid" 
            element={
              <ProtectedRoute allowedRoles={['TEAM_OWNER']}>
                <OwnerBidding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner/team" 
            element={
              <ProtectedRoute allowedRoles={['TEAM_OWNER']}>
                <OwnerTeam />
              </ProtectedRoute>
            } 
          />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
        <Toaster richColors position="top-right" />
      </div>
    </Router>
  );
}

export default App;

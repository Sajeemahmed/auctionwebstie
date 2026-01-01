import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import useAuctionStore from './store/auctionStore';

// Pages
import LoginPage from './pages/LoginPage';
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
    return <Navigate to="/login" replace />;
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
          <Route path="/live" element={<LiveView />} />
          <Route path="/register-player" element={<PlayerRegistration />} />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/players" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPlayers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/teams" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTeams />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/auction"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAuction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/register-player"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlayerRegistration />
              </ProtectedRoute>
            }
          />

          {/* Team Owner Routes */}
          <Route 
            path="/owner/bid" 
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerBidding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner/team" 
            element={
              <ProtectedRoute allowedRoles={['owner']}>
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

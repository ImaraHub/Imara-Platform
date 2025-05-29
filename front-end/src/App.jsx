import ThemeToggle from './components/ThemeToggle';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Auth from './components/Auth';
import BuilderProfile from './components/BuilderProfile';
import CreateIdea from './components/CreateIdea';
import Index from './components/Index';
import Profile from './components/Profile';
import ProjectManager from './components/ProjectManager';
import Stake from './components/stake';
import TokenizationPage from './components/token';
import ViewIdea from './components/ViewIdea';
import ProjectWorkspace from './components/ProjectWorkspace';
// import StakingProfile from './components/StakingProfile';
import JoinGroup from './components/joinGroup';
import AuthCallback from './components/AuthCallback';
import ProfileSettings from './components/ProfileSettings';
import { useAuth } from './AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
     {/* <div className="min-h-screen bg-background text-text">
        <header className="p-4 fixed top-4 right-4 justify-end">
          <ThemeToggle />
        </header> */}
        
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/home" /> : <Index />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/home" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* <Route path="/builder-profile" element={<BuilderProfile />} /> */}
        <Route path="/home" element={user ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/idea" element={user ? <CreateIdea /> : <Navigate to="/auth" />} />
        <Route path="/idea/:id" element={user ? <ViewIdea /> : <Navigate to="/auth" />} />
        <Route path="/idea/:id/workspace" element={user ? <ProjectWorkspace /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
        <Route path="/profile/settings" element={user ? <ProfileSettings /> : <Navigate to="/auth" />} />
        <Route path="/project-manager" element={user ? <ProjectManager /> : <Navigate to="/auth" />} />
        <Route path="/stake" element={user ? <Stake /> : <Navigate to="/auth" />} />
        <Route path="/token" element={user ? <TokenizationPage /> : <Navigate to="/auth" />} />
        {/* <Route path="/staking-profile" element={<StakingProfile/>} /> */}
        <Route path="/join-group" element={user ? <JoinGroup /> : <Navigate to="/auth" />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
      </Routes>
      {/* </div> */}
    </Router>
    

  );
}

export default App;

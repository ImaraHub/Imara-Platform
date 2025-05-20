import ThemeToggle from './components/ThemeToggle';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
// import StakingProfile from './components/StakingProfile';
import JoinGroup from './components/joinGroup';
import AuthCallback from './components/AuthCallback';
import ProfileSettings from './components/ProfileSettings';

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
     {/* <div className="min-h-screen bg-background text-text">
        <header className="p-4 fixed top-4 right-4 justify-end">
          <ThemeToggle />
        </header> */}
        
      <Routes>
        {/* Redirect unauthenticated users to Auth */}

        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* <Route path="/builder-profile" element={<BuilderProfile />} /> */}
        <Route path="/create-idea" element={<CreateIdea />} />
        <Route path="/ideas" element={<Index />} />
        {/* <Route path="/profile" element={<Profile />} /> */}
        <Route path="/project-manager" element={<ProjectManager />} />
        <Route path="/stake" element={<Stake />} />
        <Route path="/token" element={<TokenizationPage />} />
        <Route path="/view-idea" element={<ViewIdea />} />
        <Route path="/profile" element={<ProfileSettings />} />
        {/* <Route path="/staking-profile" element={<StakingProfile/>} /> */}
        <Route path="/join-group" element={<JoinGroup />} />
      </Routes>
      {/* </div> */}
    </Router>
    

  );
}

export default App;

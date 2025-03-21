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
function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Redirect unauthenticated users to Auth */}

        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/builder-profile" element={<BuilderProfile />} />
        <Route path="/create-idea" element={<CreateIdea />} />
        <Route path="/ideas" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/project-manager" element={<ProjectManager />} />
        <Route path="/stake" element={<Stake />} />
        <Route path="/token" element={<TokenizationPage />} />
        <Route path="/view-idea" element={<ViewIdea />} />
        {/* <Route path="/staking-profile" element={<StakingProfile/>} /> */}
        <Route path="/join-group" element={<JoinGroup />} />
      </Routes>
    </Router>

  )
}

export default App;
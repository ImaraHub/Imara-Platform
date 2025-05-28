import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import ProjectCard from './components/projects/ProjectCard';
import StakingForm from './components/projects/StakingForm';
import MilestoneTracker from './components/projects/MilestoneTracker';
import TeamMatcher from './components/teams/TeamMatcher';

// Main content component
const MainContent = () => {
  const {
    projects,
    selectedProject,
    loading,
    error,
    selectProject,
    createProject,
    updateProject
  } = useApp();

  // Handle project selection
  const handleProjectSelect = (project) => {
    selectProject(project.id);
  };

  // Handle staking
  const handleStake = async (amount) => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, {
      stakeAmount: (selectedProject.stakeAmount || 0) + amount
    });
  };

  // Handle milestone update
  const handleMilestoneUpdate = async (milestoneId, status) => {
    if (!selectedProject) return;
    const updatedMilestones = selectedProject.milestones.map((m) =>
      m.id === milestoneId ? { ...m, status } : m
    );
    await updateProject(selectedProject.id, { milestones: updatedMilestones });
  };

  // Handle team match
  const handleTeamMatch = async (team) => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, { team });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Imara Platform</h1>
        <p className="text-gray-600 mt-2">
          Connect with teams and build amazing projects together
        </p>
      </header>

      <main>
        {selectedProject ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ProjectCard
                project={selectedProject}
                onSelect={handleProjectSelect}
              />
              <div className="mt-6">
                <StakingForm
                  projectId={selectedProject.id}
                  minStake={selectedProject.minStake}
                  onStake={handleStake}
                />
              </div>
            </div>
            <div className="space-y-6">
              <MilestoneTracker
                projectId={selectedProject.id}
                onMilestoneUpdate={handleMilestoneUpdate}
              />
              <TeamMatcher
                project={selectedProject}
                onTeamMatch={handleTeamMatch}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={handleProjectSelect}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Root App component
const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;

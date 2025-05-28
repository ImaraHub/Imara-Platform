import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { teams } from '../../services/api';

const TeamMatcher = ({ project }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);

  // Find matching teams for the project
  const findTeamMatches = async () => {
    if (!user) {
      setError('Please connect your wallet to find team matches');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const matchingTeams = await teams.findMatches({
        skills: project.skills,
        teamSize: project.teamSize,
        duration: project.duration
      });
      setMatches(matchingTeams);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find team matches');
    } finally {
      setLoading(false);
    }
  };

  // Handle team selection
  const handleTeamSelect = async (team) => {
    if (!user) {
      setError('Please connect your wallet to select a team');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add user as member to selected team
      await teams.addMember(team.id, user.address, 'member');
      // TODO: Update project with selected team
      alert('Successfully joined team!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Find Matching Teams</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={findTeamMatches}
        disabled={loading || !user}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Finding matches...' : 'Find Matching Teams'}
      </button>

      {matches.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Suggested Teams</h3>
          <div className="space-y-4">
            {matches.map(({ team, score, matchDetails }) => (
              <div
                key={team.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold">{team.name}</h4>
                    <p className="text-gray-600">{team.description}</p>
                    <div className="mt-2">
                      <span className="text-sm font-medium">Match Score: </span>
                      <span className="text-sm text-green-600">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <div>Skill Match: {Math.round(matchDetails.skillMatch * 100)}%</div>
                      <div>Reputation: {Math.round(matchDetails.reputationScore * 100)}%</div>
                      <div>Team Size: {Math.round(matchDetails.teamSizeScore * 100)}%</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTeamSelect(team)}
                    disabled={loading}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    Join Team
                  </button>
                </div>
                <div className="mt-3">
                  <h5 className="text-sm font-medium">Team Members:</h5>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {team.members.map((member) => (
                      <span
                        key={member.address}
                        className="bg-gray-100 px-2 py-1 rounded text-sm"
                      >
                        {member.role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMatcher; 
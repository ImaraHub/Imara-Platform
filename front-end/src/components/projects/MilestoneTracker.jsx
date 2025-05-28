import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { milestoneContract } from '../../services/contracts';

const MilestoneTracker = ({ projectId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [milestones, setMilestones] = useState([]);

  // Fetch project milestones
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const project = await milestoneContract.getProject(projectId);
        // TODO: Implement milestone listing in contract
        // For now, use mock data
        setMilestones([
          {
            id: 1,
            title: 'Milestone 1',
            description: 'First milestone',
            amount: 3,
            isCompleted: true,
            isFunded: true,
            validators: []
          },
          {
            id: 2,
            title: 'Milestone 2',
            description: 'Second milestone',
            amount: 4,
            isCompleted: false,
            isFunded: false,
            validators: []
          }
        ]);
      } catch (err) {
        setError(err.message || 'Failed to fetch project milestones');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Create new milestone
  const handleCreateMilestone = async (milestoneData) => {
    if (!user) {
      setError('Please connect your wallet to create milestones');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const milestoneId = await milestoneContract.createMilestone(
        projectId,
        milestoneData.title,
        milestoneData.description,
        milestoneData.amount
      );
      
      const milestone = await milestoneContract.getMilestone(projectId, milestoneId);
      setMilestones([...milestones, milestone]);
    } catch (err) {
      setError(err.message || 'Failed to create milestone');
    } finally {
      setLoading(false);
    }
  };

  // Update milestone status
  const handleUpdateStatus = async (milestoneId, status) => {
    if (!user) {
      setError('Please connect your wallet to update milestone status');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (status === 'completed') {
        await milestoneContract.approveMilestone(projectId, milestoneId);
        await milestoneContract.releaseFunds(projectId, milestoneId);
      }

      const milestone = await milestoneContract.getMilestone(projectId, milestoneId);
      setMilestones(
        milestones.map((m) => (m.id === milestoneId ? milestone : m))
      );
    } catch (err) {
      setError(err.message || 'Failed to update milestone status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Project Milestones</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading milestones...</div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{milestone.title}</h3>
                  <p className="text-gray-600 mt-1">{milestone.description}</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Amount: </span>
                    <span className="text-sm text-green-600">
                      {milestone.amount} ETH
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      milestone.isCompleted
                        ? 'bg-green-100 text-green-800'
                        : milestone.isFunded
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {milestone.isCompleted
                      ? 'Completed'
                      : milestone.isFunded
                      ? 'Funded'
                      : 'Pending'}
                  </span>
                  {!milestone.isCompleted && (
                    <button
                      onClick={() => handleUpdateStatus(milestone.id, 'completed')}
                      disabled={loading}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
              {milestone.validators && milestone.validators.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium">Validators:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {milestone.validators.map((validator) => (
                      <span
                        key={validator}
                        className="bg-gray-100 px-2 py-1 rounded text-sm"
                      >
                        {validator.slice(0, 6)}...{validator.slice(-4)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {milestones.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No milestones created yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker; 
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

const MilestoneTracker = ({ project, onMilestoneUpdate }) => {
  const { user } = useAuth();
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [submission, setSubmission] = useState({
    description: '',
    links: [''],
    files: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    try {
      // TODO: Implement milestone submission
      await onMilestoneUpdate(selectedMilestone.id, submission);
      setSubmission({ description: '', links: [''], files: [] });
      setSelectedMilestone(null);
    } catch (error) {
      console.error('Error submitting milestone:', error);
    }
  };

  const addLink = () => {
    setSubmission(prev => ({
      ...prev,
      links: [...prev.links, '']
    }));
  };

  const updateLink = (index, value) => {
    setSubmission(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? value : link)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Milestones</h3>

      <div className="space-y-4">
        {project.milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`p-4 rounded-lg border ${
              milestone.status === 'completed'
                ? 'border-green-200 bg-green-50'
                : milestone.status === 'in_progress'
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                milestone.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : milestone.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {milestone.status}
              </span>
            </div>

            {milestone.status === 'pending' && user && (
              <button
                onClick={() => setSelectedMilestone(milestone)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Submit Milestone
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedMilestone && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-4">
            Submit Milestone: {selectedMilestone.title}
          </h4>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={submission.description}
                onChange={(e) => setSubmission(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Links
              </label>
              {submission.links.map((link, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter URL"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addLink}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Link
              </button>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedMilestone(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker; 
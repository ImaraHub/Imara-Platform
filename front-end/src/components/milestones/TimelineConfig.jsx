import React, { useState, useEffect } from 'react';

const TimelineConfig = ({ onTimelineUpdate, projectId }) => {
  const [timeline, setTimeline] = useState({
    startDate: '',
    endDate: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkExistingTimeline = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/projects/${projectId}/timeline`);
        if (!response.ok) {
          throw new Error('Failed to fetch timeline');
        }
        const data = await response.json();

        console.log(data);
        
        // If timeline exists, update the parent component
        if (data && data.length > 0) {
          const existingTimeline = data[0];
          onTimelineUpdate({
            startDate: existingTimeline.start_date,
            endDate: existingTimeline.end_date,
            description: existingTimeline.description
          });
        }
      } catch (error) {
        console.error('Error checking timeline:', error);
        setError('Failed to check existing timeline');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingTimeline();
  }, [projectId, onTimelineUpdate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onTimelineUpdate(timeline);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking existing timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6">Project Timeline Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={timeline.startDate}
            onChange={(e) => setTimeline({ ...timeline, startDate: e.target.value })}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={timeline.endDate}
            onChange={(e) => setTimeline({ ...timeline, endDate: e.target.value })}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Timeline Description
          </label>
          <textarea
            value={timeline.description}
            onChange={(e) => setTimeline({ ...timeline, description: e.target.value })}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter a brief description of the project timeline..."
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Save Timeline Configuration
        </button>
      </form>
    </div>
  );
};

export default TimelineConfig; 
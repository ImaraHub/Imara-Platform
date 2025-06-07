import React, { useState, useEffect } from 'react';
import { Plus, Upload, Calendar } from 'lucide-react';
import MilestoneCard from './MilestoneCard';

const MilestoneList = ({ projectId, timeline }) => {
  const [milestones, setMilestones] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending'
  });

  useEffect(() => {
    const fetchMilestones = async () => {
      setIsLoading(true);
      try {
        // Here you would typically fetch milestones from your backend
        // For now, we'll use a mock API call
        const response = await fetch(`/api/projects/${projectId}/milestones`);
        const data = await response.json();
        setMilestones(data);
      } catch (error) {
        console.error('Error fetching milestones:', error);
        // For development, use mock data
        setMilestones([
          {
            id: 1,
            title: 'Project Setup',
            description: 'Complete initial project setup and team onboarding',
            dueDate: '2024-03-15',
            status: 'in_progress',
            tasks: [
              {
                id: 1,
                title: 'Set up project repository',
                assignee: 'John Doe',
                dueDate: '2024-03-10',
                status: 'completed',
                reviewed: true
              },
              {
                id: 2,
                title: 'Configure development environment',
                assignee: 'Jane Smith',
                dueDate: '2024-03-12',
                status: 'in_progress',
                reviewed: false
              }
            ]
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically save the milestone to your backend
      const milestone = {
        id: Date.now(),
        ...newMilestone,
        tasks: []
      };
      setMilestones([...milestones, milestone]);
      setNewMilestone({
        title: '',
        description: '',
        dueDate: '',
        status: 'pending'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const handleAddTask = async (milestoneId, task) => {
    try {
      // Here you would typically save the task to your backend
      setMilestones(milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return {
            ...milestone,
            tasks: [...milestone.tasks, { id: Date.now(), ...task, status: 'pending', reviewed: false }]
          };
        }
        return milestone;
      }));
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleTaskUpdate = async (milestoneId, taskId, updates) => {
    try {
      // Here you would typically update the task in your backend
      setMilestones(milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return {
            ...milestone,
            tasks: milestone.tasks.map(task => {
              if (task.id === taskId) {
                return { ...task, ...updates };
              }
              return task;
            })
          };
        }
        return milestone;
      }));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskReview = async (milestoneId, taskId) => {
    try {
      // Here you would typically update the task review status in your backend
      setMilestones(milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          const updatedTasks = milestone.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, reviewed: true };
            }
            return task;
          });
          
          // Check if all tasks are completed and reviewed
          const allTasksCompleted = updatedTasks.every(task => 
            task.status === 'completed' && task.reviewed
          );
          
          return {
            ...milestone,
            tasks: updatedTasks,
            status: allTasksCompleted ? 'completed' : milestone.status
          };
        }
        return milestone;
      }));
    } catch (error) {
      console.error('Error reviewing task:', error);
    }
  };

  const handleFileUpload = (milestoneId, taskId, file) => {
    // Here you would typically upload the file to your storage service
    // and get back a URL. For now, we'll just use a placeholder URL
    const evidenceUrl = URL.createObjectURL(file);
    handleTaskUpdate(milestoneId, taskId, { evidence: evidenceUrl });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading milestones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Project Milestones</h2>
          <p className="text-sm text-gray-400 mt-1">
            Timeline: {new Date(timeline.startDate).toLocaleDateString()} - {new Date(timeline.endDate).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Milestone
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Milestone</h3>
          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min={timeline.startDate}
                max={timeline.endDate}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Milestone
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {milestones.length > 0 ? (
          milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onAddTask={handleAddTask}
              onTaskUpdate={handleTaskUpdate}
              onTaskReview={handleTaskReview}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No milestones yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneList; 
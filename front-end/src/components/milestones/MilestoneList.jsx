import React, { useState, useEffect } from 'react';
import { Plus, Upload, Calendar, User, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import MilestoneCard from './MilestoneCard';
import { supabase } from '../../utils/SupabaseClient';

const MilestoneList = ({ projectId, timeline, contributors }) => {
  const [milestones, setMilestones] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending'
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    assigneeId: '',
    dueDate: '',
    status: 'pending'
  });

  // Add debug logging for timeline
  useEffect(() => {
    console.log('Timeline data received:', timeline);
    if (timeline) {
      console.log('Start date:', timeline.startDate, 'Type:', typeof timeline.startDate);
      console.log('End date:', timeline.endDate, 'Type:', typeof timeline.endDate);
    }
  }, [timeline]);

  useEffect(() => {
    // Get current user from Supabase
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMilestones = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/projects/${projectId}/milestones`);
        if (!response.ok) {
          throw new Error('Failed to fetch milestones');
        }
        const data = await response.json();
        console.log('Fetched milestones:', data);
        setMilestones(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching milestones:', error);
        setMilestones([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      console.error('No authenticated user found');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          title: newMilestone.title,
          description: newMilestone.description,
          due_date: newMilestone.dueDate,
          created_by: currentUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create milestone');
      }

      const data = await response.json();
      // Ensure we're working with an array
      const newMilestoneData = Array.isArray(data) ? data[0] : data;
      setMilestones(prevMilestones => [...(Array.isArray(prevMilestones) ? prevMilestones : []), newMilestoneData]);
      
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
    if (!currentUser) {
      console.error('No authenticated user found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/milestones/${milestoneId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          milestone_id: milestoneId,
          title: task.title,
          description: task.description || '',
          assignee_id: task.assigneeId,
          due_date: task.dueDate,
          status: 'pending',
          reviewed: false,
          created_by: currentUser.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Task creation error:', errorData);
        throw new Error(errorData.message || 'Failed to create task');
      }

      // For POST request, we expect a single task object
      const newTask = await response.json();
      
      if (!newTask || !newTask.id) {
        throw new Error('Invalid task data received from server');
      }

      setMilestones(milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return {
            ...milestone,
            tasks: [...(milestone.tasks || []), newTask]
          };
        }
        return milestone;
      }));

      setNewTask({ 
        title: '', 
        description: '',
        assignee: '', 
        assigneeId: '', 
        dueDate: '', 
        status: 'pending' 
      });
    } catch (error) {
      console.error('Error adding task:', error);
      alert(`Failed to create task: ${error.message}`);
    }
  };

  const handleTaskUpdate = async (milestoneId, taskId, updates) => {
    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

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
      const response = await fetch(`http://localhost:8080/api/tasks/${taskId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to review task');
      }

      setMilestones(milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          const updatedTasks = milestone.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, reviewed: true };
            }
            return task;
          });
          
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

  const handleFileUpload = async (milestoneId, taskId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('task_id', taskId);

      const response = await fetch(`http://localhost:8080/api/tasks/${taskId}/evidence`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload evidence');
      }

      const { evidenceUrl } = await response.json();
    handleTaskUpdate(milestoneId, taskId, { evidence: evidenceUrl });
    } catch (error) {
      console.error('Error uploading evidence:', error);
    }
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
            Timeline: {timeline?.startDate ? new Date(timeline.startDate).toLocaleDateString() : 'Not set'} - {timeline?.endDate ? new Date(timeline.endDate).toLocaleDateString() : 'Not set'}
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
                min={timeline?.startDate}
                max={timeline?.endDate}
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
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading milestones...</p>
          </div>
        ) : milestones.length > 0 ? (
          milestones.map((milestone) => (
            <div key={milestone.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setExpandedMilestone(expandedMilestone === milestone.id ? null : milestone.id)}
              >
                <div className="flex items-center gap-3">
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : milestone.status === 'in_progress' ? (
                    <Clock className="w-5 h-5 text-blue-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  )}
                  <h3 className="text-xl font-semibold">{milestone.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  milestone.status === 'completed' 
                    ? 'bg-green-500/20 text-green-400'
                    : milestone.status === 'in_progress'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {milestone.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-400 mb-4">{milestone.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Created by: {milestone.created_by}</span>
                </div>
              </div>

              {expandedMilestone === milestone.id && (
                <div className="mt-6 space-y-4">
                  {/* Tasks List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Tasks</h4>
                    {milestone.tasks?.map((task, index) => (
                      <div key={task.id} className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">#{index + 1}</span>
                            <h5 className="font-medium">{task.title}</h5>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400'
                              : task.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{task.assignee}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {task.evidence && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                            <FileText className="w-4 h-4" />
                            <a href={task.evidence} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                              View Evidence
                            </a>
                          </div>
                        )}
                        {task.status === 'completed' && !task.reviewed && (
                          <button
                            onClick={() => handleTaskReview(milestone.id, task.id)}
                            className="mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30"
                          >
                            Review Task
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Task Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTask(milestone.id, newTask);
                  }} className="bg-gray-900/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Add New Task</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Task title"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <textarea
                        value={newTask.description || ''}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Task description"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                      />
                      <select
                        value={newTask.assignee}
                        onChange={(e) => {
                          const selectedOption = e.target.options[e.target.selectedIndex];
                          const userId = selectedOption.getAttribute('data-user-id');
                          setNewTask({ 
                            ...newTask, 
                            assignee: e.target.value,
                            assigneeId: userId 
                          });
                        }}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Assignee</option>
                        {contributors.map((contributor) => (
                          <option 
                            key={contributor.user?.email} 
                            value={contributor.user?.email}
                            data-user-id={contributor.user_id}
                          >
                            {contributor.user?.display_name || 'Anonymous User'} ({contributor.user?.email})
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min={timeline?.startDate}
                        max={timeline?.endDate}
                      />
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
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
import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, User, Plus } from 'lucide-react';

const MilestoneCard = ({ milestone, onUpdate, onAddTask, onTaskUpdate, onTaskReview }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignee: '', dueDate: '' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    onAddTask(milestone.id, newTask);
    setNewTask({ title: '', assignee: '', dueDate: '' });
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {milestone.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : milestone.status === 'in_progress' ? (
            <Clock className="w-5 h-5 text-blue-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <h3 className="text-lg font-medium">{milestone.title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(milestone.status)}`}>
          {milestone.status.replace('_', ' ')}
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <p className="text-gray-400">{milestone.description}</p>
          
          {/* Tasks List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Tasks</h4>
            {milestone.tasks.map((task, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">#{index + 1}</span>
                    <h5 className="font-medium">{task.title}</h5>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{task.assignee}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
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
                    onClick={() => onTaskReview(milestone.id, task.id)}
                    className="mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30"
                  >
                    Review Task
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Task Form */}
          <form onSubmit={handleAddTask} className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Add New Task</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                placeholder="Assignee"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
  );
};

export default MilestoneCard; 
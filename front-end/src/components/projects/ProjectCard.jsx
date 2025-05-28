import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { projects } from '../../services/api';

const ProjectCard = ({ project, onSelect }) => {
  const { user } = useAuth();

  // Format date to readable string
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect(project)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
          <p className="text-sm text-gray-500">
            Created by {project.owner.slice(0, 6)}...{project.owner.slice(-4)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            project.status === 'active'
              ? 'bg-green-100 text-green-800'
              : project.status === 'completed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {project.status}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{project.description}</p>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Required Skills</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {project.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Team Size</h4>
            <p className="text-gray-600">{project.teamSize} members</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Duration</h4>
            <p className="text-gray-600">{project.duration} weeks</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Total Amount</h4>
            <p className="text-green-600 font-medium">{project.totalAmount} ETH</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Min Stake</h4>
            <p className="text-gray-600">{project.minStake} ETH</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">Milestones</h4>
          <div className="mt-1">
            <div className="flex items-center">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{
                    width: `${
                      (project.milestones.filter((m) => m.isCompleted).length /
                        project.milestones.length) *
                      100
                    }%`
                  }}
                />
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {project.milestones.filter((m) => m.isCompleted).length}/
                {project.milestones.length}
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Created on {formatDate(project.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 
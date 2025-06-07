import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, MessageSquare, Calendar, CheckCircle, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllProjectContributors } from '../utils/SupabaseClient';
import MilestoneList from './milestones/MilestoneList';
import TimelineConfig from './milestones/TimelineConfig';

function ProjectWorkspace() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('members'); // members, chat, milestones
  const [contributors, setContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeline, setTimeline] = useState(null);

  useEffect(() => {
    const fetchContributors = async () => {
      if (activeTab === 'members') {
        setIsLoading(true);
        try {
          const data = await getAllProjectContributors(id);
          if (data) {
            setContributors(data);
          }
        } catch (error) {
          console.error('Error fetching contributors:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchContributors();
  }, [activeTab, id]);

  const handleTimelineUpdate = (newTimeline) => {
    setTimeline(newTimeline);
    // Here you would typically save the timeline to your backend
    console.log('Timeline updated:', newTimeline);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Project
        </button>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'members'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'milestones'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Milestones
          </button>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'members' && (
              <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6">Team Members</h2>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading team members...</p>
                    </div>
                  ) : contributors.length > 0 ? (
                    contributors.map((contributor, index) => (
                      <div
                        key={index}
                        className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-white">
                              {contributor.user?.username || 'Anonymous User'}
                            </h3>
                            <p className="text-gray-400">{contributor.user?.email || 'No email provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                            {contributor.role}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            contributor.approved_status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : contributor.approved_status === 'approved'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {contributor.approved_status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No team members yet</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'chat' && (
              <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6">Project Chat</h2>
                <div className="h-[600px] flex flex-col">
                  <div className="flex-1 bg-gray-900/50 rounded-lg p-4 mb-4 overflow-y-auto">
                    {/* Chat messages will be displayed here */}
                    <p className="text-gray-400">Chat coming soon...</p>
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Send
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'milestones' && (
              <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                {!timeline ? (
                  <TimelineConfig onTimelineUpdate={handleTimelineUpdate} />
                ) : (
                  <MilestoneList projectId={id} timeline={timeline} />
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Progress</p>
                  <div className="w-full h-2 bg-gray-700 rounded-full mt-2">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }} />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">25% Complete</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Next Milestone</p>
                  <p className="text-white mt-1">Project Setup</p>
                  <p className="text-sm text-gray-400">Due in 5 days</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectWorkspace; 
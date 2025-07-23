import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, MessageSquare, Calendar, CheckCircle, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllProjectContributors, createChatMessage, getChatMessages, createInitialChatMessage } from '../utils/SupabaseClient';
import { supabase } from '../utils/SupabaseClient';
import { useAuth } from '../AuthContext';
import MilestoneList from './milestones/MilestoneList';
import TimelineConfig from './milestones/TimelineConfig';


const BACKEND_MILESTONE_URL = import.meta.env.VITE_MILESTONE_BACKEND_URL; // Update with your backend URL

function ProjectWorkspace() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('members'); // members, chat, milestones
  const [contributors, setContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [timeline, setTimeline] = useState(null);
  const [projectProgress, setProjectProgress] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(null);

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

  useEffect(() => {
    if (activeTab === 'chat') {
      // Fetch initial messages
      const fetchMessages = async () => {
        const chatMessages = await getChatMessages(id);
        setMessages(chatMessages);
      };
      fetchMessages();

      // Subscribe to new messages
      const messagesSubscription = supabase
        .channel('chat_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `project_id=eq.${id}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();

      // Subscribe to typing indicators
      const typingSubscription = supabase
        .channel('typing_indicators')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `project_id=eq.${id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new.is_typing) {
              setTypingUsers(prev => {
                const filtered = prev.filter(u => u.user_id !== payload.new.user_id);
                return [...filtered, payload.new];
              });
            } else {
              setTypingUsers(prev => prev.filter(u => u.user_id !== payload.new.user_id));
            }
          } else if (payload.eventType === 'DELETE') {
            setTypingUsers(prev => prev.filter(u => u.user_id !== payload.old.user_id));
          }
        })
        .subscribe();

      return () => {
        messagesSubscription.unsubscribe();
        typingSubscription.unsubscribe();
      };
    }
  }, [activeTab, id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageChange = async (e) => {
    setNewMessage(e.target.value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing indicator
    if (!isTyping) {
      setIsTyping(true);
    }

    // Clear typing indicator after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistically add the message to the UI
    const optimisticMessage = {
      message: newMessage,
      username: user.user_metadata?.username || user.email?.split('@')[0],
      email: user.email,
      user_id: user.id,
      created_at: new Date().toISOString(),
      is_system_message: false,
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setIsTyping(false);

    try {
      await createChatMessage(id, user.id, newMessage.trim(), {
        username: optimisticMessage.username,
        email: optimisticMessage.email,
      });
      // Optionally: you could refresh messages from DB here if you want to ensure consistency
    } catch (error) {
      // Remove the optimistic message and show an error
      setMessages(prev => prev.filter(m => m !== optimisticMessage));
      alert('Failed to send message');
    }
  };

  const handleTimelineUpdate = async (newTimeline) => {
    try {
      // First check if a timeline already exists
      const checkResponse = await fetch(`${BACKEND_MILESTONE_URL}/api/projects/${id}/timeline`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!checkResponse.ok) {
        throw new Error(`Failed to check timeline: ${checkResponse.statusText}`);
      }

      const existingTimeline = await checkResponse.json();
      console.log('Existing timeline:', existingTimeline);

      // If timeline exists, just update the state
      if (existingTimeline && existingTimeline.start_date) {
        console.log('Timeline already exists, updating state only');
        setTimeline({
          startDate: existingTimeline.start_date,
          endDate: existingTimeline.end_date,
          description: existingTimeline.description
        });
        return;
      }

      // If no timeline exists, save the new one
      console.log('No existing timeline, saving new timeline');
      const response = await fetch(`${BACKEND_MILESTONE_URL}/api/timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: id,
          start_date: newTimeline.startDate,
          end_date: newTimeline.endDate,
          description: newTimeline.description || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Timeline save error response:', errorData);
        throw new Error(errorData.message || `Failed to save timeline: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Timeline saved successfully:', data);
      setTimeline(newTimeline);
      alert('Timeline saved successfully!');
    
    } catch (error) {
      console.error('Error handling timeline:', error);
      alert(`Failed to handle timeline: ${error.message}`);
    }
  };

  // Update useEffect to calculate progress and find next milestone
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await fetch(`${BACKEND_MILESTONE_URL}/projects/${id}/milestones`);
        if (!response.ok) {
          throw new Error('Failed to fetch milestones');
        }
        const milestones = await response.json();
        
        // Calculate progress and find next milestone
        const progress = calculateProjectProgress(milestones);
        setProjectProgress(progress);
        
        const next = findNextMilestone(milestones);
        setNextMilestone(next);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    fetchMilestones();
  }, [id]);

  // Add function to calculate project progress
  const calculateProjectProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;

    let totalProgress = 0;
    const milestoneWeight = 100 / milestones.length; // Each milestone contributes equally to total progress

    milestones.forEach(milestone => {
      if (!milestone.milestone_tasks || milestone.milestone_tasks.length === 0) {
        // If milestone has no tasks, it's considered complete when its status is 'completed'
        if (milestone.status === 'completed') {
          totalProgress += milestoneWeight;
        }
        return;
      }

      const taskWeight = milestoneWeight / milestone.milestone_tasks.length;
      const completedTasks = milestone.milestone_tasks.filter(task => task.status === 'completed').length;
      totalProgress += completedTasks * taskWeight;
    });

    return Math.round(totalProgress);
  };

  // Add function to find next milestone
  const findNextMilestone = (milestones) => {
    if (!milestones || milestones.length === 0) return null;

    const now = new Date();
    const upcomingMilestones = milestones
      .filter(milestone => milestone.status !== 'completed')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    if (upcomingMilestones.length === 0) return null;

    const next = upcomingMilestones[0];
    const dueDate = new Date(next.due_date);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    return {
      ...next,
      daysUntilDue: daysUntilDue > 0 ? daysUntilDue : 0
    };
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
                              {contributor.user?.display_name || 'Anonymous User'}
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
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 ${
                          message.is_system_message
                            ? 'text-center'
                            : message.user_id === user.id
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block max-w-[80%] rounded-lg p-3 ${
                            message.is_system_message
                              ? 'bg-blue-500/20 text-blue-400'
                              : message.user_id === user.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          {!message.is_system_message && (
                            <div className="text-xs text-gray-300 mb-1">
                              {message.username}
                            </div>
                          )}
                          <p>{message.message}</p>
                          <div className="text-xs text-gray-300 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Typing Indicators */}
                  {typingUsers.length > 0 && (
                    <div className="text-sm text-gray-400 mb-2">
                      {typingUsers.map((typingUser, index) => (
                        <span key={typingUser.user_id}>
                          {typingUser.username || 'Someone'}{' '}
                          {index === typingUsers.length - 1 ? 'is' : 'are'} typing...
                          {index < typingUsers.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex gap-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleMessageChange}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </section>
            )}

            {activeTab === 'milestones' && (
              <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                {!timeline ? (
                  <TimelineConfig onTimelineUpdate={handleTimelineUpdate} projectId={id} />
                ) : (
                  <MilestoneList 
                    projectId={id} 
                    timeline={timeline} 
                    contributors={contributors}
                  />
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
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${projectProgress}%` }} />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{projectProgress}% Complete</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Next Milestone</p>
                  {nextMilestone ? (
                    <>
                      <p className="text-white mt-1">{nextMilestone.title}</p>
                      <p className="text-sm text-gray-400">
                        Due in {nextMilestone.daysUntilDue} {nextMilestone.daysUntilDue === 1 ? 'day' : 'days'}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">No upcoming milestones</p>
                  )}
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

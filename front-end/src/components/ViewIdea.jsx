import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  MessageSquare, 
  ArrowBigUp, 
  ArrowBigDown,
  User,
  Calendar,
  Link as LinkIcon,
  Globe,
  Scale,
  Tag,
  Facebook,
  Twitter,
  Copy,
  Check,
  X,
  Loader,
  Users
} from 'lucide-react';

import { useNavigate, useLocation, useParams } from 'react-router-dom';
import JoinGroup from './joinGroup';
import { useAuth } from '../AuthContext';
import { getProjectContributors, fetchProjectById, isRoleAvailable } from '../utils/SupabaseClient';
import { supabase } from '../utils/SupabaseClient';

function ViewIdea({ project: propProject = {}, stakeSuccess = false, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  
  // All useState declarations at the top
  const [projectData, setProjectData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [joinStatus, setJoinStatus] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isContributor, setIsContributor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roleAvailability, setRoleAvailability] = useState({});
  const [isTeamFull, setIsTeamFull] = useState(false);

  const stakingSuccess = stakeSuccess || location.state?.stakeSuccess || false;
  const isContributorFromState = location.state?.isContributor || false;

  // Memoize the initial project data to prevent unnecessary re-renders
  const initialProjectData = React.useMemo(() => {
    return location.state?.project || propProject;
  }, [location.state?.project, propProject]);

  // Memoize the project ID to prevent unnecessary re-renders
  const projectId = React.useMemo(() => {
    return id || initialProjectData?.id;
  }, [id, initialProjectData?.id]);

  // Add this function to check role availability
  const checkRoleAvailability = async (projectData) => {
    if (!projectData || !projectData.resources) return;

    const resources = typeof projectData.resources === 'string' 
      ? JSON.parse(projectData.resources) 
      : projectData.resources;

    const availability = {};
    let totalRequired = 0;
    let totalFilled = 0;

    for (const resource of resources) {
      const isAvailable = await isRoleAvailable(projectData.id, resource.role);
      availability[resource.role] = isAvailable;
      
      // Get current count of contributors for this role
      const { data: contributors } = await supabase
        .from('idea_contributors')
        .select('*')
        .eq('idea_id', projectData.id)
        .eq('role', resource.role)
        .eq('approved_status', 'pending');

      const filledCount = contributors?.length || 0;
      availability[`${resource.role}_count`] = filledCount;
      
      totalRequired += resource.count;
      totalFilled += filledCount;
    }

    setRoleAvailability(availability);
    setIsTeamFull(totalFilled >= totalRequired);
  };

  // Update the useEffect to include role availability check
  useEffect(() => {
    let isMounted = true;
    let shouldFetch = false;

    const fetchData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        let data = initialProjectData;
        shouldFetch = (!data || Object.keys(data).length === 0) && !!projectId;
        
        if (shouldFetch) {
          data = await fetchProjectById(projectId);
          if (data && isMounted) {
            setProjectData(data);
            await checkRoleAvailability(data);
          }
        } else if (data && isMounted) {
          setProjectData(data);
          await checkRoleAvailability(data);
        }

        if (user && data?.id && isMounted) {
          if (isContributorFromState) {
            setIsContributor(true);
            setJoinStatus("confirmed");
          } else {
            const contributorData = await getProjectContributors(data, user);
            if (contributorData && contributorData.length > 0 && isMounted) {
              setIsContributor(true);
              setJoinStatus("confirmed");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (projectId || initialProjectData) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [projectId, initialProjectData, user, isContributorFromState]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!projectData || Object.keys(projectData).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Project Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (showJoinGroup && !stakingSuccess){
    return <JoinGroup project={projectData}  onBack={() => setShowJoinGroup(false)}/>;
  }

  const handleCopyLink = () => {
    const url = `https://imarahub.xyz/idea/${projectData?.id || "unknown"}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleComment = (e) => {
    e.preventDefault();
    console.log('Comment submitted:', comment);
    setComment('');
    setShowCommentBox(false);
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-2); // Go back one step in history
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-8 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </button>

        {/* Project Header */}
        <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
          <img
            src={projectData.image}
            alt={projectData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {projectData.category}
                </span>
                <div className="flex items-center gap-2">
                  {/* <div className="w-32 h-2 bg-gray-700 rounded-full"> */}
                    {/* <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${projectData.progress}%` }}
                    /> */}
                  {/* </div> */}
                  <span className="text-gray-400 text-sm">{projectData.progress}% Complete</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">{projectData.title}</h1>
              <div className="flex items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{projectData.createdBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(projectData.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Project Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{projectData.projectDescription}</p>
              </div>
            </section>

            {/* Problem Statement */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Problem Statement</h2>
              <p className="text-gray-300">{projectData.problemStatement}</p>
            </section>

            {/* Solution */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Solution</h2>
              <p className="text-gray-300">{projectData.solution}</p>
            </section>



            {/* Comments Section */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Comments</h2>
                <button
                  onClick={() => setShowCommentBox(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Comment
                </button>
              </div>

              {showCommentBox && (
                <form onSubmit={handleComment} className="mb-6">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full h-32 px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none mb-4"
                    placeholder="Write your comment..."
                  />
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowCommentBox(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowJoinGroup(true)}
                      // type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-6">
                {projectData.comments?.map((comment, index) => (
                  <div key={index} className="border-b border-gray-700 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{comment.author}</h4>
                        <span className="text-sm text-gray-400">
                          {new Date(comment.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300">{comment.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Project Info */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                    <ArrowBigUp className="w-6 h-6" />
                  </button>
                  <span className="text-lg font-medium">{projectData.votes}</span>
                  <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                    <ArrowBigDown className="w-6 h-6" />
                  </button>
                </div>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
              <button
                onClick={() => setShowJoinGroup(true)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isContributor || !!joinStatus || isTeamFull}
              >
                {isContributor 
                  ? "You are a Member"
                  : isTeamFull
                    ? "Team is Full"
                    : "Join Project"}
              </button>

              {isContributor && (
                <button
                  onClick={() => navigate(`/idea/${projectData.id}/workspace`)}
                  className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Go to Workspace
                </button>
              )}
            </div>
            <div className="mt-4">
            

                { /* Show team members ONLY when confirmation message disappears  */}
                {(joinStatus === "confirmed" )&&(
                  <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mt-6">
                    <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
                    <ul className="space-y-3">
                      {teamMembers.length > 0 ? (
                        teamMembers.map((member, index) => (
                          <li key={index} className="flex items-center gap-4 bg-gray-900 p-3 rounded-lg">
                            <User className="w-6 h-6 text-gray-300" />
                            <div>
                              <p className="text-white">{member.username}</p>
                              <p className="text-gray-400 text-sm">{member.email}</p>
                            </div>
                          </li>
                        ))
                      ) : (
                        <p className="text-gray-400">No members yet...</p>
                      )}
                    </ul>
                  </section>
                )}

                {!(joinStatus === "confirmed") && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Team Needed</h3>
                    <div className="space-y-3">
                      {(projectData.resources 
                        ? (Array.isArray(projectData.resources) ? projectData.resources : JSON.parse(projectData.resources || "[]")) 
                        : []
                      ).map((role, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300">{role.role}</span>
                            {roleAvailability[role.role] === false && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                                Position Filled
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              {roleAvailability[`${role.role}_count`] || 0}/{role.count} filled
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {isTeamFull && (
                      <div className="mt-4 p-3 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                        This project's team is now full. No more positions are available.
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Project Links */}
            {projectData.link && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Project Links</h3>
                <a
                  href={projectData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <LinkIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300 truncate">{projectData.link}</span>
                </a>
              </div>
            )}

            {/* Project Info */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Project Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Status: {projectData.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">License: {projectData.license}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {projectData.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}
  
    </div>
  );
  
}

export default ViewIdea;
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

import StakingProfile from './StakingProfile';
import { useNavigate } from 'react-router-dom';
import JoinGroup from './joinGroup';
import { useLocation } from "react-router-dom";

function ViewIdea({ project: propProject = {}, onBack }) {
  const location = useLocation();
  const project = location.state?.project || propProject;

  console.log("Received project prop:", project);

  if (!project || Object.keys(project).length === 0) {
    console.log("Project is empty or undefined!");
    return <p>Loading project...</p>;
  }

  console.log("Project in view idea", project?.title);

  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [showIdeaSignUp, setIdeaSIgnUp] = useState(false);
  const navigate = useNavigate();
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [joinStatus, setJoinStatus] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    console.log("Project state updated", project);
  }, [project]);

  useEffect(() => {
    if (joinStatus === 'confirmed' && !teamMembers.some(member => member.name === 'Current User')) {
      setTeamMembers(prev => [...prev, { name: 'Current User', role: 'Frontend Developer', avatar: null }]);
    }
  }, [joinStatus]);

  if (!joinStatus) {
    setJoinStatus('confirmed');
  }

  const handleJoinGroupComplete = ({ success }) => {
    if (success) {
      setShowJoinGroup(false);
      setJoinStatus("pending");
  
      // Show the first message
      setShowConfirmation(true);
  
      // Wait 30 seconds before confirming
      setTimeout(() => {
        setShowConfirmation(false);
      
        // Ensure UI update before fetching members
        setTimeout(async () => {
          try {
            const response = await fetch(`/api/team-members?projectId=${project.id}`);
            const data = await response.json();
            setTeamMembers(data.members);
          } catch (error) {
            console.error("Failed to fetch team members:", error);
          }
        }, 100); // Add a short delay before fetching members
      }, 5000);
      
    }
  };
  

  if (showJoinGroup){
    return <JoinGroup project={project}  onClose={() => setSelectedIdea(null)}/>;
  }

  const handleCopyLink = () => {
    const url = `https://imara.com/project/${project?.id || "unknown"}`;
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </button>

        {/* Project Header */}
        <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {project.category}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full">
                    {/* <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    /> */}
                  </div>
                  <span className="text-gray-400 text-sm">{project.progress}% Complete</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
              <div className="flex items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>By Author</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
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
                <p className="text-gray-300 whitespace-pre-wrap">{project.projectDescription}</p>
              </div>
            </section>

            {/* Problem Statement */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Problem Statement</h2>
              <p className="text-gray-300">{project.problemStatement}</p>
            </section>

            {/* Solution */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Solution</h2>
              <p className="text-gray-300">{project.solution}</p>
            </section>

            {/* Technical Requirements
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Technical Requirements</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {project.resources?.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </section> */}

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
                {project.comments?.map((comment, index) => (
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
                  <span className="text-lg font-medium">{project.votes}</span>
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
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Join Project
                </button>

              {/* New Button Appears After Successful Staking */}
            
              {/* {stakeSuccess && (
                <button
                  onClick={() => setShowStake(true)}
                  className="w-full px-6 py-3 mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                <h3 className="text-lg">
                  Continue
                  </h3>
                </button>
              )} */}
             
            </div>
            <div className="mt-4">
    {/* Display join status messages */}
{joinStatus === "pending" && (
  <p className="text-yellow-400">Staking successful! Waiting for confirmation...</p>
)}
{joinStatus === "confirmed" && showConfirmation && (
  <p className="text-green-400">You have successfully joined the group!</p>
)}

/* Show team members ONLY when confirmation message disappears */
{joinStatus === "confirmed" && !showConfirmation && (
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

  </div>

            {/* Project Links */}
            {project.link && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Project Links</h3>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <LinkIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300 truncate">{project.link}</span>
                </a>
              </div>
            )}

            {/* Project Info */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Project Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Status: {project.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">License: {project.license}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {project.tags?.map((tag, index) => (
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

            {/* Team Needed */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Team Needed</h3>
              <div className="space-y-3">
              
              {Array.isArray(project.resources)
    ? project.resources.map((role, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg"
        >
          <span className="text-gray-300">{role.role}</span>
          <span className="text-sm text-gray-400">{role.count} needed</span>
        </div>
      ))
    : JSON.parse(project.resources || "[]").map((role, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg"
        >
          <span className="text-gray-300">{role.role}</span>
          <span className="text-sm text-gray-400">{role.count} needed</span>
        </div>
      ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}
      {/* {showStake && <Stake />} */}
    </div>
  );
  
}

export default ViewIdea;
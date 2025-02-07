import React, { useState, useEffect } from 'react';
import {useAddress} from "@thirdweb-dev/react";
import { Carousel } from 'react-bootstrap';
import {
  User,
  ChevronDown,
  PlusCircle,
  Briefcase,
  UserCog,
  Megaphone,
  Wrench,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Globe,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Send,
  Copy,
  X,
  Link2,
  Check
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateIdea from './CreateIdea';


const trendingProjects = [
  {
    id: 1,
    title: "DeFi Lending Platform",
    description: "Decentralized lending platform with AI-driven risk assessment",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60",
    category: "DeFi",
    progress: 75
  },
  {
    id: 2,
    title: "NFT Marketplace",
    description: "Community-driven NFT marketplace for digital artists",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60",
    category: "NFT",
    progress: 60
  },
  {
    id: 3,
    title: "GameFi Project",
    description: "Play-to-earn gaming platform with unique tokenomics",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60",
    category: "Gaming",
    progress: 85
  }
];

const allProjects = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  title: `Project ${i + 1}`,
  description: "An innovative blockchain project revolutionizing the industry",
  category: ["DeFi", "NFT", "Gaming", "DAO"][Math.floor(Math.random() * 4)],
  progress: Math.floor(Math.random() * 100),
  image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60"
}));

const categories = ["All", "DeFi", "NFT", "Gaming", "DAO", "Infrastructure"];
const stages = ["All Stages", "Ideation", "Development", "Launch Ready"];
const sortOptions = ["Newest", "Most Popular", "Highest Funded"];

function Home({ handleSignOut }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedSort, setSelectedSort] = useState("Newest");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
   const [selectedProject, setSelectedProject] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [projects, setProjects] = useState(allProjects);
  const [copiedLink, setCopiedLink] = useState(false);


  // const navigate = useNavigate();
  const address = useAddress();
  const [userEmail, setUserEmail] = useState('user@example.com');

  const[showIdeationMenu, setShowIdeationMenu] = useState(false);
  
  useEffect(() => { 
    if (address) {
      console.log("Connected wallet address:", address);
      setUserEmail(address.slice(0, 6) + '...' + address.slice(-4) );
    }
  }, [address]);
   const handleVote = (projectId, voteType) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        const currentVote = project.userVote;
        let voteDelta = 0;

        if (currentVote === voteType) {
          voteDelta = voteType === 'up' ? -1 : 1;
          return {
            ...project,
            userVote: null,
            votes: project.votes + voteDelta
          };
        } else {
          voteDelta = voteType === 'up' ? 
            (currentVote === 'down' ? 2 : 1) : 
            (currentVote === 'up' ? -2 : -1);
          return {
            ...project,
            userVote: voteType,
            votes: project.votes + voteDelta
          };
        }
      }
      return project;
    }));
  };

  if (showIdeationMenu) {
    return <CreateIdea />;
  }

  const handleCopyLink = (projectId) => {
    const url = `https://imara.com/project/${projectId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const ShareModal = ({ project, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h3 className="text-xl font-semibold text-white mb-6">Share Project</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            <Facebook className="w-5 h-5" />
            Facebook
          </button>
          <button className="flex items-center gap-3 bg-sky-500 text-white px-4 py-3 rounded-lg hover:bg-sky-600 transition-colors">
            <Twitter className="w-5 h-5" />
            Twitter
          </button>
          <button className="flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
            <Send className="w-5 h-5" />
            WhatsApp
          </button>
          <button className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity">
            <Instagram className="w-5 h-5" />
            Instagram
          </button>
        </div>

        <div className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-3">
          <div className="flex-1 truncate text-gray-300 text-sm">
            https://imara.com/project/{project.id}
          </div>
          <button
            onClick={() => handleCopyLink(project.id)}
            className="flex items-center gap-2 bg-gray-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-500 transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
 
  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xl font-bold text-white">IMARA</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
                >
                  <span className="text-sm font-medium text-blue-400">Join As</span>
                  <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${showRoleMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showRoleMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg py-2 z-50 border border-gray-700/50 transform transition-all duration-200 origin-top-right">
                      <div className="px-4 py-2 border-b border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-400">Choose your role</h3>
                      </div>
                      <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-3 group"
                      onClick={()=> setShowIdeationMenu(true)}>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlusCircle className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium">Create an Idea</div>
                          <div className="text-xs text-gray-500">Start your own project</div>
                        </div>
                      </button>
                      <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">Join as Investor</div>
                          <div className="text-xs text-gray-500">Fund promising projects</div>
                        </div>
                      </button>
                      <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <UserCog className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium">Project Manager</div>
                          <div className="text-xs text-gray-500">Lead project execution</div>
                        </div>
                      </button>
                      <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Megaphone className="w-4 h-4 text-pink-400" />
                        </div>
                        <div>
                          <div className="font-medium">Join as Marketer</div>
                          <div className="text-xs text-gray-500">Promote projects</div>
                        </div>
                      </button>
                      <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Wrench className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium">Join as Builder</div>
                          <div className="text-xs text-gray-500">Develop solutions</div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-600/50 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{userEmail}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg py-2 z-50 border border-gray-700/50">
                      <div className="px-4 py-2 border-b border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-400">Account</h3>
                      </div>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-3">
                        <User className="w-4 h-4" />
                        Profile Settings
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-3">
                        <Briefcase className="w-4 h-4" />
                        My Projects
                      </button>
                      <div className="border-t border-gray-700/50 mt-2 pt-2">
                        <button  
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 transition-colors flex items-center gap-3" 
                        onClick={handleSignOut}>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Trending Projects</h2>
        <Carousel className="rounded-xl overflow-hidden">
          {trendingProjects.map((project) => (
            <Carousel.Item key={project.id}>
              <div className="relative h-[400px]">
                <img
                  className="w-full h-full object-cover"
                  src={project.image}
                  alt={project.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-3xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-gray-200 mb-4">{project.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        {project.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Search</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-2 ${
                      selectedCategory === category
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Project Stage</h3>
                {stages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setSelectedStage(stage)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-2 ${
                      selectedStage === stage
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Sort By</h3>
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedSort(option)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-2 ${
                      selectedSort === option
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        {project.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm">{project.progress}%</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-700/50 pt-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(project.id, 'up')}
                            className={`p-1.5 rounded-lg transition-colors ${
                              project.userVote === 'up'
                                ? 'bg-green-500/20 text-green-400'
                                : 'hover:bg-gray-700/50 text-gray-400'
                            }`}
                          >
                            <ArrowBigUp className="w-5 h-5" />
                          </button>
                          <span className={`text-sm font-medium ${
                            project.userVote === 'up'
                              ? 'text-green-400'
                              : project.userVote === 'down'
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}>
                            {project.votes}
                          </span>
                          <button
                            onClick={() => handleVote(project.id, 'down')}
                            className={`p-1.5 rounded-lg transition-colors ${
                              project.userVote === 'down'
                                ? 'bg-red-500/20 text-red-400'
                                : 'hover:bg-gray-700/50 text-gray-400'
                            }`}
                          >
                            <ArrowBigDown className="w-5 h-5" />
                          </button>
                        </div>

                        <button className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors">
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm">{project.comments}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowShareModal(true);
                          }}
                          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm">{project.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showShareModal && selectedProject && (
              <ShareModal
                project={selectedProject}
                onClose={() => {
                  setShowShareModal(false);
                  setSelectedProject(null);
                }}
              />
            )}

            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
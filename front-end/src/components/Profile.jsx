import React, { useState , useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  Calendar,
  Globe,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  Briefcase,
  Building,
  Clock,
  ArrowUpRight,
  Users,
  Star,
  Settings
} from 'lucide-react';
import { getUserData } from '../utils/SupabaseClient'; 
import { useAuth } from '../AuthContext';
import { retrieveJoinedProjects,retrieveCreatedProjects } from '../utils/SupabaseClient';

function Profile({onback}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('joined'); // 'joined', 'created'
  const [userData, setUserData] = useState(null);
  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  // Mock user data - replace with actual data from your database

  const { user } = useAuth();

  console.log("User:", user);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const data = await getUserData(user);
        setUserData(data);
      };
      fetchUserData();
    }
  }, [user]);
  // Mock projects data - replace with actual data from your database


  useEffect(() => {
    if (user?.id) {
      const fetchJoinedProjects = async () => {
        const projects = await retrieveJoinedProjects(user.id);
        setJoinedProjects(projects);
      };
      fetchJoinedProjects();
    }
  }, [user]);
  
  useEffect(() => {
    if (user?.id) {
      const fetchCreatedProjects = async () => {
        const projects = await retrieveCreatedProjects(user.id);
        setCreatedProjects(projects);
      };
      fetchCreatedProjects();
    }
  }, [user]);
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => success(false)}
          className="mb-8 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </button>

        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-xl bg-gray-700/50 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            </div>

            {/* User Details */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              {/* User Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {user.location}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  {user.role}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Building className="w-4 h-4 text-gray-400" />
                  {user.company}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Joined {new Date(userData.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-4">
                {userData.github && (
                  <a
                    href={userData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {userData.linkedin_profile && (
                  <a
                    href={userData.linkedin_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {userData.twitter_handle && (
                  <a
                    href={userData.twitter_handle}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {userData.portfolio_link && (
                  <a
                    href={userData.portfolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('joined')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'joined'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Joined Projects
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'created'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Created Projects
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(activeTab === 'joined' ? joinedProjects : createdProjects).map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-gray-700/30 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all cursor-pointer"
              >
                <div className="relative h-48">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          {project.category}
                        </span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          {project.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-300 mb-4">{project.projectDescription}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {activeTab === 'joined' && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Briefcase className="w-4 h-4" />
                        <span>{project.role}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(project.joinedDate || project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{project.teamSize} members</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-600 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{project.progress}%</span>
                    </div>
                    <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                      View Project
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {((activeTab === 'joined' && joinedProjects.length === 0) ||
            (activeTab === 'created' && createdProjects.length === 0)) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                No {activeTab === 'joined' ? 'joined' : 'created'} projects yet
              </h3>
              <p className="text-gray-400">
                {activeTab === 'joined'
                  ? 'Start collaborating by joining exciting projects'
                  : 'Share your ideas by creating a new project'}
              </p>
              <button
                onClick={() => navigate(activeTab === 'joined' ? '/' : '/create-idea')}
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {activeTab === 'joined' ? 'Explore Projects' : 'Create Project'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
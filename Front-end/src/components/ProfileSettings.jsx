import React, { useState, useEffect } from 'react';
import { User, Briefcase, Award, Globe, Link, Edit, Save, X, ArrowLeft, Eye } from 'lucide-react';
import axios from 'axios';

const ProfileSettings = ({ onBack }) => {
  const [profile, setProfile] = useState({
    fullName: '',
    location: '',
    phoneNumber: '',
    professionalTitle: '',
    industry: '',
    yearsOfExperience: '',
    currentRole: '',
    linkedIn: '',
    portfolio: '',
    skills: [],
    certifications: '',
    tools: [],
    about: '',
    goals: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false); // State to toggle preview

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile'); // Replace with your API endpoint
        setProfile({
          ...response.data,
          skills: response.data.skills || [], // Default to an empty array if skills is undefined
          tools: response.data.tools || [], // Default to an empty array if tools is undefined
        });
      } catch (err) {
        setError('Failed to fetch profile data.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map((skill) => skill.trim());
    setProfile((prev) => ({ ...prev, skills: skills || [] })); // Default to an empty array
  };

  const handleToolsChange = (e) => {
    const tools = e.target.value.split(',').map((tool) => tool.trim());
    setProfile((prev) => ({ ...prev, tools: tools || [] })); // Default to an empty array
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put('/api/profile', profile); // Replace with your API endpoint
      console.log('Profile updated:', response.data);
      setShowPreview(true); // Show preview after saving
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-8 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </button>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      {/* Profile Settings Form */}
      {!showPreview ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Basic Information
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number (Optional)"
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Professional Details
            </h2>
            <div className="space-y-4">
              <select
                name="professionalTitle"
                value={profile.professionalTitle}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Your Professional Title</option>
                <option value="Lawyer">Lawyer</option>
                <option value="Doctor">Doctor</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="Project Manager">Project Manager</option>
              </select>
              <select
                name="industry"
                value={profile.industry}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Legal">Legal</option>
                <option value="Design">Design</option>
              </select>
              <select
                name="yearsOfExperience"
                value={profile.yearsOfExperience}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Years of Experience</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
              <input
                type="text"
                name="currentRole"
                value={profile.currentRole}
                onChange={handleChange}
                placeholder="Current Role"
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="linkedIn"
                value={profile.linkedIn}
                onChange={handleChange}
                placeholder="LinkedIn Profile (Optional)"
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="portfolio"
                value={profile.portfolio}
                onChange={handleChange}
                placeholder="Portfolio/Website (Optional)"
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Skills and Expertise */}
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" /> Skills and Expertise
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                name="skills"
                value={profile.skills?.join(', ') || ''}
                onChange={handleSkillsChange}
                placeholder="Skills (e.g., React.js, Node.js, UI/UX Design)"
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="certifications"
                value={profile.certifications}
                onChange={handleChange}
                placeholder="Certifications (Optional)"
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="tools"
                value={profile.tools?.join(', ') || ''}
                onChange={handleToolsChange}
                placeholder="Tools and Technologies (e.g., Figma, Docker, Kubernetes)"
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Personal Introduction */}
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5" /> Personal Introduction
            </h2>
            <div className="space-y-4">
              <textarea
                name="about"
                value={profile.about}
                onChange={handleChange}
                placeholder="Tell us about yourself (max 256 words)"
                maxLength={256}
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <textarea
                name="goals"
                value={profile.goals}
                onChange={handleChange}
                placeholder="What are you looking for? (Optional, max 256 words)"
                maxLength={256}
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (
              <>
                <Save className="w-5 h-5" /> Save Profile
              </>
            )}
          </button>
        </form>
      ) : (
        /* Preview Section */
        <div className="bg-gray-800/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" /> Profile Preview
          </h2>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <p><strong>Full Name:</strong> {profile.fullName}</p>
              <p><strong>Location:</strong> {profile.location}</p>
              <p><strong>Phone Number:</strong> {profile.phoneNumber}</p>
            </div>

            {/* Professional Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Professional Details</h3>
              <p><strong>Professional Title:</strong> {profile.professionalTitle}</p>
              <p><strong>Industry:</strong> {profile.industry}</p>
              <p><strong>Years of Experience:</strong> {profile.yearsOfExperience}</p>
              <p><strong>Current Role:</strong> {profile.currentRole}</p>
              <p><strong>LinkedIn:</strong> {profile.linkedIn}</p>
              <p><strong>Portfolio:</strong> {profile.portfolio}</p>
            </div>

            {/* Skills and Expertise */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Skills and Expertise</h3>
              <p><strong>Skills:</strong> {profile.skills?.join(', ')}</p>
              <p><strong>Certifications:</strong> {profile.certifications}</p>
              <p><strong>Tools:</strong> {profile.tools?.join(', ')}</p>
            </div>

            {/* Personal Introduction */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Personal Introduction</h3>
              <p><strong>About:</strong> {profile.about}</p>
              <p><strong>Goals:</strong> {profile.goals}</p>
            </div>

            {/* Back to Edit Button */}
            <button
              onClick={() => setShowPreview(false)}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-5 h-5" /> Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
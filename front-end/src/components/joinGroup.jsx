import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Github, Linkedin, Twitter, Globe, Check, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ViewIdea from './ViewIdea';
import stakeToken from '../utils/stake';
function JoinGroup({ project, onBack }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    github: '',
    linkedin: '',
    twitter: '',
    portfolio: '',
    cv: null
  });
  const [isStaking, setIsStaking] = useState(false);

  // Simulate getting user email from database
  useEffect(() => {
    // This would be replaced with actual database fetch
    setFormData(prev => ({
      ...prev,
      email: 'user@example.com' // Replace with actual user email from DB
    }));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, cv: file }));
    }
  };

  const resourcesArray = Array.isArray(project.resources)
  ? project.resources
  : typeof project.resources === "string"
  ? JSON.parse(project.resources)
  : [];


  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Staking token with the following parameters:");

    try {
      await stakeToken();
      alert("Staking Successful");
      <ViewIdea/>
    }
    catch (error) {
      console.error("Error staking token:", error);
      alert('Staking failed')
    }
    finally {
      setIsStaking(false);
    }

   // Navigate back to ViewIdea with success state

  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => onBack({ success: false })}
          className="mb-8 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Project
        </button>

        {/* Header */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Join Project Team</h1>
          <p className="text-gray-400">
            Complete your profile information to join the project team
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
          {/* Role Selection */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Select Your Role</span>
              <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  required>
                  <option value="">Select a role</option>
                  {resourcesArray.map((role) => (
                    <option key={role.id} value={role.role}>
                      {role.role}
                    </option>
                  ))}
              </select>


            </label>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Contact Information</h2>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-700 rounded-lg text-gray-300 cursor-not-allowed"
                readOnly
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              {/* GitHub */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Profile
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                    placeholder="https://github.com/username"
                    required
                  />
                  <Github className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                    placeholder="https://linkedin.com/in/username"
                    required
                  />
                  <Linkedin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Twitter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter Profile
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                    placeholder="https://twitter.com/username"
                  />
                  <Twitter className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Portfolio */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Portfolio Website
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                    placeholder="https://yourportfolio.com"
                  />
                  <Globe className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* CV Upload */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Upload CV/Resume</span>
              <span className="text-gray-400 text-sm block mb-4">
                Upload your CV in PDF format (max 5MB)
              </span>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cv-upload"
                  required
                />
                <label
                  htmlFor="cv-upload"
                  className="flex items-center justify-center w-full h-32 px-4 transition bg-white/5 border-2 border-gray-700 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-500 focus:outline-none"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {formData.cv ? formData.cv.name : 'Drop your CV here or click to upload'}
                    </span>
                  </div>
                </label>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isStaking}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isStaking ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Staking to Join...
              </>
            ) : (
              'Stake to Join'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default JoinGroup;
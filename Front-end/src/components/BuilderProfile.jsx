import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, X, Github, Linkedin, Twitter, FileText, Globe, MessageSquare } from 'lucide-react';

// Tech stack options
const techStackOptions = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Solidity',
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express',
  'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
  'Web3.js', 'Ethers.js', 'Hardhat', 'Truffle', 'Smart Contracts'
];

// Interest options
const interestOptions = [
  'Web3', 'Blockchain', 'DeFi', 'NFTs', 'DAOs',
  'AI/ML', 'Cloud Computing', 'DevOps', 'Open Source',
  'Cybersecurity', 'IoT', 'Mobile Development', 'UI/UX Design'
];

function BuilderProfile({ onBack }) {
  const [formData, setFormData] = useState({
    profilePicture: null,
    name: '',
    gender: '',
    location: '',
    walletAddress: '',
    website: '',
    resume: null,
    experience: '',
    company: '',
    role: '',
    techStack: [],
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    mediumUrl: '',
    devtoUrl: '',
    telegramUrl: '',
    bio: '',
    additionalLinks: [{ platform: '', url: '' }],
    interests: []
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [bioCharCount, setBioCharCount] = useState(0);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setFormData({ ...formData, profilePicture: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image under 5MB');
    }
  };

  const handleResume = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setFormData({ ...formData, resume: file });
    } else {
      alert('Please select a PDF under 10MB');
    }
  };

  const handleBioChange = (e) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setFormData({ ...formData, bio: text });
      setBioCharCount(text.length);
    }
  };

  const handleTechStackChange = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const handleInterestsChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const addAdditionalLink = () => {
    setFormData(prev => ({
      ...prev,
      additionalLinks: [...prev.additionalLinks, { platform: '', url: '' }]
    }));
  };

  const removeAdditionalLink = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalLinks: prev.additionalLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
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
          Back
        </button>

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4">Build Your Profile</h1>
          <p className="text-xl text-gray-400">
            Showcase your skills, experience, and professional details to connect with like-minded builders.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12">
          {/* Personal Information */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Personal Information</h2>
            
            {/* Profile Picture */}
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleProfilePicture}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">PNG/JPG, max 5MB</p>
              </div>

              <div className="flex-1 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City/Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., New York, USA"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Professional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0x..."
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Personal Website/Portfolio
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://"
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resume/CV
                </label>
                <div className="relative">
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleResume}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg hover:bg-white/10 transition-all flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">
                      {formData.resume ? formData.resume.name : 'Upload PDF (max 10MB)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Years of Experience
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company/Association
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select role</option>
                  <option value="student">Student</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="professional">Professional</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Tech Stack</h2>
            <div className="flex flex-wrap gap-3">
              {techStackOptions.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleTechStackChange(tech)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.techStack.includes(tech)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </section>

          {/* Social Media Links */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Social Media Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GitHub */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub/GitLab URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://github.com/username"
                    required
                  />
                  <Github className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://linkedin.com/in/username"
                    required
                  />
                  <Linkedin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://twitter.com/username"
                  />
                  <Twitter className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Medium */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Medium URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.mediumUrl}
                    onChange={(e) => setFormData({ ...formData, mediumUrl: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://medium.com/@username"
                  />
                  <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Dev.to */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dev.to URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.devtoUrl}
                    onChange={(e) => setFormData({ ...formData, devtoUrl: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://dev.to/username"
                  />
                  <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Telegram */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telegram URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.telegramUrl}
                    onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://t.me/username"
                  />
                  <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </section>

          {/* Bio */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Bio/Description</h2>
            <div>
              <textarea
                value={formData.bio}
                onChange={handleBioChange}
                className="w-full h-32 px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
              <div className="flex justify-end mt-2">
                <span className="text-sm text-gray-400">{bioCharCount}/500</span>
              </div>
            </div>
          </section>

          {/* Additional Links */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Additional Links</h2>
              <button
                type="button"
                onClick={addAdditionalLink}
                className="px-4 py-2 bg-white/5 rounded-lg text-sm font-medium hover:bg-white/10 transition-all"
              >
                Add Link
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.additionalLinks.map((link, index) => (
                <div key={index} className="flex gap-4">
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => {
                      const newLinks = [...formData.additionalLinks];
                      newLinks[index].platform = e.target.value;
                      setFormData({ ...formData, additionalLinks: newLinks });
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Platform (e.g., Behance)"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...formData.additionalLinks];
                      newLinks[index].url = e.target.value;
                      setFormData({ ...formData, additionalLinks: newLinks });
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAdditionalLink(index)}
                      className="p-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Interests */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Interests</h2>
            <div className="flex flex-wrap gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestsChange(interest)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.interests.includes(interest)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90"
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BuilderProfile;
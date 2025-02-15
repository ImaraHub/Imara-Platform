import React, { useState } from 'react';
import { ArrowLeft, Upload, Briefcase, GraduationCap, Award, Brain } from 'lucide-react';


const certifications = [
  'PMP (Project Management Professional)',
  'PRINCE2',
  'Agile Certified Practitioner (PMI-ACP)',
  'Certified Scrum Master (CSM)',
  'CAPM (Certified Associate in Project Management)',
  'Six Sigma',
  'ITIL',
];

const educationLevels = [
  'High School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'Ph.D.',
  'Professional Certification',
];

function ProjectManager() {
 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experience: '',
    education: '',
    selectedCertifications: [],
    industryKnowledge: '',
    additionalDetails: '',
    resume: null,
  });

  const handleCertificationChange = (cert) => {
    setFormData(prev => ({
      ...prev,
      selectedCertifications: prev.selectedCertifications.includes(cert)
        ? prev.selectedCertifications.filter(c => c !== cert)
        : [...prev.selectedCertifications, cert]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </button>

        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Project Manager Profile</h1>
          <p className="text-xl text-gray-300">
            Share your expertise and lead innovative projects to success
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
          {/* Personal Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Enter years of experience"
                min="0"
                required
              />
            </div>
          </div>

          {/* Education */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              Education
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Highest Education Level
              </label>
              <select
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                required
              >
                <option value="">Select education level</option>
                {educationLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Certifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert) => (
                <label
                  key={cert}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedCertifications.includes(cert)}
                    onChange={() => handleCertificationChange(cert)}
                    className="w-4 h-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                  <span className="text-gray-300">{cert}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Industry Knowledge */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Industry Knowledge</h2>
            <textarea
              value={formData.industryKnowledge}
              onChange={(e) => setFormData(prev => ({ ...prev, industryKnowledge: e.target.value }))}
              className="w-full h-32 px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white resize-none"
              placeholder="Describe your industry knowledge and expertise..."
              required
            />
          </div>

          {/* Resume Upload */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Resume/CV</h2>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.files[0] }))}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="flex items-center justify-center w-full h-32 px-4 transition bg-white/5 border-2 border-gray-700 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-500 focus:outline-none"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {formData.resume ? formData.resume.name : 'Upload your resume (PDF, DOC, DOCX)'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Additional Details</h2>
            <textarea
              value={formData.additionalDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalDetails: e.target.value }))}
              className="w-full h-32 px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white resize-none"
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90"
          >
            Submit Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProjectManager;
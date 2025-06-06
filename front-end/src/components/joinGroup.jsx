import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Github, Linkedin, Twitter, Globe, Check, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ViewIdea from './ViewIdea';
import stakeToken from '../utils/stake';
import {updateUser, uploadCvToSupabase} from '../utils/SupabaseClient';
import { useAddress } from "@thirdweb-dev/react";
import { useAuth } from '../AuthContext';
import { addUserData, getUserData,addProjectContributor } from '../utils/SupabaseClient';
import PaymentModal from './PaymentModal';


function JoinGroup({ project, onBack }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    github: '',
    linkedin: '',
    twitter: '',
    portfolio: '',
    cv: '',
  });
  const [isStaking, setIsStaking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stakingAmount] = useState(1); // Set your staking amount here
  const address = useAddress();
  const [stakingAddress,setStakingAddress] = useState(null);
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'verified', 'rejected'
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  
  // retrieve user data from db
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const data = await getUserData(user);
        if (data) {
          setFormData(prev => ({
            ...prev,
            // Don't set email from user data to allow user input
            github: data.github || '',
            linkedin: data.linkedin || '',
            twitter: data.twitter || '',
            portfolio: data.portfolio_link || '',
          }));
        }
      }
    };
    fetchUserData();
  }, [user]);


  const handleFileChange = async (e) => {
    var file = e.target.files[0];
    if (!file) return;

    try {
      const cvUrl = await uploadCvToSupabase(file, user);

      if (cvUrl) {
        setFormData(prev => ({ ...prev, cv: cvUrl }));
      } else {
        console.error('CV upload failed - no URL returned');
      }
    } catch (error) {
      console.error('CV upload error:', error);
    }
  };



  const resourcesArray = Array.isArray(project.resources)
  ? project.resources
  : typeof project.resources === "string"
  ? JSON.parse(project.resources)
  : [];

  const handleVerifyProfile = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationMessage('Verifying your profile...');
    
    try {
      // Basic form validation with detailed feedback
      const missingFields = [];
      if (!formData.role) missingFields.push('Role');
      if (!formData.email) missingFields.push('Email');
      if (!formData.cv) missingFields.push('CV');

      if (missingFields.length > 0) {
        setVerificationStatus('rejected');
        setVerificationMessage(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        setIsVerifying(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setVerificationStatus('rejected');
        setVerificationMessage('Please enter a valid email address');
        setIsVerifying(false);
        return;
      }

      // Check if the selected role exists in the project's required roles
      const roleExists = resourcesArray.some(role => role.role === formData.role);
      if (!roleExists) {
        setVerificationStatus('rejected');
        setVerificationMessage('Selected role is not available for this project');
        setIsVerifying(false);
        return;
      }

      // Quick verification delay (500ms) just to show the process
      await new Promise(resolve => setTimeout(resolve, 500));

      // If all verifications pass
      setVerificationStatus('verified');
      setVerificationMessage('Profile verified successfully! You can now proceed to stake.');
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('rejected');
      setVerificationMessage('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStakeClick = (e) => {
    e.preventDefault();
    if (verificationStatus !== 'verified') {
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (paymentData) => {
    setIsStaking(true);
    try {
      // If payment was successful, proceed with staking
      const stakerAddress = address;

      if (!stakingAddress) {
        setStakingAddress(address);
      }



      const result = await addUserData(formData, user, stakerAddress);

      if (result !== true) {
        await updateUser(user, formData, stakerAddress);
      }

      // Add user as project contributor
      await addProjectContributor(project, user, formData.role);

      // Navigation is now handled in PaymentModal
    } catch (error) {
      console.error("Error staking token:", error);
      alert("Staking failed");
    } finally {
      setIsStaking(false);
    }
  };

  console.log("Contributor email in JoinGroup:", formData.email);

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
        <form onSubmit={handleVerifyProfile} className="max-w-2xl mx-auto space-y-8">
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
              <label className="block text-sm font-medium mb-2">
                Email Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email address"
                required
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
              <span className="text-lg font-semibold block mb-2">
                Upload CV/Resume
                <span className="text-red-500 ml-1">*</span>
              </span>
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
                      {formData.cv ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <span>CV uploaded successfully</span>
                        </div>
                      ) : (
                        'Drop your CV here or click to upload'
                      )}
                    </span>
                  </div>
                </label>
              </div>
            </label>
          </div>

          {/* Verification Status */}
          {(verificationMessage || isVerifying) && (
            <div className={`p-4 rounded-lg ${
              isVerifying 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : verificationStatus === 'verified' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {isVerifying ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : verificationStatus === 'verified' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p>{verificationMessage}</p>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          {verificationStatus !== 'verified' ? (
            <button
              type="submit"
              disabled={isVerifying}
              onClick={handleVerifyProfile}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Verifying Profile...
                </>
              ) : (
                'Verify Profile'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStakeClick}
              disabled={isStaking}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isStaking ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Staking to Join...
                </>
              ) : (
                <>
                  Stake to Join (KES {stakingAmount.toLocaleString()})
                </>
              )}
            </button>
          )}
        </form>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={stakingAmount}
        onPaymentComplete={handlePaymentComplete}
        project={project}
        userEmail={formData.email}
      />
    </div>
  );
}

export default JoinGroup;
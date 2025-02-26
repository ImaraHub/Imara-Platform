import React, { useState } from 'react';
import { Hash, Link as LinkIcon, Upload, ArrowLeft, Plus, X, HelpCircle, Users, Brain, Clock, Check } from 'lucide-react';
import Home from './Home';
import {uploadImageToSupabase, addIdea } from '../utils/SupabaseClient';
import { useAuth } from "../AuthContext";


const CreateIdea = ({ onBack }) => {

  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [showTokenPage, setTokenPage] = useState(false);
  const [newResource, setNewResource] = useState({ role: '', count: 1, description: '' });
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomDurationForm, setShowCustomDurationForm] = useState(false);


  const [showHomePage, setHomePage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    link: '',
    // license: 'cc0',
      image: '',
    resources: [],
     needsProjectManager: false,
    timeline: null
  });

  // const handleFormFieldChange = (fieldName, e) => {
  //   setForm({ ...formData, [fieldName]: e.target.value })
  // }

  // const makeInteraction = (e) => {
  //   e.preventDefault();
  //   const { title, details, link, license, image } = formData;
  //   const myCall = contract.populate('create-idea+', [title, details, link, uploadedFile])
  //   setIsLoading(true)
  //   contract['scwerre'](myCall.calldata).then((res) => {
  //     console.info("Successful Response:", res)
  //   }).catch((err) => {
  //     console.error("Error: ", err)
  //   }).finally(() => {
  //     setIsLoading(false)
  //   })
  // }

  const handleFileChange = async (e) => {
    var file = e.target.files[0];
    if (!file) return;

    const imageUrl = await uploadImageToSupabase(file, user);

    if (imageUrl){
      setUploadedFile(imageUrl);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    }
  };


  const handleDetailsChange = (e) => {
    const text = e.target.value;
    setCharCount(text.length);
    setFormData(prev => ({ ...prev, details: text }));
  };

  const handleAddResource = () => {
    if (newResource.role.trim()) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { ...newResource, id: Date.now() }]
      }));
      setNewResource({ role: '', count: 1, description: '' });
      setShowResourceForm(false);
    }
  };

  const handleRemoveResource = (id) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter(resource => resource.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);

    const result = await addIdea(formData, user);
    console.log('Idea added successfully', result);
    setHomePage(true);
  };

    const timelineOptions = [
    '1-3 months',
    '3-6 months',
    '6-12 months',
    '1-2 years',
    'Custom'
    ];
  
    const handleTimelineChange = (value) => {
    if (value === 'Custom') {
      setShowCustomDurationForm(true);
      setFormData(prev => ({ ...prev, timeline: null }));
    } else {
      setShowCustomDurationForm(false);
      setFormData(prev => ({ ...prev, timeline: value }));
      setCustomDuration('');
    }
  };
const handleCustomDurationSubmit = () => {
    if (customDuration.trim()) {
      setFormData(prev => ({ ...prev, timeline: customDuration }));
      setShowCustomDurationForm(false);
    }
  };
 

  if (showHomePage) {
    return <Home />;
  }

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Handle form submission
  //   return < TokenizationPage/>; // Remove this line

  //   console.log('Form submitted:', formData);
  // };

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

        {/* Header Section */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Create Your Idea</h1>
          <p className="text-xl text-gray-300">
            Join the ideas community, <span className="text-blue-400">#share</span>, 
            <span className="text-purple-400"> #connect</span>, 
            <span className="text-green-400"> #inspire</span>, and get 
            <span className="text-pink-400"> #inspired</span>!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
          {/* Title Section */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Title</span>
              <span className="text-gray-400 text-sm block mb-2">
                Craft a clear and concise title to highlight your idea and attract like-minded hackers.
              </span>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Summarize your idea as a title"
                required
              />
            </label>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Details</span>
              <span className="text-gray-400 text-sm block mb-2">
                Describe your idea in detail, including:
              </span>
              <ul className="list-disc list-inside text-gray-400 text-sm mb-4 space-y-2">
                <li>Problem statement - What issue are you addressing?</li>
                <li>Solution overview - How does your idea solve this problem?</li>
                <li>Target audience - Who will benefit from this?</li>
                <li>Technical requirements - What technologies will you use?</li>
                <li>Implementation plan - How will you build this?</li>
                <li>Success metrics - How will you measure impact?</li>
              </ul>
              <textarea
                value={formData.details}
                onChange={handleDetailsChange}
                className="w-full h-64 px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white resize-none"
                placeholder="Describe the details of your idea..."
                maxLength={1500}
                required
              />
              <div className="text-right text-sm text-gray-400 mt-2">
                {charCount}/1500
              </div>
            </label>
          </div>

              {/* Project Timeline Section */}
          <div className="space-y-4 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold">Project Timeline</h2>
            </div>
            
            {formData.timeline ? (
              <div className="flex items-center justify-between bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-white">{formData.timeline}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, timeline: null }))}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expected Duration
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {timelineOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleTimelineChange(option)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white/5 text-gray-300 border border-gray-700 hover:bg-white/10"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {showCustomDurationForm && (
                  <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Specify Custom Duration
                      </label>
                      <input
                        type="text"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                        placeholder="e.g., 18 months, 2.5 years"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomDurationForm(false);
                          setCustomDuration('');
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCustomDurationSubmit}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Set Duration
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Required Resources Section */}
          <div className="space-y-4 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Required Resources
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  List the team members and resources you need for your project
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResourceForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Resource
              </button>
            </div>

            {/* Resource List */}
            <div className="space-y-3">
              {formData.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between bg-gray-700/30 rounded-lg p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-white">{resource.role}</span>
                      <span className="text-sm text-gray-400">× {resource.count}</span>
                    </div>
                    {resource.description && (
                      <p className="text-sm text-gray-400 mt-1">{resource.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(resource.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Resource Form */}
            {showResourceForm && (
              <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Role/Resource Type
                  </label>
                  <input
                    type="text"
                    value={newResource.role}
                    onChange={(e) => setNewResource(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white text-sm"
                    placeholder="e.g., Frontend Developer, UI Designer, Legal Advisor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Number Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newResource.count}
                    onChange={(e) => setNewResource(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white text-sm resize-none"
                    placeholder="Describe the specific skills or requirements for this role"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResourceForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddResource}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Add Resource
                  </button>
                </div>
              </div>
            )}

            {/* Project Manager Help Option */}
            <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white flex items-center gap-2">
                    Not sure about required resources?
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Get help from a project manager to identify and plan the resources needed for your project.
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.needsProjectManager}
                      onChange={(e) => setFormData(prev => ({ ...prev, needsProjectManager: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-purple-300">
                      Yes, I would like assistance from a project manager
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Project Image</span>
              <span className="text-gray-400 text-sm block mb-2">
                Upload a PNG image that represents your idea (max 5MB)
              </span>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  // value={formData.image}
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full h-32 px-4 transition bg-white/5 border-2 border-gray-700 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-500 focus:outline-none">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {formData.image ? 'Image attached' : 'Click to upload an image'}
                    </span>
                  </div>
                </label>
              </div>
            </label>
          </div>

          {/* Link Section */}
          {/* <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Link (Optional)</span>
              <div className="relative">
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="https://example.com"
                />
                <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </label>
          </div> */}

          {/* License Section */}
          {/* <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">License</span>
              <select
                value={formData.license}
                onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
              >
                <option value="cc0">CC0 (Public Domain)</option>
                <option value="cc-by">CC BY</option>
                <option value="cc-by-sa">CC BY-SA</option>
                <option value="cc-by-nc">CC BY-NC</option>
              </select>
              <span className="text-gray-400 text-sm block mt-2">
                Creative Commons licenses give everyone from individual creators to large institutions a standardized way to grant the public permission to use their creative work under copyright law.{' '}
                <a
                  href="https://creativecommons.org/licenses/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Learn more about Creative Commons licenses »
                </a>
              </span>
            </label>
          </div> */}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90"
              // onClick={() => setHomePage(true)}
            >
              Publish Idea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateIdea;
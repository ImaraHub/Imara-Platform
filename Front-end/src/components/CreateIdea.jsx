import React, { useState } from 'react';
import { Hash, Link as LinkIcon, Upload, ArrowLeft } from 'lucide-react';

function CreateIdea({ onBack }) {
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    link: '',
    license: 'cc0',
    image: null
  });
  const [charCount, setCharCount] = useState(0);

  const handleDetailsChange = (e) => {
    const text = e.target.value;
    setCharCount(text.length);
    setFormData(prev => ({ ...prev, details: text }));
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
                <li>Collaboration needs - What kind of help do you need?</li>
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
                  accept=".png"
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full h-32 px-4 transition bg-white/5 border-2 border-gray-700 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-500 focus:outline-none"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {formData.image ? formData.image.name : 'Drop your image here or click to upload'}
                    </span>
                  </div>
                </label>
              </div>
            </label>
          </div>

          {/* Link Section */}
          <div className="space-y-4">
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
          </div>

          {/* License Section */}
          <div className="space-y-4">
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
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90"
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
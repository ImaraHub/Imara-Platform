import React, { useState } from 'react';
import { ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react';
// import Home from './home';
function TokenizationPage({ onBack }) {
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    description: '',
    totalSupply: '',
    decimalPlaces: '',
    tokenType: 'ERC20',
    initialDistribution: '',
    distributionDates: { start: '', end: '' },
    allocation: '',
    legalEntity: '',
    jurisdiction: '',
    regulatoryCompliance: '',
    websiteURL: '',
    whitepaper: '',
    contactInformation: '',
    logo: null,
    socialMediaLinks: { twitter: '', linkedin: '', telegram: '' }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Tokenization form submitted:', formData);
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Tokenize Your Idea</h1>
          <p className="text-xl text-gray-300">
            Provide details about the token you want to create for your idea.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
          {/* Basic Token Information */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Token Name</span>
              <input
                type="text"
                value={formData.tokenName}
                onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Enter the name of your token"
                required
              />
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Token Symbol</span>
              <input
                type="text"
                value={formData.tokenSymbol}
                onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Enter the symbol of your token (e.g., BTC, ETH)"
                required
              />
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Description</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-32 px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white resize-none"
                placeholder="Describe the purpose of your token..."
                required
              />
            </label>
          </div>

          {/* Token Specifications */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Total Supply</span>
              <input
                type="number"
                value={formData.totalSupply}
                onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Enter the total supply of your token"
                required
              />
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Decimal Places</span>
              <input
                type="number"
                value={formData.decimalPlaces}
                onChange={(e) => setFormData(prev => ({ ...prev, decimalPlaces: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Enter the number of decimal places"
                required
              />
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Token Type</span>
              <select
                value={formData.tokenType}
                onChange={(e) => setFormData(prev => ({ ...prev, tokenType: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
              >
                <option value="ERC20">ERC20</option>
                <option value="ERC721">ERC721</option>
                <option value="BEP20">BEP20</option>
              </select>
            </label>
          </div>

          {/* Token Distribution */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Initial Distribution</span>
              <input
                type="text"
                value={formData.initialDistribution}
                onChange={(e) => setFormData(prev => ({ ...prev, initialDistribution: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Describe the initial distribution method"
                required
              />
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Distribution Dates</span>
              <div className="flex space-x-4">
                <input
                  type="date"
                  value={formData.distributionDates.start}
                  onChange={(e) => setFormData(prev => ({ ...prev, distributionDates: { ...prev.distributionDates, start: e.target.value } }))}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="Start Date"
                  required
                />
                <input
                  type="date"
                  value={formData.distributionDates.end}
                  onChange={(e) => setFormData(prev => ({ ...prev, distributionDates: { ...prev.distributionDates, end: e.target.value } }))}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="End Date"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Allocation</span>
              <input
                type="text"
                value={formData.allocation}
                onChange={(e) => setFormData(prev => ({ ...prev, allocation: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Describe the allocation of tokens"
                required
              />
            </label>
          </div>

          {/* Legal and Compliance */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Legal Entity</span>
              <input
                type="text"
                value={formData.legalEntity}
                onChange={(e) => setFormData(prev => ({ ...prev, legalEntity: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Enter the legal entity name"
                required
              />
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Jurisdiction</span>
              <input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Enter the legal jurisdiction"
                required
              />
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Regulatory Compliance</span>
              <textarea
                value={formData.regulatoryCompliance}
                onChange={(e) => setFormData(prev => ({ ...prev, regulatoryCompliance: e.target.value }))}
                className="w-full h-32 px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white resize-none"
                placeholder="Describe how your token complies with regulations..."
                required
              />
            </label>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Website URL</span>
              <div className="relative">
                <input
                  type="url"
                  value={formData.websiteURL}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteURL: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="https://example.com"
                />
                <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Whitepaper</span>
              <div className="relative">
                <input
                  type="url"
                  value={formData.whitepaper}
                  onChange={(e) => setFormData(prev => ({ ...prev, whitepaper: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="https://example.com/whitepaper"
                />
                <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Contact Information</span>
              <input
                type="email"
                value={formData.contactInformation}
                onChange={(e) => setFormData(prev => ({ ...prev, contactInformation: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                placeholder="Enter your contact email"
                required
              />
            </label>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Logo</span>
              <div className="relative">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.files[0] }))}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center w-full h-32 px-4 transition bg-white/5 border-2 border-gray-700 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-500 focus:outline-none"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {formData.logo ? formData.logo.name : 'Drop your logo here or click to upload'}
                    </span>
                  </div>
                </label>
              </div>
            </label>
            <label className="block">
              <span className="text-lg font-semibold block mb-2">Social Media Links</span>
              <div className="space-y-4">
                <input
                  type="url"
                  value={formData.socialMediaLinks.twitter}
                  onChange={(e) => setFormData(prev => ({ ...prev, socialMediaLinks: { ...prev.socialMediaLinks, twitter: e.target.value } }))}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="Twitter URL"
                />
                <input
                  type="url"
                  value={formData.socialMediaLinks.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, socialMediaLinks: { ...prev.socialMediaLinks, linkedin: e.target.value } }))}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="LinkedIn URL"
                />
                <input
                  type="url"
                  value={formData.socialMediaLinks.telegram}
                  onChange={(e) => setFormData(prev => ({ ...prev, socialMediaLinks: { ...prev.socialMediaLinks, telegram: e.target.value } }))}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                  placeholder="Telegram URL"
                />
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90"
            >
              Create Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TokenizationPage;
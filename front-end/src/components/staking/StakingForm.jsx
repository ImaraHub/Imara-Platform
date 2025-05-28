import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { ethers } from 'ethers';

const StakingForm = ({ project, onStake }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStake = async (e) => {
    e.preventDefault();
    if (!user || !user.signer) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert amount to wei
      const stakeAmount = ethers.utils.parseEther(amount);
      
      // TODO: Implement actual staking contract interaction
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onStake(stakeAmount);
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Stake on Project</h3>
      
      <form onSubmit={handleStake}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stake Amount (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount to stake"
            required
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Minimum stake: {project.minStake} ETH
          </div>
          <button
            type="submit"
            disabled={loading || !user}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              loading || !user
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : 'Stake Now'}
          </button>
        </div>
      </form>

      {!user && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
          Please connect your wallet to stake
        </div>
      )}
    </div>
  );
};

export default StakingForm; 
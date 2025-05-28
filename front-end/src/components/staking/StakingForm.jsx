import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { stakingContract } from '../../services/contracts';

const StakingForm = ({ projectId, minStake, onStake }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle stake submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('Please connect your wallet to stake');
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }

    if (parseFloat(amount) < minStake) {
      setError(`Minimum stake amount is ${minStake} ETH`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Stake using smart contract
      await stakingContract.stake(projectId, amount);
      
      // Call the callback to update UI
      await onStake(parseFloat(amount));
      setAmount('');
    } catch (err) {
      setError(err.message || 'Failed to stake');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Stake on Project</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Stake Amount (ETH)
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={minStake}
              step="0.01"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder={`Minimum: ${minStake} ETH`}
              disabled={loading || !user}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Minimum stake amount: {minStake} ETH
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !user}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Staking...' : 'Stake'}
        </button>

        {!user && (
          <p className="text-sm text-yellow-600">
            Please connect your wallet to stake on this project
          </p>
        )}
      </form>
    </div>
  );
};

export default StakingForm; 
import React from 'react';
import { ArrowLeft, Copy, HelpCircle } from 'lucide-react';
import {useAddress} from "@thirdweb-dev/react";


function Stake(){
const walletAddress = useAddress();
const stakingStats = {
    availableBalance: '0 ETH',
    totalStaked: '0 ETH',
    totalRewardsClaimed: '0 ETH',
    estimatedAPR: '18.67%',
    estimatedDailyRewards: '0 ETH',
    unclaimedRewards: '0 ETH'
  };

  return (
    <div className="min-h-screen bg-black text-gray-300">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Staking</span>
          </button>
        </div>

        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl text-white mb-4">Your Staking Dashboard</h1>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-500"></div>
              <span className="text-gray-300">{walletAddress}</span>
              <button className="text-gray-400 hover:text-white">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 mb-1">Rewards Available</div>
            <div className="text-xl text-white">0 ETH</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-800 mb-6">
          <nav className="flex space-x-8">
            <button className="px-4 py-2 text-white border-b-2 border-white">Overview</button>
            <button className="px-4 py-2 text-gray-400 hover:text-white">Governance</button>
          </nav>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-gray-400 mb-2">Eth Available Balance</div>
            <div className="text-2xl text-white">{stakingStats.availableBalance}</div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-gray-400 mb-2">Total Staked Amount</div>
            <div className="text-2xl text-white">{stakingStats.totalStaked}</div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-gray-400 mb-2">Total Rewards Claimed</div>
            <div className="text-2xl text-white">{stakingStats.totalRewardsClaimed}</div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex items-center text-gray-400 mb-2">
              <span>Estimated Staking APR</span>
              <HelpCircle className="w-4 h-4 ml-2" />
            </div>
            <div className="text-2xl text-white">{stakingStats.estimatedAPR}</div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-gray-400 mb-2">Estimated Daily Rewards</div>
            <div className="text-2xl text-white">{stakingStats.estimatedDailyRewards}</div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-gray-400 mb-2">Unclaimed Rewards</div>
            <div className="text-2xl text-white">{stakingStats.unclaimedRewards}</div>
          </div>
        </div>

        {/* Positions Section */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg text-white mb-4">Your positions (0)</h2>
          <p className="text-gray-400">You have no staking positions.</p>
        </div>
      </div>
    </div>
  );
}

export default Stake;

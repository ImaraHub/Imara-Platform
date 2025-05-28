import { ethers } from 'ethers';
import MilestoneContract from '../contracts/Milestone.json';
import StakingContract from '../contracts/Staking.json';
import TokenFactoryContract from '../contracts/TokenFactory.json';

// Contract addresses (should be in environment variables)
const CONTRACT_ADDRESSES = {
  MILESTONE: process.env.REACT_APP_MILESTONE_CONTRACT_ADDRESS,
  STAKING: process.env.REACT_APP_STAKING_CONTRACT_ADDRESS,
  TOKEN_FACTORY: process.env.REACT_APP_TOKEN_FACTORY_CONTRACT_ADDRESS
};

// Get provider and signer
const getProvider = () => {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  throw new Error('Please install MetaMask to use this feature');
};

const getSigner = () => {
  const provider = getProvider();
  return provider.getSigner();
};

// Contract instances
const getMilestoneContract = () => {
  const signer = getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.MILESTONE,
    MilestoneContract.abi,
    signer
  );
};

const getStakingContract = () => {
  const signer = getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.STAKING,
    StakingContract.abi,
    signer
  );
};

const getTokenFactoryContract = () => {
  const signer = getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.TOKEN_FACTORY,
    TokenFactoryContract.abi,
    signer
  );
};

/**
 * Milestone Contract Interactions
 */
export const milestoneContract = {
  // Create a new project
  createProject: async (totalAmount) => {
    const contract = getMilestoneContract();
    const amount = ethers.utils.parseEther(totalAmount.toString());
    const tx = await contract.createProject(amount);
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'ProjectCreated');
    return event.args.projectId.toNumber();
  },

  // Create a new milestone
  createMilestone: async (projectId, title, description, amount) => {
    const contract = getMilestoneContract();
    const milestoneAmount = ethers.utils.parseEther(amount.toString());
    const tx = await contract.createMilestone(
      projectId,
      title,
      description,
      milestoneAmount
    );
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'MilestoneCreated');
    return event.args.milestoneId.toNumber();
  },

  // Approve a milestone
  approveMilestone: async (projectId, milestoneId) => {
    const contract = getMilestoneContract();
    const tx = await contract.approveMilestone(projectId, milestoneId);
    await tx.wait();
  },

  // Release funds for a milestone
  releaseFunds: async (projectId, milestoneId) => {
    const contract = getMilestoneContract();
    const tx = await contract.releaseFunds(projectId, milestoneId);
    await tx.wait();
  },

  // Get project details
  getProject: async (projectId) => {
    const contract = getMilestoneContract();
    const project = await contract.getProject(projectId);
    return {
      id: projectId,
      owner: project.owner,
      totalAmount: ethers.utils.formatEther(project.totalAmount),
      releasedAmount: ethers.utils.formatEther(project.releasedAmount)
    };
  },

  // Get milestone details
  getMilestone: async (projectId, milestoneId) => {
    const contract = getMilestoneContract();
    const milestone = await contract.getMilestone(projectId, milestoneId);
    return {
      id: milestoneId,
      title: milestone.title,
      description: milestone.description,
      amount: ethers.utils.formatEther(milestone.amount),
      isCompleted: milestone.isCompleted,
      isFunded: milestone.isFunded,
      validators: milestone.validators
    };
  }
};

/**
 * Staking Contract Interactions
 */
export const stakingContract = {
  // Stake on a project
  stake: async (projectId, amount) => {
    const contract = getStakingContract();
    const stakeAmount = ethers.utils.parseEther(amount.toString());
    const tx = await contract.stake(projectId, { value: stakeAmount });
    await tx.wait();
  },

  // Get stake amount for a project
  getStakeAmount: async (projectId, staker) => {
    const contract = getStakingContract();
    const amount = await contract.getStakeAmount(projectId, staker);
    return ethers.utils.formatEther(amount);
  },

  // Withdraw stake
  withdrawStake: async (projectId) => {
    const contract = getStakingContract();
    const tx = await contract.withdrawStake(projectId);
    await tx.wait();
  }
};

/**
 * Token Factory Contract Interactions
 */
export const tokenFactoryContract = {
  // Create a new token
  createToken: async (name, symbol, initialSupply) => {
    const contract = getTokenFactoryContract();
    const supply = ethers.utils.parseEther(initialSupply.toString());
    const tx = await contract.createToken(name, symbol, supply);
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'TokenCreated');
    return event.args.tokenAddress;
  },

  // Get token details
  getToken: async (tokenAddress) => {
    const contract = getTokenFactoryContract();
    const token = await contract.getToken(tokenAddress);
    return {
      address: tokenAddress,
      name: token.name,
      symbol: token.symbol,
      totalSupply: ethers.utils.formatEther(token.totalSupply)
    };
  }
}; 
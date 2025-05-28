// Project controller for handling project-related operations
const { ethers } = require('ethers');
const Milestone = require('../../contracts/Milestone.sol');
const Project = require('../../models/Project');

// Mock project database (replace with actual database in production)
const projects = new Map();

/**
 * Create a new project
 * @param {Object} projectData - Project data
 * @param {string} ownerAddress - Project owner's wallet address
 * @returns {Object} Created project
 */
const createProject = async (projectData, ownerAddress) => {
  try {
    // Create project in smart contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const milestoneContract = new ethers.Contract(
      process.env.MILESTONE_CONTRACT_ADDRESS,
      Milestone.abi,
      signer
    );

    // Convert total amount to wei
    const totalAmount = ethers.utils.parseEther(projectData.totalAmount.toString());
    
    // Create project in contract
    const tx = await milestoneContract.createProject(totalAmount);
    const receipt = await tx.wait();
    
    // Get project ID from event
    const event = receipt.events.find(e => e.event === 'ProjectCreated');
    const projectId = event.args.projectId.toNumber();

    // Create project in database
    const project = await Project.create({
      id: projectId,
      owner: ownerAddress.toLowerCase(),
      title: projectData.title,
      description: projectData.description,
      skills: projectData.skills,
      teamSize: projectData.teamSize,
      duration: projectData.duration,
      totalAmount: projectData.totalAmount,
      minStake: projectData.minStake,
      status: 'active'
    });

    return project;
  } catch (error) {
    throw new Error('Failed to create project: ' + error.message);
  }
};

/**
 * Create a new milestone for a project
 * @param {number} projectId - Project ID
 * @param {Object} milestoneData - Milestone data
 * @returns {Object} Created milestone
 */
const createMilestone = async (projectId, milestoneData) => {
  try {
    const project = await Project.findOne({ id: projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    // Create milestone in smart contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const milestoneContract = new ethers.Contract(
      process.env.MILESTONE_CONTRACT_ADDRESS,
      Milestone.abi,
      signer
    );

    // Convert amount to wei
    const amount = ethers.utils.parseEther(milestoneData.amount.toString());
    
    // Create milestone in contract
    const tx = await milestoneContract.createMilestone(
      projectId,
      milestoneData.title,
      milestoneData.description,
      amount
    );
    const receipt = await tx.wait();
    
    // Get milestone ID from event
    const event = receipt.events.find(e => e.event === 'MilestoneCreated');
    const milestoneId = event.args.milestoneId.toNumber();

    // Create milestone in database
    const milestone = {
      id: milestoneId,
      title: milestoneData.title,
      description: milestoneData.description,
      amount: milestoneData.amount,
      status: 'pending'
    };

    project.milestones.push(milestone);
    await project.save();
    
    return milestone;
  } catch (error) {
    throw new Error('Failed to create milestone: ' + error.message);
  }
};

/**
 * Update milestone status
 * @param {number} projectId - Project ID
 * @param {number} milestoneId - Milestone ID
 * @param {string} status - New status
 * @returns {Object} Updated milestone
 */
const updateMilestoneStatus = async (projectId, milestoneId, status) => {
  try {
    const project = await Project.findOne({ id: projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    // Update milestone in smart contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const milestoneContract = new ethers.Contract(
      process.env.MILESTONE_CONTRACT_ADDRESS,
      Milestone.abi,
      signer
    );

    if (status === 'completed') {
      // Approve milestone in contract
      const tx = await milestoneContract.approveMilestone(projectId, milestoneId);
      await tx.wait();
    }

    // Update milestone in database
    milestone.isCompleted = status === 'completed';
    milestone.isFunded = status === 'funded';
    await project.save();
    
    return milestone;
  } catch (error) {
    throw new Error('Failed to update milestone: ' + error.message);
  }
};

/**
 * Get project by ID
 * @param {number} projectId - Project ID
 * @returns {Object} Project data
 */
const getProject = async (projectId) => {
  try {
    const project = await Project.findOne({ id: projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    // Get project data from smart contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const milestoneContract = new ethers.Contract(
      process.env.MILESTONE_CONTRACT_ADDRESS,
      Milestone.abi,
      provider
    );

    const contractData = await milestoneContract.getProject(projectId);
    
    // Merge contract data with database data
    return {
      ...project.toObject(),
      totalAmount: ethers.utils.formatEther(contractData.totalAmount),
      releasedAmount: ethers.utils.formatEther(contractData.releasedAmount)
    };
  } catch (error) {
    throw new Error('Failed to get project: ' + error.message);
  }
};

module.exports = {
  createProject,
  createMilestone,
  updateMilestoneStatus,
  getProject
}; 
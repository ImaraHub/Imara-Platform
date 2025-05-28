// Team controller for handling team-related operations
const { ethers } = require('ethers');
const Staking = require('../../contracts/Staking.sol');
const Team = require('../../models/Team');
const Project = require('../../models/Project');

/**
 * Create a new team
 * @param {Object} teamData - Team data
 * @param {string} ownerAddress - Team owner's wallet address
 * @returns {Object} Created team
 */
const createTeam = async (teamData, ownerAddress) => {
  try {
    // Create team in database
    const team = await Team.create({
      name: teamData.name,
      description: teamData.description,
      owner: ownerAddress.toLowerCase(),
      members: [{
        address: ownerAddress.toLowerCase(),
        role: 'owner'
      }],
      skills: teamData.skills
    });

    return team;
  } catch (error) {
    throw new Error('Failed to create team: ' + error.message);
  }
};

/**
 * Find matching teams for a project
 * @param {Object} projectData - Project data
 * @returns {Array} List of matching teams with scores
 */
const findMatchingTeams = async (projectData) => {
  try {
    const matchingTeams = [];

    // Get all teams
    const teams = await Team.find({
      'members.0': { $exists: true } // Teams with at least one member
    });

    for (const team of teams) {
      // Calculate skill match score
      const skillMatchScore = calculateSkillMatch(projectData.skills, team.skills);
      
      // Calculate reputation score
      const reputationScore = calculateReputationScore(team.reputation);
      
      // Calculate team size score
      const teamSizeScore = calculateTeamSizeScore(team.members.length, projectData.teamSize);
      
      // Calculate total match score
      const totalScore = (skillMatchScore * 0.5) + (reputationScore * 0.3) + (teamSizeScore * 0.2);

      if (totalScore > 0.5) { // Only include teams with >50% match
        matchingTeams.push({
          team,
          score: totalScore,
          matchDetails: {
            skillMatch: skillMatchScore,
            reputationScore,
            teamSizeScore
          }
        });
      }
    }

    // Sort teams by match score
    return matchingTeams.sort((a, b) => b.score - a.score);
  } catch (error) {
    throw new Error('Failed to find matching teams: ' + error.message);
  }
};

/**
 * Calculate skill match score between project and team
 * @param {Array} projectSkills - Project required skills
 * @param {Array} teamSkills - Team skills
 * @returns {number} Match score between 0 and 1
 */
const calculateSkillMatch = (projectSkills, teamSkills) => {
  const matchedSkills = projectSkills.filter(skill => 
    teamSkills.some(teamSkill => 
      teamSkill.toLowerCase() === skill.toLowerCase()
    )
  );
  return matchedSkills.length / projectSkills.length;
};

/**
 * Calculate reputation score
 * @param {number} reputation - Team reputation
 * @returns {number} Score between 0 and 1
 */
const calculateReputationScore = (reputation) => {
  // Normalize reputation to a score between 0 and 1
  return Math.min(reputation / 100, 1);
};

/**
 * Calculate team size match score
 * @param {number} teamSize - Current team size
 * @param {number} requiredSize - Required team size
 * @returns {number} Score between 0 and 1
 */
const calculateTeamSizeScore = (teamSize, requiredSize) => {
  // Perfect match if team size equals required size
  // Lower score if team is too small or too large
  const difference = Math.abs(teamSize - requiredSize);
  return Math.max(0, 1 - (difference / requiredSize));
};

/**
 * Add member to team
 * @param {number} teamId - Team ID
 * @param {string} memberAddress - New member's wallet address
 * @param {string} role - Member's role
 * @returns {Object} Updated team
 */
const addTeamMember = async (teamId, memberAddress, role) => {
  try {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check if member already exists
    if (team.members.some(m => m.address === memberAddress.toLowerCase())) {
      throw new Error('Member already exists in team');
    }

    // Add member to team
    team.members.push({
      address: memberAddress.toLowerCase(),
      role
    });

    await team.save();
    return team;
  } catch (error) {
    throw new Error('Failed to add team member: ' + error.message);
  }
};

/**
 * Update team reputation
 * @param {number} teamId - Team ID
 * @param {number} points - Points to add/subtract
 * @returns {Object} Updated team
 */
const updateTeamReputation = async (teamId, points) => {
  try {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    team.reputation += points;
    await team.save();
    return team;
  } catch (error) {
    throw new Error('Failed to update team reputation: ' + error.message);
  }
};

module.exports = {
  createTeam,
  findMatchingTeams,
  addTeamMember,
  updateTeamReputation
}; 
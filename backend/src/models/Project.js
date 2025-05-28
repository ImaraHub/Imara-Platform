const { supabase } = require('../config/supabase');

class Project {
  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project
   */
  static async create(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        id: projectData.id,
        owner: projectData.owner.toLowerCase(),
        title: projectData.title,
        description: projectData.description,
        skills: projectData.skills,
        team_size: projectData.teamSize,
        duration: projectData.duration,
        total_amount: projectData.totalAmount,
        min_stake: projectData.minStake,
        status: 'active',
        team_id: projectData.teamId
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Find project by ID
   * @param {number} id - Project ID
   * @returns {Promise<Object>} Project data
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        team:teams(*),
        milestones:project_milestones(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Create a new milestone
   * @param {Object} milestoneData - Milestone data
   * @returns {Promise<Object>} Created milestone
   */
  static async createMilestone(milestoneData) {
    const { data, error } = await supabase
      .from('project_milestones')
      .insert([{
        project_id: milestoneData.projectId,
        title: milestoneData.title,
        description: milestoneData.description,
        amount: milestoneData.amount,
        is_completed: false,
        is_funded: false,
        validators: milestoneData.validators || []
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update milestone status
   * @param {number} projectId - Project ID
   * @param {number} milestoneId - Milestone ID
   * @param {Object} updates - Status updates
   * @returns {Promise<Object>} Updated milestone
   */
  static async updateMilestoneStatus(projectId, milestoneId, updates) {
    const { data, error } = await supabase
      .from('project_milestones')
      .update({
        is_completed: updates.isCompleted,
        is_funded: updates.isFunded,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Add stake to project
   * @param {number} projectId - Project ID
   * @param {Object} stakeData - Stake data
   * @returns {Promise<Object>} Updated project
   */
  static async addStake(projectId, stakeData) {
    const { data, error } = await supabase
      .from('project_stakes')
      .insert([{
        project_id: projectId,
        staker: stakeData.staker.toLowerCase(),
        amount: stakeData.amount
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update project status
   * @param {number} projectId - Project ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated project
   */
  static async updateStatus(projectId, status) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = Project; 
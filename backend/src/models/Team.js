const { supabase } = require('../config/supabase');

class Team {
  /**
   * Create a new team
   * @param {Object} teamData - Team data
   * @returns {Promise<Object>} Created team
   */
  static async create(teamData) {
    const { data, error } = await supabase
      .from('teams')
      .insert([{
        name: teamData.name,
        description: teamData.description,
        owner: teamData.owner.toLowerCase(),
        skills: teamData.skills,
        reputation: 0
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Add owner as first team member
    await this.addMember(data.id, {
      address: teamData.owner.toLowerCase(),
      role: 'owner'
    });

    return data;
  }

  /**
   * Find team by ID
   * @param {number} id - Team ID
   * @returns {Promise<Object>} Team data
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(*),
        projects:projects(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Add member to team
   * @param {number} teamId - Team ID
   * @param {Object} memberData - Member data
   * @returns {Promise<Object>} Added member
   */
  static async addMember(teamId, memberData) {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        address: memberData.address.toLowerCase(),
        role: memberData.role
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update team reputation
   * @param {number} teamId - Team ID
   * @param {number} points - Points to add/subtract
   * @returns {Promise<Object>} Updated team
   */
  static async updateReputation(teamId, points) {
    const { data, error } = await supabase
      .from('teams')
      .update({
        reputation: supabase.raw(`reputation + ${points}`),
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Find teams by skills
   * @param {Array} skills - Required skills
   * @returns {Promise<Array>} Matching teams
   */
  static async findBySkills(skills) {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(*)
      `)
      .contains('skills', skills);

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update team profile
   * @param {number} teamId - Team ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated team
   */
  static async updateProfile(teamId, updates) {
    const { data, error } = await supabase
      .from('teams')
      .update({
        name: updates.name,
        description: updates.description,
        skills: updates.skills,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = Team; 
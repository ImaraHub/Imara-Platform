const { supabase } = require('../config/supabase');

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  static async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        address: userData.address.toLowerCase(),
        email: userData.email?.toLowerCase(),
        github_id: userData.githubId,
        type: userData.type,
        profile: {
          name: userData.profile?.name,
          bio: userData.profile?.bio,
          skills: userData.profile?.skills,
          avatar: userData.profile?.avatar
        },
        reputation: userData.reputation || 0
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Find user by address
   * @param {string} address - User's wallet address
   * @returns {Promise<Object>} User data
   */
  static async findByAddress(address) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('address', address.toLowerCase())
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Find user by email
   * @param {string} email - User's email
   * @returns {Promise<Object>} User data
   */
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email.toLowerCase())
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Find user by GitHub ID
   * @param {string} githubId - User's GitHub ID
   * @returns {Promise<Object>} User data
   */
  static async findByGithubId(githubId) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('github_id', githubId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update user profile
   * @param {string} address - User's wallet address
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated user
   */
  static async updateProfile(address, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({
        profile: updates.profile,
        updated_at: new Date().toISOString()
      })
      .eq('address', address.toLowerCase())
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update user reputation
   * @param {string} address - User's wallet address
   * @param {number} points - Points to add/subtract
   * @returns {Promise<Object>} Updated user
   */
  static async updateReputation(address, points) {
    const { data, error } = await supabase
      .from('users')
      .update({
        reputation: supabase.raw(`reputation + ${points}`),
        updated_at: new Date().toISOString()
      })
      .eq('address', address.toLowerCase())
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = User; 
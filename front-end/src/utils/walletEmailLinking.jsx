import { supabase } from "./SupabaseClient";

const CheckEmailForWallet = async (walletAddress) => {
  try {
    // Query to check if the wallet address has an associated email
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        auth.users!users_auth_user_id_fkey (
          email
        )
      `)
      .eq('wallet_address', walletAddress);

    if (error) {
      console.error('Error fetching user data:', error.message);
      return null;
    }

    // Check if the user exists and has an associated email
    if (data.length > 0 && data[0].users && data[0].users.email) {
      console.log('Email found for wallet:', data[0].users.email);
      const user = data[0];
      return user;
    }

    console.log('No email found for this wallet address.');
    return null;
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return null;
  }
};

export default CheckEmailForWallet;
import { supabase } from "./SupabaseClient";

export const LoginWithWallet = async (user) => {
    try {
        // Use Supabase Admin API to generate a session for the user
        const { data, error } = await supabase.auth.admin.generateLink
        ({
            type: 'signin',
            email: user.email,

        }
          // Ensure the id is from `auth.users`
        );
    
        if (error) {
          console.error('Error generating session:', error.message);
          return null;
        }
    
        
        // return data; // This contains the user's session and access token
        supabase.auth.setSession(data)
        console.log('User logged in successfully:', data);
        return data;
      } catch (err) {
        console.error('Unexpected error:', err.message);
        return null;
      }
};

export const AddUser = async (email,wallet) => {
    try {
        const { data: user, error } = await supabase.auth.admin.createUser({
            email,
            // password, // Optional; if omitted, the user will receive a signup link
            email_confirm: true, // Automatically confirm the user's email
          });
      
          if (error) {
            console.error("Error adding user:", error.message);
            return;
          }
      

          console.log("User added successfully:", user);

        // Extract the `auth.user.id` of the newly created user
        const authUserId = user.user.id;

        // Link the wallet address to the user in the `users` table
        const walletData = await addWalletDetails(wallet, authUserId);

        if (!walletData) {
          console.error("Failed to link wallet to user.");
          return null;
        }

        return { user: user.user, wallet: walletData };
        } catch(err){
            console.error("Unexpected error:", err.message);
            return null;

        }

};

const addWalletDetails = async(address, authUserId) => {

    try {
        const { data: walletData, error } = await supabase
      .from('users')
      .insert([{ wallet_address: address, auth_id: authUserId }]);

    if (error) {
      console.error("Error linking wallet to user:", error.message);
      return null;
    }

    console.log("Wallet linked successfully:", walletData);

    return  walletData ;

    }catch (err){
        console.error("Unexpected error:", err.message);
        return null;        
    }
    
}
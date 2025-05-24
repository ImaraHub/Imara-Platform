import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./utils/SupabaseClient";

const AuthContext = createContext();

// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// export const supabase = createClient(supabaseUrl, supabaseKey);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);

        // Set up session refresh
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('Auth state changed:', event);
          setSession(currentSession);
          setUser(currentSession?.user || null);
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }
        });

        setLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error fetching session:', error);
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const value = {
    user,
    session,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

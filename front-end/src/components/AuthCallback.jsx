import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log all URL parameters for debugging
        console.log('All URL parameters:', Object.fromEntries(searchParams.entries()));
        
        // Get the code and state from URL parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('Auth callback received:', { 
          hasCode: !!code, 
          hasState: !!state,
          hasError: !!error,
          errorDescription 
        });

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          
          // Handle specific error cases
          if (error === 'server_error' && errorDescription?.includes('Multiple accounts')) {
            setErrorMessage('An account with this email already exists. Please sign in with your original method or contact support.');
            // Wait a few seconds before redirecting
            setTimeout(() => {
              navigate('/?error=account_exists');
            }, 3000);
          } else {
            setErrorMessage('Authentication failed. Please try again.');
            setTimeout(() => {
              navigate('/?error=auth_error');
            }, 3000);
          }
          return;
        }

        if (code) {
          console.log('Attempting to exchange code for session...');
          // Exchange the code for a session
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          console.log('Exchange response:', { 
            success: !exchangeError, 
            error: exchangeError?.message,
            hasSession: !!exchangeData?.session 
          });

          if (!exchangeError) {
            // Get the current session after exchange
            const { data: { session } } = await supabase.auth.getSession();
            
            console.log('Session after exchange:', session ? 'present' : 'missing');
            
            if (session) {
              // Store user email in localStorage
              localStorage.setItem("userEmail", session.user.email);
              console.log('Successfully authenticated user:', session.user.email);
              // Redirect to home page
              navigate('/');
              return;
            }
          } else {
            console.error('Error exchanging code for session:', exchangeError.message);
            setErrorMessage('Failed to complete authentication. Please try again.');
            setTimeout(() => {
              navigate('/?error=auth_error');
            }, 3000);
          }
        }

        // If we get here, something went wrong
        console.error('No code found or error during exchange');
        setErrorMessage('Authentication failed. Please try again.');
        setTimeout(() => {
          navigate('/?error=auth_error');
        }, 3000);
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setErrorMessage('An unexpected error occurred. Please try again.');
        setTimeout(() => {
          navigate('/?error=unexpected_error');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">
          {errorMessage ? 'Authentication Error' : 'Completing Authentication...'}
        </h2>
        {errorMessage ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-400">{errorMessage}</p>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        )}
      </div>
    </div>
  );
} 
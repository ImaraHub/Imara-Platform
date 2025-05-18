import React, { useState, useEffect } from 'react';
import { Github, Wallet, Mail, ArrowRight } from 'lucide-react';
import { ConnectWallet, useAddress, useSigner } from "@thirdweb-dev/react";
// import {useNavigate} from "react-router-dom";
import { supabase } from '../utils/SupabaseClient';

export function Auth({ setShowAuth, setShowHome }) {

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const address = useAddress();
  const signer = useSigner();
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    if (address) {
      signMessage();
      console.log("Connected wallet address:", address);
      setShowAuth(false);  // Hide the Auth page
      setShowHome(true);    // Show the Home page
    }
  }, [address]);

  // a const that shows pop-up message

  const WarningPopup = ({ message }) => {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
        {message}
      </div>
    );
  };

  // const errorMsgPopup = errorMsg ? <WarningPopup message={errorMsg} /> : null;

  const signMessage = async () => {

    if (!signer) {
      console.error("Signer not found");
      return;
    }
    const message = "Sign this message to sign into Imara";
    const signature = await signer.signMessage(message);
    setSignature(signature);
    console.log("Signature:", signature);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      await signInWithEmail();
    } else {
      await signUpNewUser();
    }
  };

  const signUpNewUser = async () => {
    setLoading(true);
    setErrorMsg('');
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://imara-platform.onrender.com',
      }
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setErrorMsg('Please check your email to confirm your sign up.');
      setIsLogin(true);
      console.log('User created successfully:', user);
    }

  }

  // if (errorMsg) {
  //   <errorMsgPopup />
  //   setErrorMsg('');
  // }



  const signInWithEmail = async () => {
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);

    if (error) {

      setErrorMsg('User not found. Please sign up.');
      console.log('Error signing in:', error.message)

    } else {
      console.log('User signed in successfully:', data);

      // Fetch user details
      const { data: userData, error: userError } = await supabase.auth.getUser();

      localStorage.setItem("userEmail", userData.user.email);

      setShowAuth(false);  // Hide the Auth page
      setShowHome(true);    // Show the Home page
    }
  }


  // const authWithSupabase = async (signature) => {
  //   const { data, error} =  await supabase.auth.signInWithIdToken({
  //     provider: 'walletconnect',
  //     token: signature
  //   });
  //   if (error) {
  //     console.error("Error signing in:", error);
  //   } else {
  //     console.log("User signed in:", data);
  //   }
  // }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">


      {errorMsg && <WarningPopup message={errorMsg} />}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
            <img src="/vite.svg" alt="Logo" className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white">Welcome to IMARA</h2>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Sign in to continue to the platform' : 'Create your account to get started'}
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => setShowAuth(false)}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 mb-6 rounded-lg transition-all"
        >
          Back to Home
        </button>
        {/* Auth Options */}
        <div className="space-y-4 mb-8">

          <button className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-3 group">
            <Wallet className="w-5 h-5" />
            <ConnectWallet />
            {address && <button onClick={signMessage}>Sign In with Wallet</button>}
            <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </button>

        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-900 text-gray-400">Or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
              placeholder="Eg: email@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* ✅ Sign In Button Triggers handleSubmit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* ✅ Toggle Sign-Up or Sign-In Mode */}
        <p className="mt-8 text-center text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
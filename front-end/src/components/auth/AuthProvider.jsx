import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Web3 provider
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setUser({ address, provider, signer });
        } catch (err) {
          setError(err.message);
        }
      }
      setLoading(false);
    };

    initWeb3();
  }, []);

  // Email authentication
  const loginWithEmail = async (email, password) => {
    try {
      // TODO: Implement email authentication
      setLoading(true);
      // Mock implementation
      setUser({ email });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // GitHub authentication
  const loginWithGitHub = async () => {
    try {
      // TODO: Implement GitHub OAuth
      setLoading(true);
      // Mock implementation
      setUser({ provider: 'github' });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Web3 wallet authentication
  const loginWithWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setUser({ address, provider, signer });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithEmail,
        loginWithGitHub,
        loginWithWallet,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
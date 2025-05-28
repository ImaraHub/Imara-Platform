// Authentication controller for handling user authentication
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../../models/User');

// JWT secret key (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Authenticate user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} JWT token and user data
 */
const loginWithEmail = async (email, password) => {
  try {
    // TODO: Implement actual email authentication
    // This is a mock implementation
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        type: 'email',
        address: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email)).slice(0, 42)
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    
    return { token, user };
  } catch (error) {
    throw new Error('Authentication failed');
  }
};

/**
 * Authenticate user with GitHub OAuth
 * @param {string} code - GitHub OAuth code
 * @returns {Object} JWT token and user data
 */
const loginWithGitHub = async (code) => {
  try {
    // TODO: Implement GitHub OAuth
    // This is a mock implementation
    let user = await User.findOne({ githubId: '123' });
    
    if (!user) {
      user = await User.create({
        githubId: '123',
        type: 'github',
        address: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('123')).slice(0, 42)
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    
    return { token, user };
  } catch (error) {
    throw new Error('GitHub authentication failed');
  }
};

/**
 * Authenticate user with Web3 wallet
 * @param {string} address - User's wallet address
 * @param {string} signature - Signed message
 * @returns {Object} JWT token and user data
 */
const loginWithWallet = async (address, signature) => {
  try {
    // Verify the signature
    const message = `Sign this message to authenticate with Imara Platform. Address: ${address}`;
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Invalid signature');
    }

    // Create or get user
    let user = await User.findOne({ address: address.toLowerCase() });
    if (!user) {
      user = await User.create({
        address: address.toLowerCase(),
        type: 'wallet'
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    
    return { token, user };
  } catch (error) {
    throw new Error('Wallet authentication failed');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token data
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  loginWithEmail,
  loginWithGitHub,
  loginWithWallet,
  verifyToken
}; 
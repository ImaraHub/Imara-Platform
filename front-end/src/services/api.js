// API service for making HTTP requests to the backend
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on auth error
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API calls
 */
export const auth = {
  // Login with email and password
  loginWithEmail: async (email, password) => {
    const response = await api.post('/auth/login/email', { email, password });
    return response.data;
  },

  // Login with GitHub OAuth
  loginWithGitHub: async (code) => {
    const response = await api.post('/auth/login/github', { code });
    return response.data;
  },

  // Login with Web3 wallet
  loginWithWallet: async (address, signature) => {
    const response = await api.post('/auth/login/wallet', { address, signature });
    return response.data;
  }
};

/**
 * Project API calls
 */
export const projects = {
  // Create new project
  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Get project by ID
  get: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create milestone for project
  createMilestone: async (projectId, milestoneData) => {
    const response = await api.post(`/projects/${projectId}/milestones`, milestoneData);
    return response.data;
  },

  // Update milestone status
  updateMilestoneStatus: async (projectId, milestoneId, status) => {
    const response = await api.patch(
      `/projects/${projectId}/milestones/${milestoneId}`,
      { status }
    );
    return response.data;
  }
};

/**
 * Team API calls
 */
export const teams = {
  // Create new team
  create: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  // Find matching teams for project
  findMatches: async (projectData) => {
    const response = await api.get('/teams/match', { params: projectData });
    return response.data;
  },

  // Add member to team
  addMember: async (teamId, memberAddress, role) => {
    const response = await api.post(`/teams/${teamId}/members`, {
      memberAddress,
      role
    });
    return response.data;
  },

  // Update team reputation
  updateReputation: async (teamId, points) => {
    const response = await api.patch(`/teams/${teamId}/reputation`, { points });
    return response.data;
  }
};

export default api; 
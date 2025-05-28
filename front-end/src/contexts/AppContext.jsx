import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { projects } from '../services/api';

// Initial state
const initialState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null
};

// Action types
const ActionTypes = {
  SET_PROJECTS: 'SET_PROJECTS',
  SET_SELECTED_PROJECT: 'SET_SELECTED_PROJECT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT'
};

// Reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload,
        loading: false,
        error: null
      };
    case ActionTypes.SET_SELECTED_PROJECT:
      return {
        ...state,
        selectedProject: action.payload,
        loading: false,
        error: null
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case ActionTypes.ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload],
        loading: false,
        error: null
      };
    case ActionTypes.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
        selectedProject:
          state.selectedProject?.id === action.payload.id
            ? action.payload
            : state.selectedProject,
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      try {
        // TODO: Implement project listing API
        // For now, use mock data
        const mockProjects = [
          {
            id: 1,
            title: 'Sample Project 1',
            description: 'This is a sample project description',
            owner: '0x1234...5678',
            status: 'active',
            skills: ['React', 'Node.js', 'Solidity'],
            teamSize: 3,
            duration: 12,
            totalAmount: 10,
            minStake: 1,
            createdAt: new Date(),
            milestones: [
              {
                id: 1,
                title: 'Milestone 1',
                description: 'First milestone',
                amount: 3,
                isCompleted: true,
                isFunded: true
              },
              {
                id: 2,
                title: 'Milestone 2',
                description: 'Second milestone',
                amount: 4,
                isCompleted: false,
                isFunded: false
              }
            ]
          }
        ];
        dispatch({ type: ActionTypes.SET_PROJECTS, payload: mockProjects });
      } catch (error) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: 'Failed to fetch projects'
        });
      }
    };

    fetchProjects();
  }, []);

  // Select project
  const selectProject = async (projectId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const project = await projects.get(projectId);
      dispatch({ type: ActionTypes.SET_SELECTED_PROJECT, payload: project });
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: 'Failed to fetch project details'
      });
    }
  };

  // Create project
  const createProject = async (projectData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const project = await projects.create(projectData);
      dispatch({ type: ActionTypes.ADD_PROJECT, payload: project });
      return project;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: 'Failed to create project'
      });
      throw error;
    }
  };

  // Update project
  const updateProject = async (projectId, updates) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const project = await projects.get(projectId);
      const updatedProject = { ...project, ...updates };
      dispatch({ type: ActionTypes.UPDATE_PROJECT, payload: updatedProject });
      return updatedProject;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: 'Failed to update project'
      });
      throw error;
    }
  };

  // Context value
  const value = {
    ...state,
    selectProject,
    createProject,
    updateProject
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 
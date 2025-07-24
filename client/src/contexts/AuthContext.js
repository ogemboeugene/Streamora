import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

import { authAPI } from '../services/api';

// Initial state
const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Check if user is authenticated on app load
  const { isLoading } = useQuery(
    'currentUser',
    authAPI.getCurrentUser,
    {
      retry: false,
      staleTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data.user) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: data.user },
          });
        } else {
          // User is not logged in
          dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
        }
      },
      onError: (error) => {
        // Only log in development, don't show user errors for failed auth checks
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth check failed (expected if not logged in):', error.message);
        }
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      },
    }
  );

  useEffect(() => {
    if (!isLoading) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, [isLoading]);

  // Login function
  const login = async (email, password, rememberMe) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const credentials = { email, password, rememberMe };
      const response = await authAPI.login(credentials);
      
      if (response.token) {
        // Store token in cookie
        Cookies.set('token', response.token, { 
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: response.user },
      });

      // Invalidate and refetch user data
      queryClient.invalidateQueries('currentUser');
      
      toast.success(`Welcome back, ${response.user.username}!`);
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await authAPI.register(userData);
      
      if (response.token) {
        // Store token in cookie
        Cookies.set('token', response.token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: response.user },
      });

      // Invalidate and refetch user data
      queryClient.invalidateQueries('currentUser');
      
      toast.success(`Welcome to Streamora, ${response.user.username}!`);
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token from cookie
      Cookies.remove('token');
      
      // Remove axios authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      // Clear all cached data
      queryClient.clear();
      
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateProfile = async (updateData) => {
    try {
      const response = await authAPI.updateProfile(updateData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.user,
      });
      
      // Invalidate user queries
      queryClient.invalidateQueries('currentUser');
      
      toast.success('Profile updated successfully');
      
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await authAPI.updatePreferences(preferences);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { preferences: response.preferences },
      });
      
      toast.success('Preferences updated');
      
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update preferences';
      toast.error(message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async (password) => {
    try {
      await authAPI.deleteAccount({ password });
      
      // Clear everything and redirect
      Cookies.remove('token');
      delete axios.defaults.headers.common['Authorization'];
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      queryClient.clear();
      
      toast.success('Account deleted successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Account deletion failed';
      toast.error(message);
      throw error;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin' || state.user?.role === 'moderator';
  };

  // Check if user has premium subscription
  const isPremium = () => {
    return state.user?.subscriptions?.plan === 'premium' && 
           new Date(state.user.subscriptions.expiresAt) > new Date();
  };

  // Set up axios interceptor for token
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Response interceptor for handling token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && state.isAuthenticated) {
          // Token expired or invalid
          Cookies.remove('token');
          delete axios.defaults.headers.common['Authorization'];
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
          queryClient.clear();
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [state.isAuthenticated, queryClient]);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    changePassword,
    deleteAccount,
    isAdmin,
    isPremium,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

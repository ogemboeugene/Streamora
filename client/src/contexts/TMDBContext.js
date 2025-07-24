import React, { createContext, useContext, useState, useEffect } from 'react';
import { contentAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const TMDBContext = createContext();

export const useTMDB = () => {
  const context = useContext(TMDBContext);
  if (!context) {
    throw new Error('useTMDB must be used within a TMDBProvider');
  }
  return context;
};

export const TMDBProvider = ({ children }) => {
  const [tmdbSession, setTmdbSession] = useState(null);
  const [tmdbAccount, setTmdbAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load TMDB session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('tmdb_session');
    const savedAccount = localStorage.getItem('tmdb_account');
    
    if (savedSession && savedAccount) {
      setTmdbSession(JSON.parse(savedSession));
      setTmdbAccount(JSON.parse(savedAccount));
      setIsAuthenticated(true);
    }
  }, []);

  const loginWithTMDB = async (username, password) => {
    try {
      setIsLoading(true);
      
      // Step 1: Create request token
      const tokenResponse = await contentAPI.createTMDBRequestToken();
      const requestToken = tokenResponse.data.request_token;
      
      // Step 2: Validate with login
      const sessionResponse = await contentAPI.createTMDBSession(username, password, requestToken);
      
      if (sessionResponse.data.success) {
        const sessionId = sessionResponse.data.session_id;
        
        // Step 3: Get account details
        const accountResponse = await contentAPI.getTMDBAccountDetails(sessionId);
        
        const sessionData = {
          session_id: sessionId,
          expires_at: sessionResponse.data.expires_at
        };
        
        const accountData = accountResponse.data;
        
        // Save to state and localStorage
        setTmdbSession(sessionData);
        setTmdbAccount(accountData);
        setIsAuthenticated(true);
        
        localStorage.setItem('tmdb_session', JSON.stringify(sessionData));
        localStorage.setItem('tmdb_account', JSON.stringify(accountData));
        
        toast.success('Successfully connected to TMDB account!');
        return { success: true };
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('TMDB login error:', error);
      toast.error(error.response?.data?.message || 'Failed to connect to TMDB account');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    try {
      setIsLoading(true);
      
      const guestResponse = await contentAPI.createTMDBGuestSession();
      
      if (guestResponse.data.success) {
        const guestSessionData = {
          guest_session_id: guestResponse.data.guest_session_id,
          expires_at: guestResponse.data.expires_at
        };
        
        const guestAccountData = {
          id: null,
          username: 'Guest',
          name: 'Guest User',
          include_adult: false,
          iso_639_1: 'en',
          iso_3166_1: 'US'
        };
        
        setTmdbSession(guestSessionData);
        setTmdbAccount(guestAccountData);
        setIsAuthenticated(true);
        
        localStorage.setItem('tmdb_session', JSON.stringify(guestSessionData));
        localStorage.setItem('tmdb_account', JSON.stringify(guestAccountData));
        
        toast.success('Connected as TMDB guest!');
        return { success: true };
      } else {
        throw new Error('Failed to create guest session');
      }
    } catch (error) {
      console.error('TMDB guest login error:', error);
      toast.error('Failed to connect as guest');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (tmdbSession?.session_id) {
        await contentAPI.deleteTMDBSession(tmdbSession.session_id);
      }
    } catch (error) {
      console.error('Error deleting TMDB session:', error);
    } finally {
      setTmdbSession(null);
      setTmdbAccount(null);
      setIsAuthenticated(false);
      
      localStorage.removeItem('tmdb_session');
      localStorage.removeItem('tmdb_account');
      
      toast.success('Disconnected from TMDB account');
    }
  };

  const addToWatchlist = async (mediaType, mediaId, watchlist = true) => {
    if (!isAuthenticated || !tmdbAccount?.id || tmdbSession?.guest_session_id) {
      toast.error('TMDB account login required for watchlist features');
      return { success: false };
    }

    try {
      const sessionId = tmdbSession.session_id;
      const accountId = tmdbAccount.id;
      
      const response = await contentAPI.addToTMDBWatchlist(
        accountId,
        sessionId,
        mediaType,
        mediaId,
        watchlist
      );
      
      if (response.data.success) {
        toast.success(watchlist ? 'Added to TMDB watchlist' : 'Removed from TMDB watchlist');
        return { success: true };
      } else {
        throw new Error('Failed to update watchlist');
      }
    } catch (error) {
      console.error('Error updating TMDB watchlist:', error);
      toast.error('Failed to update TMDB watchlist');
      return { success: false, error: error.message };
    }
  };

  const addToFavorites = async (mediaType, mediaId, favorite = true) => {
    if (!isAuthenticated || !tmdbAccount?.id || tmdbSession?.guest_session_id) {
      toast.error('TMDB account login required for favorites features');
      return { success: false };
    }

    try {
      const sessionId = tmdbSession.session_id;
      const accountId = tmdbAccount.id;
      
      const response = await contentAPI.addToTMDBFavorites(
        accountId,
        sessionId,
        mediaType,
        mediaId,
        favorite
      );
      
      if (response.data.success) {
        toast.success(favorite ? 'Added to TMDB favorites' : 'Removed from TMDB favorites');
        return { success: true };
      } else {
        throw new Error('Failed to update favorites');
      }
    } catch (error) {
      console.error('Error updating TMDB favorites:', error);
      toast.error('Failed to update TMDB favorites');
      return { success: false, error: error.message };
    }
  };

  const rateContent = async (mediaType, mediaId, rating) => {
    if (!isAuthenticated) {
      toast.error('TMDB session required for rating');
      return { success: false };
    }

    try {
      const sessionId = tmdbSession.session_id || tmdbSession.guest_session_id;
      
      const response = mediaType === 'movie'
        ? await contentAPI.rateTMDBMovie(mediaId, sessionId, rating)
        : await contentAPI.rateTMDBTV(mediaId, sessionId, rating);
      
      if (response.data.success) {
        toast.success('Rating saved to TMDB');
        return { success: true };
      } else {
        throw new Error('Failed to save rating');
      }
    } catch (error) {
      console.error('Error rating content:', error);
      toast.error('Failed to save rating to TMDB');
      return { success: false, error: error.message };
    }
  };

  const getWatchlist = async (mediaType, page = 1) => {
    if (!isAuthenticated || !tmdbAccount?.id || tmdbSession?.guest_session_id) {
      return { success: false, data: [] };
    }

    try {
      const sessionId = tmdbSession.session_id;
      const accountId = tmdbAccount.id;
      
      const response = mediaType === 'movie'
        ? await contentAPI.getTMDBWatchlistMovies(accountId, sessionId, page)
        : await contentAPI.getTMDBWatchlistTV(accountId, sessionId, page);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching TMDB watchlist:', error);
      return { success: false, data: [] };
    }
  };

  const getFavorites = async (mediaType, page = 1) => {
    if (!isAuthenticated || !tmdbAccount?.id || tmdbSession?.guest_session_id) {
      return { success: false, data: [] };
    }

    try {
      const sessionId = tmdbSession.session_id;
      const accountId = tmdbAccount.id;
      
      const response = mediaType === 'movie'
        ? await contentAPI.getTMDBFavoriteMovies(accountId, sessionId, page)
        : await contentAPI.getTMDBFavoriteTV(accountId, sessionId, page);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching TMDB favorites:', error);
      return { success: false, data: [] };
    }
  };

  const value = {
    tmdbSession,
    tmdbAccount,
    isLoading,
    isAuthenticated,
    loginWithTMDB,
    loginAsGuest,
    logout,
    addToWatchlist,
    addToFavorites,
    rateContent,
    getWatchlist,
    getFavorites
  };

  return (
    <TMDBContext.Provider value={value}>
      {children}
    </TMDBContext.Provider>
  );
};

export default TMDBContext;

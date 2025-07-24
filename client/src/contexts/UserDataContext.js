import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const UserDataContext = createContext();

// Helper function to normalize poster data
const getNormalizedPoster = (contentData) => {
  // Handle different poster data structures and return a simple string
  
  // 1. Try poster.url first (most reliable)
  if (contentData.poster?.url) return contentData.poster.url;
  
  // 2. Try TMDB poster_path
  if (contentData.poster_path) {
    return contentData.poster_path.startsWith('http') 
      ? contentData.poster_path 
      : `https://image.tmdb.org/t/p/w500${contentData.poster_path}`;
  }
  
  // 3. Try direct poster field
  if (contentData.poster) {
    if (typeof contentData.poster === 'string') {
      if (contentData.poster.startsWith('http')) return contentData.poster;
      if (contentData.poster.startsWith('/')) return `https://image.tmdb.org/t/p/w500${contentData.poster}`;
      return contentData.poster;
    }
    if (contentData.poster.url) return contentData.poster.url;
  }
  
  // 4. Try image field as fallback
  if (contentData.image) {
    if (contentData.image.startsWith('http')) return contentData.image;
    if (contentData.image.startsWith('/')) return `https://image.tmdb.org/t/p/w500${contentData.image}`;
    return contentData.image;
  }
  
  // 5. Try backdrop_path as last resort
  if (contentData.backdrop_path) {
    return contentData.backdrop_path.startsWith('http') 
      ? contentData.backdrop_path 
      : `https://image.tmdb.org/t/p/w500${contentData.backdrop_path}`;
  }
  
  return null; // Let backend handle fallback
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user data when user logs in
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      clearUserData();
    }
  }, [user]);

  const clearUserData = () => {
    setWatchlist([]);
    setFavorites([]);
    setRatings([]);
    setCustomLists([]);
    setWatchHistory([]);
    setUserStats(null);
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Load all user data in parallel
      const [
        watchlistRes,
        favoritesRes,
        ratingsRes,
        listsRes,
        historyRes,
        statsRes
      ] = await Promise.all([
        userAPI.getWatchlist(),
        userAPI.getFavorites(),
        userAPI.getRatings(),
        userAPI.getCustomLists(),
        userAPI.getWatchHistory({ limit: 50 }),
        userAPI.getUserStats()
      ]);

      setWatchlist(watchlistRes.data || []);
      setFavorites(favoritesRes.data || []);
      setRatings(ratingsRes.data || []);
      setCustomLists(listsRes.data || []);
      setWatchHistory(historyRes.data || []);
      setUserStats(statsRes.data || null);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== WATCHLIST FUNCTIONS ==========

  const addToWatchlist = async (contentData) => {
    if (!user) {
      toast.error('Please login to add to watchlist');
      return { success: false };
    }

    try {
      // Normalize poster data for API
      const normalizedPoster = getNormalizedPoster(contentData);
      
      const apiData = {
        contentId: contentData.contentId || contentData.id || contentData.tmdbId,
        contentType: contentData.contentType || contentData.type || (contentData.first_air_date ? 'tv' : 'movie'),
        title: contentData.title || contentData.name,
        poster: normalizedPoster
      };

      const response = await userAPI.addToWatchlist(apiData);
      
      if (response.success) {
        // Add normalized data to local state
        const watchlistItem = {
          ...contentData,
          contentId: apiData.contentId,
          contentType: apiData.contentType,
          poster: normalizedPoster
        };
        setWatchlist(prev => [watchlistItem, ...prev]);
        toast.success('Added to watchlist');
        return { success: true };
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Item already in watchlist');
      } else {
        toast.error('Failed to add to watchlist');
      }
      console.error('Error adding to watchlist:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFromWatchlist = async (contentId) => {
    if (!user) return { success: false };

    try {
      const response = await userAPI.removeFromWatchlist(contentId);
      
      if (response.success) {
        setWatchlist(prev => prev.filter(item => item.contentId !== contentId));
        toast.success('Removed from watchlist');
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to remove from watchlist');
      console.error('Error removing from watchlist:', error);
      return { success: false, error: error.message };
    }
  };

  const isInWatchlist = (contentId) => {
    return watchlist.some(item => item.contentId === contentId);
  };

  // ========== FAVORITES FUNCTIONS ==========

  const addToFavorites = async (contentData) => {
    if (!user) {
      toast.error('Please login to add to favorites');
      return { success: false };
    }

    try {
      // Normalize poster data for API
      const normalizedPoster = getNormalizedPoster(contentData);
      
      const apiData = {
        contentId: contentData.contentId || contentData.id || contentData.tmdbId,
        contentType: contentData.contentType || contentData.type || (contentData.first_air_date ? 'tv' : 'movie'),
        title: contentData.title || contentData.name,
        poster: normalizedPoster
      };

      const response = await userAPI.addToFavorites(apiData);
      
      if (response.success) {
        // Add normalized data to local state
        const favoriteItem = {
          ...contentData,
          contentId: apiData.contentId,
          contentType: apiData.contentType,
          poster: normalizedPoster
        };
        setFavorites(prev => [favoriteItem, ...prev]);
        toast.success('Added to favorites');
        return { success: true };
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Item already in favorites');
      } else {
        toast.error('Failed to add to favorites');
      }
      console.error('Error adding to favorites:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFromFavorites = async (contentId) => {
    if (!user) return { success: false };

    try {
      const response = await userAPI.removeFromFavorites(contentId);
      
      if (response.success) {
        setFavorites(prev => prev.filter(item => item.contentId !== contentId));
        toast.success('Removed from favorites');
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to remove from favorites');
      console.error('Error removing from favorites:', error);
      return { success: false, error: error.message };
    }
  };

  const isFavorite = (contentId) => {
    return favorites.some(item => item.contentId === contentId);
  };

  // ========== RATINGS FUNCTIONS ==========

  const addRating = async (contentData) => {
    if (!user) {
      toast.error('Please login to rate content');
      return { success: false };
    }

    try {
      const response = await userAPI.addRating(contentData);
      
      if (response.success) {
        // Update ratings array
        setRatings(prev => {
          const filtered = prev.filter(item => item.contentId !== contentData.contentId);
          return [contentData, ...filtered];
        });
        toast.success('Rating saved');
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to save rating');
      console.error('Error saving rating:', error);
      return { success: false, error: error.message };
    }
  };

  const removeRating = async (contentId) => {
    if (!user) return { success: false };

    try {
      const response = await userAPI.removeRating(contentId);
      
      if (response.success) {
        setRatings(prev => prev.filter(item => item.contentId !== contentId));
        toast.success('Rating removed');
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to remove rating');
      console.error('Error removing rating:', error);
      return { success: false, error: error.message };
    }
  };

  const getUserRating = (contentId) => {
    const rating = ratings.find(item => item.contentId === contentId);
    return rating ? rating.rating : null;
  };

  // ========== CUSTOM LISTS FUNCTIONS ==========

  const createCustomList = async (listData) => {
    if (!user) {
      toast.error('Please login to create lists');
      return { success: false };
    }

    try {
      const response = await userAPI.createCustomList(listData);
      
      if (response.success) {
        // Reload lists to get the new list with ID
        const listsRes = await userAPI.getCustomLists();
        setCustomLists(listsRes.data || []);
        toast.success('List created successfully');
        return { success: true };
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('You already have a list with this name');
      } else {
        toast.error('Failed to create list');
      }
      console.error('Error creating list:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCustomList = async (listId, updateData) => {
    if (!user) return { success: false };

    try {
      const response = await userAPI.updateCustomList(listId, updateData);
      
      if (response.success) {
        setCustomLists(prev => 
          prev.map(list => 
            list._id === listId 
              ? { ...list, ...updateData, updatedAt: new Date() }
              : list
          )
        );
        toast.success('List updated successfully');
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to update list');
      console.error('Error updating list:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteCustomList = async (listId) => {
    if (!user) return { success: false };

    try {
      const response = await userAPI.deleteCustomList(listId);
      
      if (response.success) {
        setCustomLists(prev => prev.filter(list => list._id !== listId));
        toast.success('List deleted successfully');
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to delete list');
      console.error('Error deleting list:', error);
      return { success: false, error: error.message };
    }
  };

  const addToCustomList = async (listId, contentData) => {
    if (!user) return { success: false };

    try {
      // Normalize poster data for API
      const normalizedPoster = getNormalizedPoster(contentData);
      
      const apiData = {
        contentId: contentData.contentId || contentData.id || contentData.tmdbId,
        contentType: contentData.contentType || contentData.type || (contentData.first_air_date ? 'tv' : 'movie'),
        title: contentData.title || contentData.name,
        poster: normalizedPoster
      };

      const response = await userAPI.addToCustomList(listId, apiData);
      
      if (response.success) {
        // Update the specific list's item count
        setCustomLists(prev => 
          prev.map(list => 
            list._id === listId 
              ? { ...list, itemCount: (list.itemCount || 0) + 1, updatedAt: new Date() }
              : list
          )
        );
        toast.success('Added to list');
        return { success: true };
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Item already in list');
      } else {
        toast.error('Failed to add to list');
      }
      console.error('Error adding to list:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFromCustomList = async (listId, contentId) => {
    if (!user) return { success: false };

    try {
      const response = await userAPI.removeFromCustomList(listId, contentId);
      
      if (response.success) {
        // Update the specific list's item count
        setCustomLists(prev => 
          prev.map(list => 
            list._id === listId 
              ? { ...list, itemCount: Math.max((list.itemCount || 1) - 1, 0), updatedAt: new Date() }
              : list
          )
        );
        toast.success('Removed from list');
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to remove from list');
      console.error('Error removing from list:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== WATCH HISTORY FUNCTIONS ==========

  const addToWatchHistory = async (contentData) => {
    if (!user) return { success: false };

    try {
      const response = await userAPI.addToWatchHistory(contentData);
      
      if (response.success) {
        // Add to the beginning of watch history
        setWatchHistory(prev => {
          const filtered = prev.filter(item => item.contentId !== contentData.contentId);
          return [contentData, ...filtered.slice(0, 49)]; // Keep only 50 items
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error adding to watch history:', error);
      return { success: false, error: error.message };
    }
  };

  const updateWatchProgress = async (contentId, progress, duration) => {
    if (!user) return { success: false };

    try {
      const response = await userAPI.updateWatchProgress(contentId, { progress, duration });
      
      if (response.success) {
        // Update the specific item in watch history
        setWatchHistory(prev => 
          prev.map(item => 
            item.contentId === contentId 
              ? { ...item, progress, duration, watchedAt: new Date() }
              : item
          )
        );
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating watch progress:', error);
      return { success: false, error: error.message };
    }
  };

  const clearWatchHistory = async () => {
    if (!user) return { success: false };

    try {
      const response = await userAPI.clearWatchHistory();
      
      if (response.success) {
        setWatchHistory([]);
        toast.success('Watch history cleared');
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to clear watch history');
      console.error('Error clearing watch history:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== STATS FUNCTIONS ==========

  const refreshStats = async () => {
    if (!user) return;

    try {
      const statsRes = await userAPI.getUserStats();
      setUserStats(statsRes.data || null);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const value = {
    // Data
    watchlist,
    favorites,
    ratings,
    customLists,
    watchHistory,
    userStats,
    isLoading,

    // Watchlist functions
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,

    // Favorites functions
    addToFavorites,
    removeFromFavorites,
    isFavorite,

    // Ratings functions
    addRating,
    removeRating,
    getUserRating,

    // Custom lists functions
    createCustomList,
    updateCustomList,
    deleteCustomList,
    addToCustomList,
    removeFromCustomList,

    // Watch history functions
    addToWatchHistory,
    updateWatchProgress,
    clearWatchHistory,

    // Utility functions
    loadUserData,
    refreshStats
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataContext;

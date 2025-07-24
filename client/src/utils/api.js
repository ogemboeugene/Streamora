import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching for certain endpoints
    if (config.method === 'get' && config.url?.includes('/search')) {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle 401 errors - but don't redirect for auth/me endpoint when user is not logged in
    if (error.response?.status === 401) {
      const isAuthMeEndpoint = error.config?.url?.includes('/auth/me');
      if (!isAuthMeEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    
    return Promise.reject({
      ...error,
      message,
      status: error.response?.status,
    });
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePreferences: (preferences) => api.put('/auth/preferences', preferences),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  deleteAccount: (data) => api.delete('/auth/account', { data }),
  verifyToken: () => api.get('/auth/verify'),
};

// Content API
export const contentAPI = {
  getHomepage: () => api.get('/content/homepage'),
  getContentDetails: (type, id) => api.get(`/content/${type}/${id}`),
  getCategory: (category, params = {}) => api.get(`/content/category/${category}`, { params }),
  getGenres: (type) => api.get(`/content/genres/${type}`),
  discover: (type, filters = {}) => api.get(`/content/discover/${type}`, { params: filters }),
};

// Search API
export const searchAPI = {
  search: (query, params = {}) => api.get('/search', { params: { q: query, ...params } }),
  getSuggestions: (query) => api.get('/search/suggestions', { params: { q: query } }),
  getTrending: () => api.get('/search/trending'),
  advancedSearch: (data) => api.post('/search/advanced', data),
};

// User API
export const userAPI = {
  getWatchHistory: (params = {}) => api.get('/users/watch-history', { params }),
  addToWatchHistory: (data) => api.post('/users/watch-history', data),
  updateWatchProgress: (contentId, data) => api.put(`/users/watch-history/${contentId}`, data),
  clearWatchHistory: () => api.delete('/users/watch-history'),
  removeFromWatchHistory: (contentId) => api.delete(`/users/watch-history/${contentId}`),
  
  getFavorites: (params = {}) => api.get('/users/favorites', { params }),
  addToFavorites: (data) => api.post('/users/favorites', data),
  removeFromFavorites: (contentId) => api.delete(`/users/favorites/${contentId}`),
  checkFavorite: (contentId) => api.get(`/users/favorites/${contentId}`),
  
  getWatchlist: (params = {}) => api.get('/users/watchlist', { params }),
  addToWatchlist: (data) => api.post('/users/watchlist', data),
  removeFromWatchlist: (contentId) => api.delete(`/users/watchlist/${contentId}`),
  checkWatchlist: (contentId) => api.get(`/users/watchlist/${contentId}`),
  
  getStats: () => api.get('/users/stats'),
  getRecommendations: (params = {}) => api.get('/users/recommendations', { params }),
  exportData: () => api.get('/users/export'),
};

// Streaming API
export const streamAPI = {
  getSources: (type, id) => api.get(`/stream/${type}/${id}/sources`),
  getPlayer: (type, id, params = {}) => api.get(`/stream/${type}/${id}/player`, { params }),
  updateProgress: (type, id, data) => api.post(`/stream/${type}/${id}/progress`, data),
  getSubtitles: (type, id, params = {}) => api.get(`/stream/${type}/${id}/subtitles`, { params }),
  reportIssue: (type, id, data) => api.post(`/stream/${type}/${id}/report`, data),
  getStats: () => api.get('/stream/stats'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
  updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  
  getContent: (params = {}) => api.get('/admin/content', { params }),
  updateContentStatus: (contentId, data) => api.put(`/admin/content/${contentId}/status`, data),
  toggleFeatured: (contentId, data) => api.put(`/admin/content/${contentId}/featured`, data),
  
  getRadioStations: (params = {}) => api.get('/admin/radio-stations', { params }),
  addRadioStation: (data) => api.post('/admin/radio-stations', data),
  updateRadioStation: (stationId, data) => api.put(`/admin/radio-stations/${stationId}`, data),
  deleteRadioStation: (stationId) => api.delete(`/admin/radio-stations/${stationId}`),
  
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  clearCache: () => api.post('/admin/cache/clear'),
  exportData: (type) => api.get(`/admin/export/${type}`),
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error, fallbackMessage = 'Something went wrong') => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return fallbackMessage;
  },

  // Create query string from object
  createQueryString: (params) => {
    return new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value != null)
    ).toString();
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Check if request should be retried
  shouldRetry: (error, retryCount) => {
    if (retryCount >= 3) return false;
    
    // Retry on network errors or 5xx status codes
    return !error.response || error.response.status >= 500;
  },

  // Debounce function for search
  debounce: (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Cache management
  cache: {
    get: (key) => {
      try {
        const item = localStorage.getItem(`streamora_cache_${key}`);
        if (!item) return null;
        
        const parsed = JSON.parse(item);
        if (parsed.expiry && Date.now() > parsed.expiry) {
          localStorage.removeItem(`streamora_cache_${key}`);
          return null;
        }
        
        return parsed.data;
      } catch {
        return null;
      }
    },
    
    set: (key, data, ttl = 5 * 60 * 1000) => { // 5 minutes default
      try {
        const item = {
          data,
          expiry: Date.now() + ttl,
        };
        localStorage.setItem(`streamora_cache_${key}`, JSON.stringify(item));
      } catch (error) {
        console.warn('Failed to cache data:', error);
      }
    },
    
    remove: (key) => {
      localStorage.removeItem(`streamora_cache_${key}`);
    },
    
    clear: () => {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('streamora_cache_')
      );
      keys.forEach(key => localStorage.removeItem(key));
    },
  },
};

export default api;

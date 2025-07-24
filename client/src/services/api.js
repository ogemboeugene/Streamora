import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000, // Increased timeout to 35 seconds to accommodate backend timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Don't redirect to login for optional auth endpoints that return 401
    const isOptionalAuthEndpoint = [
      '/content/homepage',
      '/content/category/',
      '/content/discover/',
      '/content/genres/',
      '/search',
      '/auth/me'  // Don't redirect when checking current user without login
    ].some(endpoint => error.config?.url?.includes(endpoint));

    if (error.response?.status === 401 && !isOptionalAuthEndpoint) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  googleAuth: (token) => apiClient.post('/auth/google', { token }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  resendVerification: (email) => apiClient.post('/auth/resend-verification', { email }),
  updateProfile: (data) => apiClient.put('/user/profile', data),
};

// Content API
export const contentAPI = {
  getHomepage: () => apiClient.get('/content/homepage'),
  getContentDetails: (type, id) => apiClient.get(`/content/${type}/${id}`),
  getCategory: (category, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/content/category/${category}${queryString ? `?${queryString}` : ''}`);
  },
  getGenres: (type) => apiClient.get(`/content/genres/${type}`),
  discoverContent: (type, filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiClient.get(`/content/discover/${type}${queryString ? `?${queryString}` : ''}`);
  },
  getTrending: (timeWindow = 'day', page = 1) => 
    apiClient.get(`/content/category/trending?page=${page}&timeWindow=${timeWindow}`),
  getPopularMovies: (page = 1) => 
    apiClient.get(`/content/category/popular-movies?page=${page}`),
  getPopularTVShows: (page = 1) => 
    apiClient.get(`/content/category/popular-tv?page=${page}`),
  getTopRatedMovies: (page = 1) => 
    apiClient.get(`/content/category/top-rated-movies?page=${page}`),
  getTopRatedTVShows: (page = 1) => 
    apiClient.get(`/content/category/top-rated-tv?page=${page}`),
  getUpcomingMovies: (page = 1) => 
    apiClient.get(`/content/category/upcoming?page=${page}`),
  getNowPlayingMovies: (page = 1) => 
    apiClient.get(`/content/category/now-playing?page=${page}`),
  
  // New TMDB endpoints
  getTrendingPeople: (timeWindow = 'day', page = 1) => 
    apiClient.get(`/content/trending/people?timeWindow=${timeWindow}&page=${page}`),
  getTrendingMovies: (timeWindow = 'day', page = 1) => 
    apiClient.get(`/content/trending/movies?timeWindow=${timeWindow}&page=${page}`),
  getAiringTodayTV: (page = 1) => 
    apiClient.get(`/content/tv/airing-today?page=${page}`),
  
  // Person endpoints
  getPersonDetails: (personId) => apiClient.get(`/content/person/${personId}`),
  getPersonImages: (personId) => apiClient.get(`/content/person/${personId}/images`),
  
  // Episode groups and recommendations
  getTVEpisodeGroups: (seriesId) => apiClient.get(`/content/tv/${seriesId}/episode-groups`),
  getTVRecommendations: (seriesId, page = 1) => 
    apiClient.get(`/content/tv/${seriesId}/recommendations?page=${page}`),
  getMovieRecommendations: (movieId, page = 1) => 
    apiClient.get(`/content/movie/${movieId}/recommendations?page=${page}`),
  
  // Collections and translations
  getCollectionTranslations: (collectionId) => 
    apiClient.get(`/content/collection/${collectionId}/translations`),
  
  // Watch providers
  getMovieWatchProviders: (watchRegion = 'US') => 
    apiClient.get(`/content/watch-providers/movie?watchRegion=${watchRegion}`),
  getTVWatchProviders: (watchRegion = 'US') => 
    apiClient.get(`/content/watch-providers/tv?watchRegion=${watchRegion}`),
  getMovieWatchProvidersById: (movieId) => 
    apiClient.get(`/content/movie/${movieId}/watch-providers`),
  getTVWatchProvidersById: (tvId) => 
    apiClient.get(`/content/tv/${tvId}/watch-providers`),
  
  // Season details
  getTVSeasonDetails: (tvId, seasonNumber) => 
    apiClient.get(`/content/tv/${tvId}/season/${seasonNumber}`),
  
  // Genres
  getMovieGenres: () => apiClient.get('/content/genres/movie'),
  getTVGenres: () => apiClient.get('/content/genres/tv'),
  
  // Videos
  getMovieVideos: (movieId) => apiClient.get(`/content/movie/${movieId}/videos`),
  getTVVideos: (tvId) => apiClient.get(`/content/tv/${tvId}/videos`),
  
  // Similar content
  getSimilarMovies: (movieId, page = 1) => 
    apiClient.get(`/content/movie/${movieId}/similar?page=${page}`),
  getSimilarTVShows: (tvId, page = 1) => 
    apiClient.get(`/content/tv/${tvId}/similar?page=${page}`),
  
  // Alternative titles
  getMovieAlternativeTitles: (movieId, country) => {
    const params = country ? `?country=${country}` : '';
    return apiClient.get(`/content/movie/${movieId}/alternative-titles${params}`);
  },
  getTVAlternativeTitles: (tvId) => 
    apiClient.get(`/content/tv/${tvId}/alternative-titles`),
  
  // Network images
  getNetworkImages: (networkId) => 
    apiClient.get(`/content/network/${networkId}/images`),

  // TMDB Authentication
  createTMDBRequestToken: () => 
    apiClient.post('/content/tmdb/auth/request-token'),
  createTMDBSession: (username, password, requestToken) => 
    apiClient.post('/content/tmdb/auth/session', {
      username,
      password,
      request_token: requestToken
    }),
  createTMDBGuestSession: () => 
    apiClient.post('/content/tmdb/auth/guest-session'),
  deleteTMDBSession: (sessionId) => 
    apiClient.delete('/content/tmdb/auth/session', { data: { session_id: sessionId } }),

  // TMDB Account
  getTMDBAccountDetails: (sessionId) => 
    apiClient.get(`/content/tmdb/account?session_id=${sessionId}`),
  
  // TMDB Watchlist
  addToTMDBWatchlist: (accountId, sessionId, mediaType, mediaId, watchlist = true) => 
    apiClient.post(`/content/tmdb/account/${accountId}/watchlist`, {
      session_id: sessionId,
      media_type: mediaType,
      media_id: mediaId,
      watchlist: watchlist
    }),
  getTMDBWatchlistMovies: (accountId, sessionId, page = 1, sortBy = 'created_at.asc') => 
    apiClient.get(`/content/tmdb/account/${accountId}/watchlist/movies?session_id=${sessionId}&page=${page}&sort_by=${sortBy}`),
  getTMDBWatchlistTV: (accountId, sessionId, page = 1, sortBy = 'created_at.asc') => 
    apiClient.get(`/content/tmdb/account/${accountId}/watchlist/tv?session_id=${sessionId}&page=${page}&sort_by=${sortBy}`),

  // TMDB Favorites
  addToTMDBFavorites: (accountId, sessionId, mediaType, mediaId, favorite = true) => 
    apiClient.post(`/content/tmdb/account/${accountId}/favorite`, {
      session_id: sessionId,
      media_type: mediaType,
      media_id: mediaId,
      favorite: favorite
    }),
  getTMDBFavoriteMovies: (accountId, sessionId, page = 1, sortBy = 'created_at.asc') => 
    apiClient.get(`/content/tmdb/account/${accountId}/favorite/movies?session_id=${sessionId}&page=${page}&sort_by=${sortBy}`),
  getTMDBFavoriteTV: (accountId, sessionId, page = 1, sortBy = 'created_at.asc') => 
    apiClient.get(`/content/tmdb/account/${accountId}/favorite/tv?session_id=${sessionId}&page=${page}&sort_by=${sortBy}`),

  // TMDB Ratings
  getTMDBRatedMovies: (accountId, sessionId, page = 1, sortBy = 'created_at.asc') => 
    apiClient.get(`/content/tmdb/account/${accountId}/rated/movies?session_id=${sessionId}&page=${page}&sort_by=${sortBy}`),
  getTMDBRatedTV: (accountId, sessionId, page = 1, sortBy = 'created_at.asc') => 
    apiClient.get(`/content/tmdb/account/${accountId}/rated/tv?session_id=${sessionId}&page=${page}&sort_by=${sortBy}`),
  rateTMDBMovie: (movieId, sessionId, rating) => 
    apiClient.post(`/content/movie/${movieId}/rating`, {
      session_id: sessionId,
      rating: rating
    }),
  rateTMDBTV: (tvId, sessionId, rating) => 
    apiClient.post(`/content/tv/${tvId}/rating`, {
      session_id: sessionId,
      rating: rating
    }),
  deleteTMDBMovieRating: (movieId, sessionId) => 
    apiClient.delete(`/content/movie/${movieId}/rating`, {
      data: { session_id: sessionId }
    }),
  deleteTMDBTVRating: (tvId, sessionId) => 
    apiClient.delete(`/content/tv/${tvId}/rating`, {
      data: { session_id: sessionId }
    }),
};

// Search API
export const searchAPI = {
  searchContent: (query, params = {}) => {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return apiClient.get(`/search?${searchParams.toString()}`);
  },
  getSearchSuggestions: (query) => 
    apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`),
  getPopularSearches: () => apiClient.get('/search/popular'),
};

// User API
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  changePassword: (passwords) => apiClient.put('/user/change-password', passwords),
  deleteAccount: () => apiClient.delete('/user/account'),
  
  // Watchlist
  getWatchlist: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/user/watchlist${queryString ? `?${queryString}` : ''}`);
  },
  addToWatchlist: (contentData) => 
    apiClient.post('/user/watchlist', contentData),
  removeFromWatchlist: (contentId) => 
    apiClient.delete(`/user/watchlist/${contentId}`),
  
  // Watch History
  getWatchHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/user/watch-history${queryString ? `?${queryString}` : ''}`);
  },
  addToWatchHistory: (contentData) => 
    apiClient.post('/user/watch-history', contentData),
  updateWatchProgress: (contentId, progress) => 
    apiClient.put(`/user/watch-history/${contentId}`, progress),
  clearWatchHistory: () => apiClient.delete('/user/watch-history'),
  
  // Favorites
  getFavorites: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/user/favorites${queryString ? `?${queryString}` : ''}`);
  },
  addToFavorites: (contentData) => 
    apiClient.post('/user/favorites', contentData),
  removeFromFavorites: (contentId) => 
    apiClient.delete(`/user/favorites/${contentId}`),
  
  // Ratings (new endpoints)
  getRatings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/user/ratings${queryString ? `?${queryString}` : ''}`);
  },
  addRating: (ratingData) => 
    apiClient.post('/user/ratings', ratingData),
  removeRating: (contentId) => 
    apiClient.delete(`/user/ratings/${contentId}`),
  getUserRating: (contentId) => 
    apiClient.get(`/user/ratings/${contentId}`),
  
  // Custom Lists (new endpoints)
  getCustomLists: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/user/lists${queryString ? `?${queryString}` : ''}`);
  },
  createCustomList: (listData) => 
    apiClient.post('/user/lists', listData),
  updateCustomList: (listId, updateData) => 
    apiClient.put(`/user/lists/${listId}`, updateData),
  deleteCustomList: (listId) => 
    apiClient.delete(`/user/lists/${listId}`),
  getCustomListDetails: (listId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/user/lists/${listId}${queryString ? `?${queryString}` : ''}`);
  },
  addToCustomList: (listId, contentData) => 
    apiClient.post(`/user/lists/${listId}/items`, contentData),
  removeFromCustomList: (listId, contentId) => 
    apiClient.delete(`/user/lists/${listId}/items/${contentId}`),
  
  // User Stats (new endpoint)
  getUserStats: () => apiClient.get('/user/stats'),
  
  // Export Data (new endpoint)
  exportUserData: () => apiClient.get('/user/export'),
  
  // Recommendations
  getRecommendations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/user/recommendations${queryString ? `?${queryString}` : ''}`);
  },
};

// Radio API
export const radioAPI = {
  getStations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/content/category/radio${queryString ? `?${queryString}` : ''}`);
  },
  getStationDetails: (id) => apiClient.get(`/content/radio/${id}`),
  getFeaturedStations: () => apiClient.get('/content/category/radio?featured=true'),
  getStationsByGenre: (genre) => apiClient.get(`/content/category/radio?genre=${genre}`),
  getStationsByCountry: (country) => apiClient.get(`/content/category/radio?country=${country}`),
  getStreamUrl: (stationUuid) => apiClient.get(`/content/radio/${stationUuid}/stream`),
  clickStation: (stationUuid) => apiClient.post(`/content/radio/${stationUuid}/click`),
  getRadioHealth: () => apiClient.get('/content/radio/health'),
};

// Streaming API
export const streamingAPI = {
  getStreamingInfo: (contentId, contentType) => 
    apiClient.get(`/stream/${contentType}/${contentId}`),
  reportPlaybackError: (contentId, contentType, error) => 
    apiClient.post('/stream/error', { contentId, contentType, error }),
  updatePlaybackStats: (contentId, contentType, stats) => 
    apiClient.post('/stream/stats', { contentId, contentType, stats }),
};

// Admin API (for authenticated admin users)
export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/stats'),
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  
  getContent: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/content${queryString ? `?${queryString}` : ''}`);
  },
  addContent: (data) => apiClient.post('/admin/content', data),
  updateContent: (id, data) => apiClient.put(`/admin/content/${id}`, data),
  deleteContent: (id) => apiClient.delete(`/admin/content/${id}`),
  
  getReports: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/reports${queryString ? `?${queryString}` : ''}`);
  },
  handleReport: (id, action) => apiClient.put(`/admin/reports/${id}`, { action }),
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

// Utility function to build query string
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

export default apiClient;

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import SEOHead from '../components/UI/SEOHead';
import { MovieGrid } from '../components/Content/MovieCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { contentAPI } from '../services/api';

const TVShows = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    sortBy: searchParams.get('sort') || 'popularity.desc',
    withGenres: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    voteAverageGte: searchParams.get('minRating') || '',
    voteAverageLte: searchParams.get('maxRating') || ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({});

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'first_air_date.desc', label: 'Newest First' },
    { value: 'first_air_date.asc', label: 'Oldest First' },
    { value: 'name.asc', label: 'A-Z' },
    { value: 'name.desc', label: 'Z-A' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchShows();
  }, [filters, fetchShows]);

  const fetchGenres = async () => {
    try {
      const response = await contentAPI.getGenres('tv');
      setGenres(response.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchShows = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await contentAPI.discoverContent('tv', filters);
      setShows(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError('Failed to load TV shows. Please try again.');
      console.error('Error fetching TV shows:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key === 'sortBy' ? 'sort' : 
                  key === 'withGenres' ? 'genre' :
                  key === 'voteAverageGte' ? 'minRating' :
                  key === 'voteAverageLte' ? 'maxRating' : key, value);
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const defaultFilters = {
      page: 1,
      sortBy: 'popularity.desc',
      withGenres: '',
      year: '',
      voteAverageGte: '',
      voteAverageLte: ''
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  return (
    <Layout>
      <SEOHead
        title="TV Shows - Stream Free Episodes Online"
        description="Watch thousands of free TV shows and episodes online. From popular series to hidden gems, stream your favorite shows without subscription."
        keywords="free TV shows, episodes, streaming, watch online, series, television"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        {/* Header */}
        <div className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  TV Shows
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Discover thousands of free TV shows and episodes
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    showFilters
                      ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-300 dark:hover:bg-dark-600'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 p-6 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => updateFilters({ sortBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Genre
                    </label>
                    <select
                      value={filters.withGenres}
                      onChange={(e) => updateFilters({ withGenres: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Genres</option>
                      {genres.map(genre => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year
                    </label>
                    <select
                      value={filters.year}
                      onChange={(e) => updateFilters({ year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Years</option>
                      {years.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Rating
                    </label>
                    <select
                      value={filters.voteAverageGte}
                      onChange={(e) => updateFilters({ voteAverageGte: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Any Rating</option>
                      <option value="9">9+ Stars</option>
                      <option value="8">8+ Stars</option>
                      <option value="7">7+ Stars</option>
                      <option value="6">6+ Stars</option>
                      <option value="5">5+ Stars</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-96">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-4">{error}</div>
              <button
                onClick={fetchShows}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : shows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No TV shows found with current filters
              </div>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Results Info */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {pagination.totalResults && (
                    <>Showing {shows.length} of {pagination.totalResults.toLocaleString()} TV shows</>
                  )}
                </p>
                
                {pagination.totalPages > 1 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                )}
              </div>

              {/* TV Shows Grid */}
              <MovieGrid
                movies={shows}
                size={viewMode === 'grid' ? 'medium' : 'large'}
                layout={viewMode}
                loading={false}
                emptyMessage="No TV shows found"
              />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = Math.max(1, pagination.currentPage - 2) + i;
                      if (page > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            page === pagination.currentPage
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TVShows;

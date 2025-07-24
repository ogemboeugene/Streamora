import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid, List } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import SEOHead from '../components/UI/SEOHead';
import { MovieGrid } from '../components/Content/MovieCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { searchAPI } from '../services/api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'multi';
  const page = parseInt(searchParams.get('page')) || 1;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState(query);
  const [activeFilter, setActiveFilter] = useState(type);
  const [viewMode, setViewMode] = useState('grid');

  const filterOptions = [
    { value: 'multi', label: 'All' },
    { value: 'movie', label: 'Movies' },
    { value: 'tv', label: 'TV Shows' },
    { value: 'person', label: 'People' }
  ];

  const performSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await searchAPI.searchContent(query, {
        type: type === 'multi' ? '' : type,
        page
      });

      // Ensure we have an array of results
      const resultsData = response.data?.results || response.results || response.data || [];
      const processedResults = Array.isArray(resultsData) ? resultsData : [];
      
      setResults(processedResults);
      setTotalResults(response.totalResults || response.total_results || processedResults.length);
      setTotalPages(response.totalPages || response.total_pages || 1);
    } catch (error) {
      setError('Failed to search. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [query, type, page]);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, performSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams();
    params.set('q', searchQuery);
    if (activeFilter !== 'multi') {
      params.set('type', activeFilter);
    }
    window.location.href = `/search?${params.toString()}`;
  };

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    const params = new URLSearchParams();
    params.set('q', query);
    if (newFilter !== 'multi') {
      params.set('type', newFilter);
    }
    window.location.href = `/search?${params.toString()}`;
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams();
    params.set('q', query);
    if (type !== 'multi') {
      params.set('type', type);
    }
    params.set('page', newPage);
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <Layout>
      <SEOHead
        title={query ? `Search Results for "${query}"` : 'Search - Streamora'}
        description={query ? `Search results for "${query}" on Streamora. Find movies, TV shows, and more.` : 'Search for movies, TV shows, and more on Streamora.'}
        keywords={`search, ${query}, movies, TV shows, streaming`}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        {/* Search Header */}
        <div className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for movies, TV shows, people..."
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                />
                {searchQuery && (
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <div className="bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700 transition-colors">
                      <Search className="h-4 w-4" />
                    </div>
                  </button>
                )}
              </div>
            </form>

            {/* Filters and View Options */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                {query && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>Search results for</span>
                    <span className="font-semibold text-gray-900 dark:text-white">"{query}"</span>
                    {totalResults > 0 && (
                      <span>({totalResults.toLocaleString()} results)</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Filter Tabs */}
                <div className="flex items-center bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeFilter === option.value
                          ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

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
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!query ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Search for Content
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Find your favorite movies, TV shows, and discover new content to watch.
              </p>

              {/* Popular Searches */}
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Popular Searches
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'Marvel', 'DC', 'Action', 'Comedy', 'Drama', 'Horror',
                    'Sci-Fi', 'Thriller', 'Romance', 'Animation'
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        const params = new URLSearchParams();
                        params.set('q', term);
                        window.location.href = `/search?${params.toString()}`;
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center min-h-96">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-4">{error}</div>
              <button
                onClick={performSearch}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Results Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                We couldn't find any results for "{query}". Try adjusting your search terms.
              </p>

              {/* Search Suggestions */}
              <div className="max-w-md mx-auto text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                  Search Tips
                </h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Check your spelling</li>
                  <li>• Try different keywords</li>
                  <li>• Use more general terms</li>
                  <li>• Try searching for actors or directors</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Results Grid */}
              <MovieGrid
                movies={results}
                size={viewMode === 'grid' ? 'medium' : 'large'}
                layout={viewMode}
                loading={false}
                emptyMessage="No results found"
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, page - 2) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            pageNum === page
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
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

export default SearchResults;

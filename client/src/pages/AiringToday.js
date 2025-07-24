import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Star, Play } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import SEOHead from '../components/UI/SEOHead';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import MovieGrid from '../components/Content/MovieGrid';
import { contentAPI } from '../services/api';

const AiringToday = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAiringToday = useCallback(async () => {
    setLoading(true);
    try {
      const response = await contentAPI.getAiringTodayTV(currentPage);
      setShows(response.data.results || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Error fetching airing today shows:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchAiringToday();
  }, [fetchAiringToday]);

  const transformShowsForGrid = (shows) => {
    return shows.map(show => ({
      id: show.id,
      title: show.name,
      poster: show.poster_path 
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : '/images/placeholder-poster.jpg',
      type: 'tv',
      rating: show.vote_average,
      year: new Date(show.first_air_date).getFullYear(),
      overview: show.overview
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <SEOHead
        title="Airing Today - Streamora"
        description="Discover TV shows airing today. Stay up to date with the latest episodes and new releases."
        keywords="airing today, tv shows, new episodes, television, streaming"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <Calendar className="inline-block w-8 h-8 mr-3 text-primary-600" />
              Airing Today
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              TV shows with new episodes airing today
            </p>
          </div>

          {/* Featured Show */}
          {shows.length > 0 && (
            <div className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-r from-primary-900 to-purple-900">
              <div className="absolute inset-0">
                <img
                  src={shows[0].backdrop_path 
                    ? `https://image.tmdb.org/t/p/w1280${shows[0].backdrop_path}`
                    : '/images/placeholder-backdrop.jpg'
                  }
                  alt={shows[0].name}
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              </div>
              
              <div className="relative p-8 md:p-12">
                <div className="max-w-2xl">
                  <div className="flex items-center text-white/90 mb-4">
                    <Play className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Featured Show</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {shows[0].name}
                  </h2>
                  
                  <div className="flex items-center text-white/90 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-2" />
                    <span className="font-medium">{shows[0].vote_average.toFixed(1)}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{new Date(shows[0].first_air_date).getFullYear()}</span>
                  </div>
                  
                  <p className="text-white/90 text-lg leading-relaxed mb-6 line-clamp-3">
                    {shows[0].overview}
                  </p>
                  
                  <button
                    onClick={() => window.location.href = `/tv/${shows[0].id}`}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5 inline mr-2" />
                    Watch Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shows Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  All Shows Airing Today
                </h2>
                <MovieGrid
                  movies={transformShowsForGrid(shows)}
                  size="medium"
                  loading={false}
                  emptyMessage="No shows airing today"
                />
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const page = currentPage - 2 + index;
                      if (page < 1 || page > totalPages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-500 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AiringToday;

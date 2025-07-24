import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import SEOHead from '../components/UI/SEOHead';
import MovieGrid from '../components/Content/MovieGrid';
import TMDBLogin from '../components/Auth/TMDBLogin';
import { useTMDB } from '../contexts/TMDBContext';
import { Film, Tv, Bookmark } from 'lucide-react';

const TMDBWatchlist = () => {
  const { isAuthenticated, tmdbAccount, getWatchlist } = useTMDB();
  const [movies, setMovies] = useState([]);
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('movies');
  const [showTMDBLogin, setShowTMDBLogin] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both movies and TV shows in parallel
      const [moviesResponse, tvResponse] = await Promise.all([
        getWatchlist('movie'),
        getWatchlist('tv')
      ]);

      if (moviesResponse.success) {
        const transformedMovies = moviesResponse.data.results?.map(movie => ({
          id: movie.id,
          tmdbId: movie.id.toString(),
          title: movie.title,
          type: 'movie',
          overview: movie.overview,
          releaseDate: movie.release_date,
          rating: movie.vote_average,
          poster: {
            url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
          },
          backdrop: {
            url: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null
          }
        })) || [];
        setMovies(transformedMovies);
      }

      if (tvResponse.success) {
        const transformedTVShows = tvResponse.data.results?.map(show => ({
          id: show.id,
          tmdbId: show.id.toString(),
          title: show.name,
          type: 'tv',
          overview: show.overview,
          releaseDate: show.first_air_date,
          rating: show.vote_average,
          poster: {
            url: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null
          },
          backdrop: {
            url: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null
          }
        })) || [];
        setTVShows(transformedTVShows);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setError('Failed to load watchlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getWatchlist]);

  useEffect(() => {
    if (isAuthenticated && tmdbAccount?.id) {
      fetchWatchlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, tmdbAccount, fetchWatchlist]);

  if (!isAuthenticated || !tmdbAccount?.id) {
    return (
      <Layout>
        <SEOHead 
          title="TMDB Watchlist"
          description="Your TMDB watchlist"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              TMDB Account Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Connect your TMDB account to view and manage your watchlist.
            </p>
            <button
              onClick={() => setShowTMDBLogin(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Connect TMDB Account
            </button>
          </div>
        </div>

        {showTMDBLogin && (
          <TMDBLogin onClose={() => setShowTMDBLogin(false)} />
        )}
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error Loading Watchlist
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error}
            </p>
            <button
              onClick={fetchWatchlist}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentContent = activeTab === 'movies' ? movies : tvShows;

  return (
    <Layout>
      <SEOHead 
        title="TMDB Watchlist"
        description="Your TMDB watchlist"
      />

      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Bookmark className="w-8 h-8 mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold">
              TMDB Watchlist
            </h1>
          </div>
          <p className="text-xl text-primary-100 max-w-3xl">
            Welcome back, {tmdbAccount.name || tmdbAccount.username}! Here's your TMDB watchlist.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-dark-700 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'movies', label: 'Movies', icon: Film, count: movies.length },
              { id: 'tv', label: 'TV Shows', icon: Tv, count: tvShows.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
                <span className="ml-2 bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Grid */}
        {currentContent.length > 0 ? (
          <MovieGrid
            movies={currentContent}
            size="medium"
            loading={false}
            emptyMessage={`No ${activeTab === 'movies' ? 'movies' : 'TV shows'} in your TMDB watchlist`}
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              {activeTab === 'movies' ? <Film className="w-16 h-16 mx-auto" /> : <Tv className="w-16 h-16 mx-auto" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {activeTab === 'movies' ? 'movies' : 'TV shows'} in your watchlist
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding {activeTab === 'movies' ? 'movies' : 'TV shows'} to your TMDB watchlist to see them here.
            </p>
            <Link
              to={activeTab === 'movies' ? '/movies' : '/tv'}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse {activeTab === 'movies' ? 'Movies' : 'TV Shows'}
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TMDBWatchlist;

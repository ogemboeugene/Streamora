import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout/Layout';
import MovieGrid from '../components/Content/MovieGrid';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';

const Watchlist = () => {
  const { user } = useAuth();
  const { watchlist, isLoading, loadUserData } = useUserData();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <Helmet>
          <title>Watchlist - Streamora</title>
          <meta name="description" content="Your personal watchlist on Streamora" />
        </Helmet>
        
        <div className="min-h-screen bg-white dark:bg-dark-900">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Watchlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Please log in to view your watchlist
              </p>
              <a
                href="/login"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Log In
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>My Watchlist - Streamora</title>
        <meta name="description" content="Your personal watchlist on Streamora" />
      </Helmet>
      
      <div className="min-h-screen bg-white dark:bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Watchlist
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {watchlist.length > 0 
                ? `${watchlist.length} item${watchlist.length !== 1 ? 's' : ''} in your watchlist`
                : 'Your watchlist is empty'
              }
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : watchlist.length > 0 ? (
            <MovieGrid 
              content={watchlist} 
              title=""
              showPagination={false}
            />
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg 
                    className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Your watchlist is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start adding movies and TV shows to build your personal watchlist.
                </p>
                <a
                  href="/movies"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-4"
                >
                  Browse Movies
                </a>
                <a
                  href="/tv-shows"
                  className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse TV Shows
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Watchlist;

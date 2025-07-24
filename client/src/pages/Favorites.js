import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout/Layout';
import MovieGrid from '../components/Content/MovieGrid';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';

const Favorites = () => {
  const { user } = useAuth();
  const { favorites, isLoading, loadUserData } = useUserData();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  if (!user) {
    return (
      <Layout>
        <Helmet>
          <title>Favorites - Streamora</title>
          <meta name="description" content="Your favorite movies and TV shows on Streamora" />
        </Helmet>
        
        <div className="min-h-screen bg-white dark:bg-dark-900">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Favorites
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Please log in to view your favorites
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
        <title>My Favorites - Streamora</title>
        <meta name="description" content="Your favorite movies and TV shows on Streamora" />
      </Helmet>
      
      <div className="min-h-screen bg-white dark:bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {favorites.length > 0 
                ? `${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`
                : 'No favorites yet'
              }
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : favorites.length > 0 ? (
            <MovieGrid 
              content={favorites} 
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No favorites yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Mark movies and TV shows as favorites to see them here.
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

export default Favorites;

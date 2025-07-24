import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import SEOHead from '../components/UI/SEOHead';
import { contentAPI } from '../services/api';

const Genres = () => {
  const [movieGenres, setMovieGenres] = useState([]);
  const [tvGenres, setTVGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('movies');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        setError(null);

        const [movieResponse, tvResponse] = await Promise.all([
          contentAPI.getMovieGenres(),
          contentAPI.getTVGenres()
        ]);

        setMovieGenres(movieResponse.data.genres || []);
        setTVGenres(tvResponse.data.genres || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
        setError('Failed to load genres. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const currentGenres = activeTab === 'movies' ? movieGenres : tvGenres;

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
              Error Loading Genres
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title="Browse by Genre"
        description="Discover movies and TV shows by genre"
      />

      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Browse by Genre
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Discover content that matches your interests
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-dark-700 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'movies', label: 'Movies' },
              { id: 'tv', label: 'TV Shows' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentGenres.map((genre) => (
            <Link
              key={genre.id}
              to={`/${activeTab === 'movies' ? 'movies' : 'tv'}?genre=${genre.id}`}
              className="group bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 p-6"
            >
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {genre.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {currentGenres.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No genres available at the moment.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Genres;

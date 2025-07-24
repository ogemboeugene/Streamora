import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar, Star } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import SEOHead from '../components/UI/SEOHead';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import MovieGrid from '../components/Content/MovieGrid';
import { contentAPI } from '../services/api';

const Trending = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [timeWindow, setTimeWindow] = useState('day');
  const [loading, setLoading] = useState(true);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingPeople, setTrendingPeople] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { id: 'movies', label: 'Movies & TV', icon: TrendingUp },
    { id: 'people', label: 'People', icon: Star }
  ];

  const timeWindows = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' }
  ];

  const fetchTrendingData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'movies') {
        const response = await contentAPI.getTrendingMovies(timeWindow, currentPage);
        setTrendingMovies(response.data.results || []);
      } else {
        const response = await contentAPI.getTrendingPeople(timeWindow, currentPage);
        setTrendingPeople(response.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, timeWindow, currentPage]);

  useEffect(() => {
    fetchTrendingData();
  }, [fetchTrendingData]);

  const transformMoviesForGrid = (movies) => {
    return movies.map(item => ({
      id: item.id,
      title: item.title || item.name,
      poster: item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : '/images/placeholder-poster.jpg',
      type: item.media_type || (item.title ? 'movie' : 'tv'),
      rating: item.vote_average,
      year: new Date(item.release_date || item.first_air_date).getFullYear()
    }));
  };

  return (
    <Layout>
      <SEOHead
        title="Trending - Streamora"
        description="Discover what's trending on Streamora. Browse the most popular movies, TV shows, and people."
        keywords="trending, popular movies, trending shows, celebrities, entertainment"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <TrendingUp className="inline-block w-8 h-8 mr-3 text-primary-600" />
              Trending Now
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover what everyone's watching and talking about
            </p>
          </div>

          {/* Time Window Selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-white dark:bg-dark-800 rounded-lg p-1 shadow-sm">
              {timeWindows.map((window) => (
                <button
                  key={window.id}
                  onClick={() => setTimeWindow(window.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeWindow === window.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {window.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-dark-700 mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div>
              {activeTab === 'movies' ? (
                <MovieGrid
                  movies={transformMoviesForGrid(trendingMovies)}
                  size="medium"
                  loading={false}
                  emptyMessage="No trending content available"
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {trendingPeople.map((person) => (
                    <Link
                      key={person.id}
                      to={`/person/${person.id}`}
                      className="group bg-white dark:bg-dark-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={person.profile_path 
                            ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                            : '/images/placeholder-person.svg'
                          }
                          alt={person.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-person.svg';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {person.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {person.known_for_department}
                        </p>
                        {person.known_for?.length > 0 && (
                          <p className="text-gray-500 dark:text-gray-500 text-xs mt-2 line-clamp-2">
                            Known for: {person.known_for.slice(0, 2).map(item => item.title || item.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Trending;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Star, Calendar, ArrowRight, Film, Radio, Tv, Heart, Clock, User } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import SEOHead from '../components/UI/SEOHead';
import { MovieGrid } from '../components/Content/MovieCard';
import { LoginReminderTrigger } from '../components/UI/LoginReminder';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { contentAPI } from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  // Auto-rotate hero slides
  useEffect(() => {
    if (homepageData?.hero?.length > 1) {
      const interval = setInterval(() => {
        setCurrentHero((prev) => (prev + 1) % homepageData.hero.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [homepageData]);

  const fetchHomepageData = async () => {
    try {
      const response = await contentAPI.getHomepage();
      setHomepageData(response.data);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      setError('Failed to load content. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchNow = (movie) => {
    // In a real app, this would check permissions and redirect appropriately
    window.location.href = `/watch/${movie.type}/${movie.id}`;
  };

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
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={fetchHomepageData}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  const currentMovie = homepageData?.hero?.[currentHero];
  const trendingSection = homepageData?.sections?.find(section => section.type === 'trending');
  const moviesSection = homepageData?.sections?.find(section => section.type === 'movies');
  const tvSection = homepageData?.sections?.find(section => section.type === 'tv');
  const continueSection = homepageData?.sections?.find(section => section.type === 'continue');

  return (
    <LoginReminderTrigger contentType="movie" watchTime={60000}>
      <Layout>
        <SEOHead
          title="Free Movies & TV Shows Streaming"
          description="Watch thousands of free movies, TV shows, and live radio stations on Streamora. No subscription required. Stream in HD quality."
          keywords="free movies, TV shows, streaming, online, HD, no subscription"
        />

        {/* Hero Section */}
        {currentMovie && (
          <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
            <div className="absolute inset-0">
              {homepageData.hero.map((movie, index) => (
                <div
                  key={movie.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentHero ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={movie.backdrop || '/images/hero-fallback.jpg'}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/hero-fallback.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                </div>
              ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="max-w-2xl">
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-600 text-white">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Trending Now
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {currentMovie.title}
                </h1>

                <div className="flex items-center space-x-4 mb-4 text-white/90">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-semibold">{currentMovie.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-1" />
                    <span>{new Date(currentMovie.releaseDate).getFullYear()}</span>
                  </div>
                  <div className="px-2 py-1 bg-white/20 rounded text-sm">
                    {currentMovie.type === 'tv' ? 'TV Show' : 'Movie'}
                  </div>
                </div>

                <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-xl line-clamp-3">
                  {currentMovie.overview}
                </p>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleWatchNow(currentMovie)}
                    className="flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5 mr-2 fill-white" />
                    Watch Now
                  </button>
                  <Link
                    to={`/${currentMovie.type}/${currentMovie.id}`}
                    className="flex items-center px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors backdrop-blur-sm"
                  >
                    More Info
                  </Link>
                </div>
              </div>
            </div>

            {/* Hero Navigation Dots */}
            {homepageData.hero.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {homepageData.hero.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHero(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentHero ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* User Dashboard Section - Show when logged in */}
        {user && (
          <section className="py-8 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-dark-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user.name || user.username}! 👋
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Ready to continue your streaming journey?
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Signed in</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-dark-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {user.stats?.watchlistCount || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    In Watchlist
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {user.stats?.favoritesCount || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Favorites
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user.stats?.watchTimeHours || 0}h
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Watch Time
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {user.stats?.ratingsCount || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Ratings Given
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/watchlist"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  My Watchlist
                </Link>
                <Link
                  to="/watch-history"
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Continue Watching
                </Link>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Quick Access Cards */}
        <section className="py-12 bg-gray-50 dark:bg-dark-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/movies"
                className="group p-6 bg-white dark:bg-dark-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
                    <Film className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      Movies
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Thousands of HD movies
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-primary-600 font-medium">
                  <span>Explore Movies</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/tv-shows"
                className="group p-6 bg-white dark:bg-dark-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-4">
                    <Tv className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      TV Shows
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Popular series & episodes
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-primary-600 font-medium">
                  <span>Browse Shows</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/radio"
                className="group p-6 bg-white dark:bg-dark-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-4">
                    <Radio className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      Live Radio
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Global radio stations
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-primary-600 font-medium">
                  <span>Listen Live</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Continue Watching (for logged in users) */}
        {user && continueSection && continueSection.items.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Continue Watching
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pick up where you left off
                  </p>
                </div>
                <Link
                  to="/history"
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <MovieGrid
                movies={continueSection.items}
                size="medium"
                loading={false}
                emptyMessage="No continue watching items"
                showProgress={true}
              />
            </div>
          </section>
        )}

        {/* Trending Content */}
        {trendingSection && trendingSection.items.length > 0 && (
          <section className={`py-16 ${user && continueSection?.items.length > 0 ? 'bg-gray-50 dark:bg-dark-800' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Trending Now
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    What everyone is watching
                  </p>
                </div>
                <Link
                  to="/search?q=trending"
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <MovieGrid
                movies={trendingSection.items.slice(0, 12)}
                size="medium"
                loading={false}
                emptyMessage="No trending content available"
              />
            </div>
          </section>
        )}

        {/* Popular Movies */}
        {moviesSection && moviesSection.items.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Popular Movies
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Most watched movies right now
                  </p>
                </div>
                <Link
                  to="/movies?sort=popularity.desc"
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <MovieGrid
                movies={moviesSection.items.slice(0, 12)}
                size="medium"
                loading={false}
                emptyMessage="No movies available"
              />
            </div>
          </section>
        )}

        {/* Popular TV Shows */}
        {tvSection && tvSection.items.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-dark-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Popular TV Shows
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Binge-worthy series everyone loves
                  </p>
                </div>
                <Link
                  to="/tv-shows?sort=popularity.desc"
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <MovieGrid
                movies={tvSection.items.slice(0, 12)}
                size="medium"
                loading={false}
                emptyMessage="No TV shows available"
              />
            </div>
          </section>
        )}

        {/* Call to Action for Non-Users */}
        {!user && (
          <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Watching?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Create your free account to unlock personalized recommendations, 
                watchlists, and exclusive content.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </section>
        )}
      </Layout>
    </LoginReminderTrigger>
  );
};

export default Home;

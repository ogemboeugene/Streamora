import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Star, Calendar, Eye, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { toast } from 'react-hot-toast';

const MovieCard = ({ 
  movie, 
  size = 'medium', 
  showOverlay = true, 
  showInfo = true,
  className = '' 
}) => {
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserData();
  const [isLoading, setIsLoading] = React.useState(false);

  const sizes = {
    small: 'w-28 h-42 sm:w-32 sm:h-48',
    medium: 'w-40 h-60 sm:w-48 sm:h-72',
    large: 'w-52 h-78 sm:w-64 sm:h-96'
  };

  const cardSize = sizes[size] || sizes.medium;

  // Check if this content is in the user's watchlist
  const inWatchlist = movie ? isInWatchlist(movie.id) : false;

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to manage your watchlist');
      return;
    }

    if (!movie || !movie.id) {
      toast.error('Invalid content');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare content data for the API
      const contentData = {
        contentId: movie.id,
        contentType: movie.type || 'movie',
        title: movie.title,
        poster: movie.poster,
        overview: movie.overview,
        releaseDate: movie.releaseDate || movie.first_air_date,
        rating: movie.vote_average || movie.rating,
        genres: movie.genres,
        runtime: movie.runtime,
        language: movie.original_language
      };

      if (inWatchlist) {
        await removeFromWatchlist(movie.id);
      } else {
        await addToWatchlist(contentData);
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRating = (rating) => {
    return rating ? parseFloat(rating).toFixed(1) : 'N/A';
  };

  const formatYear = (date) => {
    return date ? new Date(date).getFullYear() : 'TBA';
  };

  if (!movie) return null;

  return (
    <div className={`group relative rounded-lg overflow-hidden bg-white dark:bg-dark-800 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}>
      <Link to={`/${movie.type || 'movie'}/${movie.id}`} className="block"
            onClick={(e) => {
              // Prevent navigation if type is undefined or invalid
              const validTypes = ['movie', 'tv', 'radio'];
              if (!movie.type || !validTypes.includes(movie.type)) {
                e.preventDefault();
                toast.error('Content not available');
                return false;
              }
            }}
      >
        {/* Movie Poster */}
        <div className={`relative ${cardSize} bg-gray-200 dark:bg-dark-700`}>
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.src = '/images/placeholder-poster.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-dark-600 dark:to-dark-700">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Play className="w-12 h-12 mx-auto mb-2" />
                <span className="text-sm">No Image</span>
              </div>
            </div>
          )}

          {/* Quality Badge */}
          {movie.quality && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded">
              {movie.quality}
            </div>
          )}

          {/* Rating Badge */}
          {movie.rating && (
            <div className="absolute top-2 right-2 flex items-center px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              {formatRating(movie.rating)}
            </div>
          )}

          {/* Progress Bar (for continue watching) */}
          {movie.progress && movie.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div 
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${Math.min(movie.progress, 100)}%` }}
              />
            </div>
          )}

          {/* Overlay */}
          {showOverlay && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  <p className="text-white font-medium text-sm">Watch Now</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={handleWatchlistToggle}
                  disabled={isLoading}
                  className={`p-2 rounded-full transition-colors ${
                    inWatchlist
                      ? 'bg-red-600 text-white'
                      : 'bg-white/90 text-gray-900 hover:bg-white'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  {inWatchlist ? (
                    <Heart className="w-4 h-4 fill-current" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Movie Info */}
        {showInfo && (
          <div className="p-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
              {movie.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatYear(movie.releaseDate)}
              </div>
              {movie.views && (
                <div className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {movie.views.toLocaleString()}
                </div>
              )}
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {movie.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                  >
                    {genre}
                  </span>
                ))}
                {movie.genres.length > 2 && (
                  <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                    +{movie.genres.length - 2}
                  </span>
                )}
              </div>
            )}

            {size === 'large' && movie.overview && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                {movie.overview}
              </p>
            )}
          </div>
        )}
      </Link>
    </div>
  );
};

// Grid component for displaying multiple movie cards
export const MovieGrid = ({ 
  movies, 
  size = 'medium', 
  columns = 'auto',
  className = '',
  loading = false,
  emptyMessage = 'No movies found'
}) => {
  const getGridCols = () => {
    if (columns !== 'auto') return columns;
    
    switch (size) {
      case 'small':
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8';
      case 'medium':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7';
      case 'large':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    }
  };

  if (loading) {
    return (
      <div className={`grid ${getGridCols()} gap-4 ${className}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className={`bg-gray-300 dark:bg-dark-700 rounded-lg ${
              size === 'small' ? 'h-48' : size === 'large' ? 'h-96' : 'h-72'
            }`} />
            <div className="p-3">
              <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded mb-2" />
              <div className="h-3 bg-gray-300 dark:bg-dark-700 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-200 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${getGridCols()} gap-4 ${className}`}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          size={size}
        />
      ))}
    </div>
  );
};

export default MovieCard;

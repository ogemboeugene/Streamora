import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Calendar } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const MovieCard = React.memo(({ movie, config, showPlayButton, showRating, showYear, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getContentLink = (movie) => {
    const type = movie.contentType || movie.type || (movie.first_air_date ? 'tv' : 'movie');
    const id = movie.contentId || movie.id || movie.tmdbId;
    return `/${type}/${id}`;
  };

  const getTitle = (movie) => {
    return movie.title || movie.name || 'Untitled';
  };

  const getReleaseYear = (movie) => {
    const date = movie.release_date || movie.first_air_date || movie.releaseDate;
    return date ? new Date(date).getFullYear() : null;
  };

  const getPosterUrl = (movie) => {
    // Handle different poster data structures
    
    // 1. Try poster.url first (most reliable)
    if (movie.poster?.url) return movie.poster.url;
    
    // 2. Try TMDB poster_path
    if (movie.poster_path) {
      return movie.poster_path.startsWith('http') 
        ? movie.poster_path 
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    }
    
    // 3. Try direct poster field
    if (movie.poster) {
      if (typeof movie.poster === 'string') {
        if (movie.poster.startsWith('http')) return movie.poster;
        if (movie.poster.startsWith('/')) return `https://image.tmdb.org/t/p/w500${movie.poster}`;
        return movie.poster;
      }
      if (movie.poster.url) return movie.poster.url;
    }
    
    // 4. Try image field as fallback
    if (movie.image) {
      if (movie.image.startsWith('http')) return movie.image;
      if (movie.image.startsWith('/')) return `https://image.tmdb.org/t/p/w500${movie.image}`;
      return movie.image;
    }
    
    // 5. Try backdrop_path as last resort
    if (movie.backdrop_path) {
      return movie.backdrop_path.startsWith('http') 
        ? movie.backdrop_path 
        : `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;
    }
    
    // 6. Default placeholder
    return '/images/placeholder-poster.jpg';
  };

  const getRating = (movie) => {
    return movie.vote_average || movie.voteAverage || movie.rating || 0;
  };

  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const posterUrl = getPosterUrl(movie);
  const rating = getRating(movie);
  const contentLink = getContentLink(movie);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    setImageError(true);
    setImageLoaded(true);
    e.target.src = '/images/placeholder-poster.jpg';
  };

  return (
    <div
      key={movie.contentId || movie.id || movie.tmdbId || `${title}-${index}`}
      className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <Link to={contentLink} className="block">
        {/* Poster Image */}
        <div className={`relative overflow-hidden ${config.card} bg-gray-200 dark:bg-gray-700`}>
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          <img
            src={posterUrl}
            alt={title}
            className={`${config.image} object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
          
          {/* Play Button */}
          {showPlayButton && imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-primary-600 text-white p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-6 h-6 fill-white" />
              </div>
            </div>
          )}

          {/* Rating Badge */}
          {showRating && rating > 0 && imageLoaded && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-md text-xs flex items-center">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
              {rating.toFixed(1)}
            </div>
          )}

          {/* Quality Badge */}
          {movie.quality && imageLoaded && (
            <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded-md text-xs font-medium">
              {movie.quality}
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-3">
          <h3 className={`font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 ${config.title}`}>
            {title}
          </h3>
          
          <div className="flex items-center justify-between">
            {showYear && year && (
              <div className={`flex items-center text-gray-600 dark:text-gray-400 ${config.info}`}>
                <Calendar className="w-3 h-3 mr-1" />
                {year}
              </div>
            )}
            
            {movie.genre && (
              <div className={`text-gray-500 dark:text-gray-500 ${config.info}`}>
                {movie.genre}
              </div>
            )}
          </div>

          {/* Additional Info */}
          {movie.runtime && (
            <div className={`text-gray-500 dark:text-gray-500 mt-1 ${config.info}`}>
              {movie.runtime}m
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});

const MovieGrid = ({ 
  movies = [], 
  content = [], 
  size = 'medium', 
  loading = false, 
  emptyMessage = 'No content available',
  showPlayButton = true,
  showRating = true,
  showYear = true 
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8',
      card: 'aspect-[2/3]',
      image: 'w-full h-full',
      title: 'text-xs',
      info: 'text-xs'
    },
    medium: {
      container: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
      card: 'aspect-[2/3]',
      image: 'w-full h-full',
      title: 'text-sm',
      info: 'text-xs'
    },
    large: {
      container: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      card: 'aspect-[2/3]',
      image: 'w-full h-full',
      title: 'text-base',
      info: 'text-sm'
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Use content prop if provided, otherwise fall back to movies prop
  const items = content.length > 0 ? content : movies;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${config.container}`}>
      {items.map((movie, index) => (
        <MovieCard
          key={movie.contentId || movie.id || movie.tmdbId || `${movie.title || movie.name}-${index}`}
          movie={movie}
          config={config}
          showPlayButton={showPlayButton}
          showRating={showRating}
          showYear={showYear}
          index={index}
        />
      ))}
    </div>
  );
};

export default React.memo(MovieGrid);

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Plus, 
  Heart, 
  Share2, 
  Star, 
  Calendar, 
  Clock, 
  BookmarkPlus,
  ExternalLink,
  Database
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import SEOHead from '../components/UI/SEOHead';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { contentAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import MovieGrid from '../components/Content/MovieGrid';
import { toast } from 'react-hot-toast';

const ContentDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    addToWatchlist, 
    removeFromWatchlist, 
    isInWatchlist: checkWatchlist,
    addToFavorites, 
    removeFromFavorites, 
    isFavorite: checkFavorite,
    addRating,
    getUserRating
  } = useUserData();
  
  // Extract type from URL path
  const type = location.pathname.split('/')[1]; // /movie/123 -> 'movie', /tv/123 -> 'tv'
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [watchProviders, setWatchProviders] = useState(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);

  // Validate params early
  const isValidParams = type && id && ['movie', 'tv', 'radio'].includes(type);

  // Helper function to fetch person images
  const fetchPersonImage = useCallback(async (personId) => {
    try {
      const response = await contentAPI.getPersonImages(personId);
      if (response.data && response.data.profiles && response.data.profiles.length > 0) {
        return response.data.profiles[0].file_path;
      }
    } catch (error) {
      console.error(`Error fetching images for person ${personId}:`, error);
    }
    return null;
  }, []);

  // Function to enhance cast/crew with additional images
  const enhancePersonsWithImages = useCallback(async (persons) => {
    if (!persons || persons.length === 0) return persons;
    
    setLoadingImages(true);
    try {
      const enhancedPersons = await Promise.all(
        persons.map(async (person) => {
          // If person already has profile_path, use it
          if (person.profile_path) {
            return person;
          }
          
          // Try to fetch additional images if we have tmdbPersonId or id
          const personId = person.tmdbPersonId || person.id;
          if (personId) {
            const imagePath = await fetchPersonImage(personId);
            return {
              ...person,
              profile_path: imagePath
            };
          }
          
          return person;
        })
      );
      return enhancedPersons;
    } catch (error) {
      console.error('Error enhancing persons with images:', error);
      return persons;
    } finally {
      setLoadingImages(false);
    }
  }, [fetchPersonImage]);

  const fetchRecommendations = useCallback(async () => {
    try {
      // In a real app, this would be a dedicated recommendation endpoint
      const response = await contentAPI.discoverContent(type, {
        page: 1,
        sortBy: 'popularity.desc'
      });
      setRecommendations(response.data.slice(0, 12));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }, [type]);

  const fetchContent = useCallback(async () => {
    if (!isValidParams) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await contentAPI.getContentDetails(type, id);
      setContent(response.data);
      
      // Extract cast and crew data and enhance with images
      if (response.data.cast) {
        const enhancedCast = await enhancePersonsWithImages(response.data.cast);
        setCast(enhancedCast);
      }
      if (response.data.crew) {
        const enhancedCrew = await enhancePersonsWithImages(response.data.crew);
        setCrew(enhancedCrew);
      }
      
      // Extract trailers
      if (response.data.trailers) {
        setTrailers(response.data.trailers);
      } else if (response.data.videos) {
        setTrailers(response.data.videos.filter(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        ));
      }

      // Fetch watch providers
      try {
        const watchProvidersResponse = type === 'movie' 
          ? await contentAPI.getMovieWatchProvidersById(id)
          : await contentAPI.getTVWatchProvidersById(id);
        setWatchProviders(watchProvidersResponse.data);
      } catch (error) {
        console.error('Error fetching watch providers:', error);
      }

      // Fetch recommendations using the new endpoint
      try {
        const recommendationsResponse = type === 'movie'
          ? await contentAPI.getMovieRecommendations(id, 1)
          : await contentAPI.getTVRecommendations(id, 1);
        setRecommendations(recommendationsResponse.data.results?.slice(0, 12) || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to discovery
        fetchRecommendations();
      }

      // Fetch videos
      try {
        const videosResponse = type === 'movie'
          ? await contentAPI.getMovieVideos(id)
          : await contentAPI.getTVVideos(id);
        setVideos(videosResponse.data.results || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }

      // Fetch similar content
      try {
        const similarResponse = type === 'movie'
          ? await contentAPI.getSimilarMovies(id, 1)
          : await contentAPI.getSimilarTVShows(id, 1);
        setSimilar(similarResponse.data.results?.slice(0, 12) || []);
      } catch (error) {
        console.error('Error fetching similar content:', error);
      }

    } catch (error) {
      setError('Failed to load content details. Please try again.');
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }, [type, id, fetchRecommendations, isValidParams, enhancePersonsWithImages]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Early return for invalid params
  if (!isValidParams) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">
            Invalid content URL
          </div>
          <Link
            to="/"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </Layout>
    );
  }

  const handleWatchNow = async () => {
    if (user) {
      // Add to watch history
      try {
        await userAPI.addToHistory(id, type, 0);
      } catch (error) {
        console.error('Error adding to history:', error);
      }
    }
    
    // Navigate to watch page
    navigate(`/watch/${type}/${id}`);
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add to watchlist');
      return;
    }

    const contentData = {
      contentId: content.id || content.tmdbId,
      contentType: type,
      title: content.title || content.name,
      poster: content.poster_path,
      overview: content.overview,
      releaseDate: content.release_date || content.first_air_date,
      voteAverage: content.vote_average,
      genres: content.genres
    };

    const isCurrentlyInWatchlist = checkWatchlist(contentData.contentId);
    
    try {
      if (isCurrentlyInWatchlist) {
        await removeFromWatchlist(contentData.contentId);
      } else {
        await addToWatchlist(contentData);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error('Please login to add to favorites');
      return;
    }

    const contentData = {
      contentId: content.id || content.tmdbId,
      contentType: type,
      title: content.title || content.name,
      poster: content.poster_path,
      overview: content.overview,
      releaseDate: content.release_date || content.first_air_date,
      voteAverage: content.vote_average,
      genres: content.genres
    };

    const isCurrentlyFavorite = checkFavorite(contentData.contentId);
    
    try {
      if (isCurrentlyFavorite) {
        await removeFromFavorites(contentData.contentId);
      } else {
        await addToFavorites(contentData);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      toast.error('Please login to rate content');
      return;
    }

    const ratingData = {
      contentId: content.id || content.tmdbId,
      contentType: type,
      title: content.title || content.name,
      poster: content.poster_path,
      rating: rating
    };

    try {
      await addRating(ratingData);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const handleShare = async () => {
    try {
      // Try native sharing first
      if (navigator.share) {
        await navigator.share({
          title: content.title,
          text: content.overview,
          url: window.location.href,
        });
        return;
      }
    } catch (error) {
      console.log('Native share failed, trying clipboard');
    }
    
    // Fallback to copying URL
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      } else {
        // Manual fallback for older browsers or permission issues
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copied to clipboard');
      }
    } catch (clipboardError) {
      console.error('Clipboard error:', clipboardError);
      toast.error('Unable to copy link. Please copy manually: ' + window.location.href);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (error || !content) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">
            {error || 'Content not found'}
          </div>
          <Link
            to="/"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${content.title} - Streamora`}
        description={content.overview}
        keywords={`${content.title}, ${type}, streaming, watch online, free`}
        image={content.backdrop?.url}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        {/* Hero Section */}
        <div className="relative">
          {/* Backdrop Image */}
          <div className="relative h-[70vh] overflow-hidden">
            <img
              src={content.backdrop?.url || content.poster?.url || '/images/placeholder-backdrop.jpg'}
              alt={content.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16 w-full">
              <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8">
                {/* Poster */}
                <div className="flex-shrink-0 mb-4 lg:mb-0 mx-auto lg:mx-0">
                  <img
                    src={content.poster?.url || '/images/placeholder-poster.jpg'}
                    alt={content.title}
                    className="w-32 h-48 sm:w-40 sm:h-60 lg:w-48 lg:h-72 object-cover rounded-lg shadow-2xl"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 sm:mb-4">
                    {content.title}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center space-x-6 mb-6 text-white/90">
                    {content.rating && (
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-semibold">{content.rating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    {content.releaseDate && (
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-1" />
                        <span>{new Date(content.releaseDate).getFullYear()}</span>
                      </div>
                    )}

                    {content.runtime && (
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-1" />
                        <span>{formatRuntime(content.runtime)}</span>
                      </div>
                    )}

                    {content.quality && (
                      <div className="px-2 py-1 bg-primary-600 text-white text-sm font-medium rounded">
                        {content.quality}
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {content.genres && content.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {content.genres.slice(0, 5).map((genre) => (
                        <span
                          key={genre.id || genre}
                          className="px-3 py-1 bg-white/20 text-white rounded-full text-sm backdrop-blur-sm"
                        >
                          {genre.name || genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-3xl">
                    {content.overview}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-center lg:items-start gap-3 sm:gap-4">
                    <button
                      onClick={handleWatchNow}
                      className="flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <Play className="w-5 h-5 mr-2 fill-white" />
                      Watch Now
                    </button>

                    <button
                      onClick={handleWatchlistToggle}
                      className={`flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors ${
                        checkWatchlist(content.id || content.tmdbId)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                      }`}
                    >
                      {checkWatchlist(content.id || content.tmdbId) ? (
                        <>
                          <BookmarkPlus className="w-5 h-5 mr-2" />
                          In Watchlist
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          Watchlist
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleFavoriteToggle}
                        className={`p-3 rounded-lg transition-colors ${
                          checkFavorite(content.id || content.tmdbId)
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${checkFavorite(content.id || content.tmdbId) ? 'fill-white' : ''}`} />
                      </button>

                      <button
                        onClick={handleShare}
                        className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* User Rating */}
                  {user && (
                    <div className="mt-6">
                      <div className="text-white/90 mb-2">Your Rating:</div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star)}
                            className="transition-colors"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= (getUserRating(content.id || content.tmdbId) || 0)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-white/40 hover:text-yellow-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-dark-700 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'cast', label: 'Cast & Crew' },
                { id: 'trailers', label: 'Trailers' },
                { id: 'videos', label: 'Videos' },
                { id: 'similar', label: 'Similar' },
                { id: 'seasons', label: 'Seasons' },
                { id: 'watch-providers', label: 'Where to Watch' },
                { id: 'details', label: 'Details' }
              ].filter(tab => {
                // Show seasons tab only for TV shows
                if (tab.id === 'seasons' && type !== 'tv') return false;
                return true;
              }).map((tab) => (
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

          {/* Tab Content */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  About {content.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {content.overview}
                </p>

                {/* Production Info */}
                {(content.productionCompanies || content.productionCountries) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.productionCompanies && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Production Companies
                        </h4>
                        <div className="space-y-1">
                          {content.productionCompanies.slice(0, 5).map((company, index) => (
                            <p key={company.id || company.name || index} className="text-gray-600 dark:text-gray-400">
                              {company.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {content.productionCountries && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Countries
                        </h4>
                        <div className="space-y-1">
                          {content.productionCountries.map((country, index) => (
                            <p key={country.iso_3166_1 || country.name || index} className="text-gray-600 dark:text-gray-400">
                              {country.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cast' && (
              <div>
                {loadingImages && (
                  <div className="mb-4 text-center">
                    <LoadingSpinner size="small" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Loading additional images...
                    </p>
                  </div>
                )}
                
                {cast.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Cast
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {cast.slice(0, 10).map((person) => (
                        <div key={person.tmdbPersonId || person.id || person.name} className="text-center">
                          <img
                            src={person.profile_path 
                              ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                              : '/images/placeholder-person.svg'
                            }
                            alt={person.name}
                            className="w-full h-48 object-cover rounded-lg mb-2"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=185&background=e5e5e5&color=999`;
                            }}
                          />
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {person.name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {person.character}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {crew.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Crew
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {crew
                        .filter(person => ['Director', 'Producer', 'Writer', 'Screenplay', 'Executive Producer', 'Cinematography', 'Music'].includes(person.job))
                        .slice(0, 10)
                        .map((person, index) => (
                          <div key={person.tmdbPersonId || person.id || `${person.name}-${person.job}-${index}`} className="text-center">
                            <img
                              src={person.profile_path 
                                ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                : '/images/placeholder-person.svg'
                              }
                              alt={person.name}
                              className="w-full h-48 object-cover rounded-lg mb-2"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=185&background=e5e5e5&color=999`;
                              }}
                            />
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {person.name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                              {person.job}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trailers' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Trailers & Videos
                </h3>
                {trailers.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {trailers.slice(0, 4).map((trailer) => (
                      <div key={trailer.key || trailer.id || trailer.name} className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${trailer.key}`}
                          title={trailer.name}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No trailers available for this content.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'seasons' && content.seasons && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Seasons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.seasons.map((season) => (
                    <Link
                      key={season.tmdbSeasonId || season.id || season.season_number}
                      to={`/tv/${id}/season/${season.season_number}`}
                      className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-[2/3] overflow-hidden">
                        <img
                          src={season.poster_path 
                            ? `https://image.tmdb.org/t/p/w300${season.poster_path}`
                            : '/images/placeholder-season.svg'
                          }
                          alt={season.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(season.name)}&size=300&background=e5e5e5&color=999`;
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {season.name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {season.episode_count} episodes
                        </p>
                        {season.air_date && (
                          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                            {new Date(season.air_date).getFullYear()}
                          </p>
                        )}
                        {season.overview && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-3">
                            {season.overview}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'watch-providers' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Where to Watch
                </h3>
                {watchProviders && Object.keys(watchProviders.results || {}).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(watchProviders.results).map(([country, providers]) => (
                      <div key={country} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                          {country === 'US' ? 'United States' : country}
                        </h4>
                        
                        {providers.flatrate && providers.flatrate.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                              Stream
                            </h5>
                            <div className="flex flex-wrap gap-3">
                              {providers.flatrate.map((provider) => (
                                <div
                                  key={provider.provider_id}
                                  className="flex items-center bg-white dark:bg-dark-800 rounded-lg p-3 shadow-sm"
                                >
                                  <img
                                    src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    className="w-8 h-8 rounded mr-3"
                                  />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {provider.provider_name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {providers.rent && providers.rent.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                              Rent
                            </h5>
                            <div className="flex flex-wrap gap-3">
                              {providers.rent.map((provider) => (
                                <div
                                  key={provider.provider_id}
                                  className="flex items-center bg-white dark:bg-dark-800 rounded-lg p-3 shadow-sm"
                                >
                                  <img
                                    src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    className="w-8 h-8 rounded mr-3"
                                  />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {provider.provider_name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {providers.buy && providers.buy.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                              Buy
                            </h5>
                            <div className="flex flex-wrap gap-3">
                              {providers.buy.map((provider) => (
                                <div
                                  key={provider.provider_id}
                                  className="flex items-center bg-white dark:bg-dark-800 rounded-lg p-3 shadow-sm"
                                >
                                  <img
                                    src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    className="w-8 h-8 rounded mr-3"
                                  />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {provider.provider_name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      No watch providers available for this content
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                      Check back later for streaming options
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Release Date
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatDate(content.releaseDate)}
                      </p>
                    </div>

                    {content.runtime && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Runtime
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {formatRuntime(content.runtime)}
                        </p>
                      </div>
                    )}

                    {content.status && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Status
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {content.status}
                        </p>
                      </div>
                    )}

                    {content.originalLanguage && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Original Language
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {content.originalLanguage.toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {content.budget && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Budget
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          ${content.budget.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {content.revenue && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Revenue
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          ${content.revenue.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {content.homepage && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Official Website
                        </h4>
                        <a
                          href={content.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 flex items-center"
                        >
                          Visit Website
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    )}

                    {content.imdbId && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          IMDb
                        </h4>
                        <a
                          href={`https://www.imdb.com/title/${content.imdbId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 flex items-center"
                        >
                          View on IMDb
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Videos
                </h3>
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.slice(0, 12).map((video, index) => (
                      <div key={video.id || video.key || index} className="bg-gray-50 dark:bg-dark-700 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-200 dark:bg-dark-600 flex items-center justify-center">
                          {video.site === 'YouTube' ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${video.key}`}
                              title={video.name}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400">
                              Video not available
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {video.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {video.type} • {video.site}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No videos available.</p>
                )}
              </div>
            )}

            {activeTab === 'similar' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Similar {type === 'movie' ? 'Movies' : 'TV Shows'}
                </h3>
                {similar.length > 0 ? (
                  <MovieGrid
                    movies={similar}
                    size="medium"
                    loading={false}
                    emptyMessage={`No similar ${type === 'movie' ? 'movies' : 'TV shows'} available`}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No similar {type === 'movie' ? 'movies' : 'TV shows'} available.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              More Like This
            </h2>
            <MovieGrid
              movies={recommendations}
              size="medium"
              loading={false}
              emptyMessage="No recommendations available"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContentDetail;

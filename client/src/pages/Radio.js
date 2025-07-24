import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Heart, Search, Globe, Music, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import SEOHead from '../components/UI/SEOHead';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { radioAPI } from '../services/api';
import { usePlayer } from '../contexts/PlayerContext';
import toast, { Toaster } from 'react-hot-toast';

const RadioPlayerControls = ({ currentStation, isPlaying, onPlay, onPause, onNext, onPrevious }) => {
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    // You would implement volume control in your player context
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // You would implement mute functionality in your player context
  };

  if (!currentStation) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600 p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Station Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
            {currentStation.logo ? (
              <img
                src={currentStation.logo}
                alt={currentStation.name}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <Music className="w-8 h-8 text-white" />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {currentStation.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Globe className="w-4 h-4" />
              <span>{currentStation.country}</span>
              {currentStation.codec && (
                <>
                  <span>•</span>
                  <span>{currentStation.codec}</span>
                </>
              )}
              {currentStation.bitrate && (
                <>
                  <span>•</span>
                  <span>{currentStation.bitrate}kbps</span>
                </>
              )}
            </div>
            {currentStation.tags && currentStation.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {currentStation.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onPrevious}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title="Previous Station"
          >
            <SkipBack className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>
          
          <button
            onClick={onNext}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title="Next Station"
          >
            <SkipForward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          <div className="w-24">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
              title="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const RadioCard = ({ station, onPlay, isPlaying, className = '' }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    onPlay(station);
  };

  return (
    <div className={`group bg-white dark:bg-dark-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${className}`}>
      <div className="relative aspect-square bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
        {(station.logo || station.favicon) ? (
          <img
            src={station.logo || station.favicon}
            alt={station.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback content - always present but initially hidden if there's an image */}
        <div 
          className="text-center text-white"
          style={{ display: (station.logo || station.favicon) ? 'none' : 'flex' }}
        >
          <div className="flex flex-col items-center">
            <Music className="w-12 h-12 mb-2" />
            <span className="text-sm font-medium px-2 text-center line-clamp-2">{station.name}</span>
          </div>
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPlaying 
                ? 'bg-red-600 text-white opacity-100' 
                : 'bg-white text-primary-600 opacity-0 group-hover:opacity-100'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            isFavorite
              ? 'bg-red-600 text-white opacity-100'
              : 'bg-white/90 text-gray-700 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Live Indicator */}
        {station.isLive && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {station.name}
        </h3>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Globe className="w-4 h-4 mr-1" />
          <span className="line-clamp-1">{station.country || 'Unknown'}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {(() => {
            const tags = station.tags || station.genres || [];
            const tagArray = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            return tagArray.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
              >
                {genre}
              </span>
            ));
          })()}
        </div>

        {station.currentTrack && (
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            Now Playing: {station.currentTrack}
          </div>
        )}
      </div>
    </div>
  );
};

const RadioGenreFilter = ({ genres, activeGenre, onGenreChange }) => {
  return (
    <div className="flex overflow-x-auto space-x-2 pb-2 mb-6">
      <button
        onClick={() => onGenreChange('')}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          activeGenre === ''
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
        }`}
      >
        All
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onGenreChange(genre)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeGenre === genre
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

const Radio = () => {
  const { currentTrack, isPlaying, play, pause, loadContent } = usePlayer();
  
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('');
  const [featuredStations, setFeaturedStations] = useState([]);
  const [genres, setGenres] = useState([]);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  // Commented out unused variables to fix build
  // const [playHistory, setPlayHistory] = useState([]);
  // const [volume, setVolume] = useState(100);

  // Get current station from currentTrack
  const currentStation = currentTrack?.station || null;

  const filterStations = useCallback(() => {
    let filtered = stations;

    if (searchQuery) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (station.tags || station.genres)?.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (activeGenre) {
      filtered = filtered.filter(station =>
        (station.tags || station.genres)?.includes(activeGenre)
      );
    }

    setFilteredStations(filtered);
  }, [stations, searchQuery, activeGenre]);

  useEffect(() => {
    fetchStations();
    fetchFeaturedStations();
  }, []);

  useEffect(() => {
    filterStations();
  }, [filterStations]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await radioAPI.getStations();
      const stationsData = Array.isArray(response.data) ? response.data : response.data?.stations || [];
      setStations(stationsData);
      
      // Extract unique genres/tags
      const allGenres = stationsData.reduce((acc, station) => {
        const stationGenres = station.tags || station.genres || [];
        return [...acc, ...stationGenres];
      }, []);
      setGenres([...new Set(allGenres)].filter(genre => genre && genre.trim()));
      
    } catch (error) {
      setError('Failed to load radio stations');
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedStations = async () => {
    try {
      const response = await radioAPI.getFeaturedStations();
      const featuredData = Array.isArray(response.data) ? response.data : response.data?.stations || [];
      setFeaturedStations(featuredData.slice(0, 6));
    } catch (error) {
      console.error('Error fetching featured stations:', error);
    }
  };

  const handlePlayStation = async (station) => {
    // Check if station has a valid stream URL
    const streamUrl = station.url_resolved || station.url;
    if (!streamUrl) {
      toast.error('Stream URL not available for this station');
      return;
    }

    try {
      const stationId = station.stationuuid || station.id;
      if (currentTrack?.id === stationId && isPlaying) {
        pause();
      } else {
        // Show loading toast
        const loadingToast = toast.loading('Loading radio station...');
        
        // Track click for analytics (optional - call your click endpoint)
        try {
          await radioAPI.clickStation(stationId);
        } catch (clickError) {
          console.warn('Failed to track station click:', clickError);
        }
        
        // Find current station index for navigation
        const stationIndex = filteredStations.findIndex(s => (s.stationuuid || s.id) === stationId);
        if (stationIndex !== -1) {
          setCurrentStationIndex(stationIndex);
        }
        
        // Add to play history
        setPlayHistory(prev => {
          const newHistory = [station, ...prev.filter(s => (s.stationuuid || s.id) !== stationId)];
          return newHistory.slice(0, 10); // Keep last 10 stations
        });

        // Load content into player and play
        const content = {
          id: stationId,
          title: station.name,
          artist: `${station.country} • ${station.codec || 'Radio'} • ${station.bitrate || '?'}kbps`,
          poster: station.logo || station.favicon,
          type: 'radio',
          url: streamUrl,
          station: station // Pass full station data
        };

        // Load content first
        loadContent(content);
        
        // Then play after a brief delay to allow content to load
        setTimeout(() => {
          play();
        }, 100);

        toast.dismiss(loadingToast);
        toast.success(`Now playing: ${station.name}`);
      }
    } catch (error) {
      console.error('Error playing station:', error);
      toast.error('Failed to play radio station. Please try another station.');
    }
  };

  const handleNextStation = () => {
    if (filteredStations.length === 0) return;
    
    const nextIndex = (currentStationIndex + 1) % filteredStations.length;
    const nextStation = filteredStations[nextIndex];
    handlePlayStation(nextStation);
  };

  const handlePreviousStation = () => {
    if (filteredStations.length === 0) return;
    
    const prevIndex = currentStationIndex === 0 ? filteredStations.length - 1 : currentStationIndex - 1;
    const prevStation = filteredStations[prevIndex];
    handlePlayStation(prevStation);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else if (currentStation) {
      handlePlayStation(currentStation);
    }
  };

  const handleNext = () => {
    handleNextStation();
  };

  const handlePrevious = () => {
    handlePreviousStation();
  };

  // Commented out unused functions to fix build
  // const handleVolumeChange = (newVolume) => {
  //   setVolume(newVolume);
  //   // You would implement actual volume control in your player context
  // };

  // const handleStop = () => {
  //   pause();
  // };

  const isStationPlaying = (station) => {
    const stationId = station.stationuuid || station.id;
    return currentTrack?.id === stationId && isPlaying;
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

  return (
    <Layout>
      <SEOHead
        title="Live Radio Stations - Streamora"
        description="Listen to live radio stations from around the world. Discover music, news, talk shows, and more on Streamora."
        keywords="radio stations, live radio, online radio, music, news, streaming"
      />

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-900" style={{ paddingBottom: currentTrack?.type === 'radio' ? '120px' : '0' }}>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Music className="w-10 h-10" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Live Radio Stations
              </h1>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Discover and listen to radio stations from around the world. 
                Music, news, talk shows, and more - all streaming live.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 mb-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search radio stations, countries, or genres..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Genre Filters */}
            <RadioGenreFilter
              genres={genres}
              activeGenre={activeGenre}
              onGenreChange={setActiveGenre}
            />
          </div>

          {/* Featured Stations */}
          {featuredStations.length > 0 && !searchQuery && !activeGenre && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Featured Stations
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredStations.map((station) => (
                  <RadioCard
                    key={station.stationuuid || station.id}
                    station={station}
                    onPlay={handlePlayStation}
                    isPlaying={isStationPlaying(station)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Stations */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {searchQuery || activeGenre ? 'Search Results' : 'All Stations'}
              </h2>
              <div className="text-gray-600 dark:text-gray-400">
                {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''}
              </div>
            </div>

            {error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button
                  onClick={fetchStations}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No stations found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || activeGenre
                    ? 'Try adjusting your search or filters'
                    : 'No radio stations available at the moment'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredStations.map((station) => (
                  <RadioCard
                    key={station.stationuuid || station.id}
                    station={station}
                    onPlay={handlePlayStation}
                    isPlaying={isStationPlaying(station)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Radio Player Controls */}
      {currentTrack?.type === 'radio' && (
        <RadioPlayerControls
          currentStation={currentStation}
          isPlaying={isPlaying}
          onPlay={handlePlayPause}
          onPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </Layout>
  );
};

export default Radio;

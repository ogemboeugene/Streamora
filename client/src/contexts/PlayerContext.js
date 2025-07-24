import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  currentContent: null,
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  isMuted: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  progress: 0,
  quality: 'auto',
  playbackRate: 1,
  isFullscreen: false,
  showControls: true,
  error: null,
  sources: [],
  currentSourceIndex: 0,
  subtitles: [],
  currentSubtitle: null,
  isSubtitlesEnabled: true,
  watchHistory: [],
  queue: [],
  currentQueueIndex: -1,
  isRepeat: false,
  isShuffle: false,
};

// Action types
const PLAYER_ACTIONS = {
  SET_CONTENT: 'SET_CONTENT',
  SET_PLAYING: 'SET_PLAYING',
  SET_PAUSED: 'SET_PAUSED',
  SET_LOADING: 'SET_LOADING',
  SET_MUTED: 'SET_MUTED',
  SET_VOLUME: 'SET_VOLUME',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  SET_DURATION: 'SET_DURATION',
  SET_PROGRESS: 'SET_PROGRESS',
  SET_QUALITY: 'SET_QUALITY',
  SET_PLAYBACK_RATE: 'SET_PLAYBACK_RATE',
  SET_FULLSCREEN: 'SET_FULLSCREEN',
  SET_SHOW_CONTROLS: 'SET_SHOW_CONTROLS',
  SET_ERROR: 'SET_ERROR',
  SET_SOURCES: 'SET_SOURCES',
  SET_CURRENT_SOURCE: 'SET_CURRENT_SOURCE',
  SET_SUBTITLES: 'SET_SUBTITLES',
  SET_CURRENT_SUBTITLE: 'SET_CURRENT_SUBTITLE',
  SET_SUBTITLES_ENABLED: 'SET_SUBTITLES_ENABLED',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  SET_QUEUE: 'SET_QUEUE',
  SET_QUEUE_INDEX: 'SET_QUEUE_INDEX',
  SET_REPEAT: 'SET_REPEAT',
  SET_SHUFFLE: 'SET_SHUFFLE',
  RESET_PLAYER: 'RESET_PLAYER',
};

// Reducer
function playerReducer(state, action) {
  switch (action.type) {
    case PLAYER_ACTIONS.SET_CONTENT:
      return {
        ...state,
        currentContent: action.payload,
        error: null,
      };
    case PLAYER_ACTIONS.SET_PLAYING:
      return {
        ...state,
        isPlaying: action.payload,
        isPaused: !action.payload,
        error: null,
      };
    case PLAYER_ACTIONS.SET_PAUSED:
      return {
        ...state,
        isPaused: action.payload,
        isPlaying: !action.payload,
      };
    case PLAYER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case PLAYER_ACTIONS.SET_MUTED:
      return {
        ...state,
        isMuted: action.payload,
      };
    case PLAYER_ACTIONS.SET_VOLUME:
      return {
        ...state,
        volume: action.payload,
        isMuted: action.payload === 0,
      };
    case PLAYER_ACTIONS.SET_CURRENT_TIME:
      return {
        ...state,
        currentTime: action.payload,
        progress: state.duration > 0 ? (action.payload / state.duration) * 100 : 0,
      };
    case PLAYER_ACTIONS.SET_DURATION:
      return {
        ...state,
        duration: action.payload,
        progress: state.currentTime > 0 ? (state.currentTime / action.payload) * 100 : 0,
      };
    case PLAYER_ACTIONS.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
        currentTime: state.duration > 0 ? (action.payload / 100) * state.duration : 0,
      };
    case PLAYER_ACTIONS.SET_QUALITY:
      return {
        ...state,
        quality: action.payload,
      };
    case PLAYER_ACTIONS.SET_PLAYBACK_RATE:
      return {
        ...state,
        playbackRate: action.payload,
      };
    case PLAYER_ACTIONS.SET_FULLSCREEN:
      return {
        ...state,
        isFullscreen: action.payload,
      };
    case PLAYER_ACTIONS.SET_SHOW_CONTROLS:
      return {
        ...state,
        showControls: action.payload,
      };
    case PLAYER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isPlaying: false,
      };
    case PLAYER_ACTIONS.SET_SOURCES:
      return {
        ...state,
        sources: action.payload,
        currentSourceIndex: 0,
      };
    case PLAYER_ACTIONS.SET_CURRENT_SOURCE:
      return {
        ...state,
        currentSourceIndex: action.payload,
      };
    case PLAYER_ACTIONS.SET_SUBTITLES:
      return {
        ...state,
        subtitles: action.payload,
      };
    case PLAYER_ACTIONS.SET_CURRENT_SUBTITLE:
      return {
        ...state,
        currentSubtitle: action.payload,
      };
    case PLAYER_ACTIONS.SET_SUBTITLES_ENABLED:
      return {
        ...state,
        isSubtitlesEnabled: action.payload,
      };
    case PLAYER_ACTIONS.ADD_TO_HISTORY:
      const historyExists = state.watchHistory.some(item => 
        item.id === action.payload.id && item.type === action.payload.type
      );
      if (historyExists) return state;
      
      return {
        ...state,
        watchHistory: [action.payload, ...state.watchHistory.slice(0, 49)], // Keep last 50
      };
    case PLAYER_ACTIONS.SET_QUEUE:
      return {
        ...state,
        queue: action.payload,
        currentQueueIndex: action.payload.length > 0 ? 0 : -1,
      };
    case PLAYER_ACTIONS.SET_QUEUE_INDEX:
      return {
        ...state,
        currentQueueIndex: action.payload,
      };
    case PLAYER_ACTIONS.SET_REPEAT:
      return {
        ...state,
        isRepeat: action.payload,
      };
    case PLAYER_ACTIONS.SET_SHUFFLE:
      return {
        ...state,
        isShuffle: action.payload,
      };
    case PLAYER_ACTIONS.RESET_PLAYER:
      return {
        ...initialState,
        watchHistory: state.watchHistory, // Preserve watch history
      };
    default:
      return state;
  }
}

// Create context
const PlayerContext = createContext();

// Custom hook to use player context
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

// Player provider component
export const PlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Load saved preferences
  useEffect(() => {
    const savedVolume = localStorage.getItem('streamora-volume');
    const savedQuality = localStorage.getItem('streamora-quality');
    const savedSubtitlesEnabled = localStorage.getItem('streamora-subtitles');
    const savedPlaybackRate = localStorage.getItem('streamora-playback-rate');

    if (savedVolume) {
      dispatch({ type: PLAYER_ACTIONS.SET_VOLUME, payload: parseFloat(savedVolume) });
    }
    if (savedQuality) {
      dispatch({ type: PLAYER_ACTIONS.SET_QUALITY, payload: savedQuality });
    }
    if (savedSubtitlesEnabled !== null) {
      dispatch({ 
        type: PLAYER_ACTIONS.SET_SUBTITLES_ENABLED, 
        payload: savedSubtitlesEnabled === 'true' 
      });
    }
    if (savedPlaybackRate) {
      dispatch({ 
        type: PLAYER_ACTIONS.SET_PLAYBACK_RATE, 
        payload: parseFloat(savedPlaybackRate) 
      });
    }
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (state.isPlaying && state.showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        dispatch({ type: PLAYER_ACTIONS.SET_SHOW_CONTROLS, payload: false });
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [state.isPlaying, state.showControls]);

  // Player functions
  const loadContent = (content, sources = []) => {
    dispatch({ type: PLAYER_ACTIONS.SET_CONTENT, payload: content });
    dispatch({ type: PLAYER_ACTIONS.SET_SOURCES, payload: sources });
    dispatch({ type: PLAYER_ACTIONS.SET_LOADING, payload: true });
    
    // Add to watch history
    if (content) {
      dispatch({
        type: PLAYER_ACTIONS.ADD_TO_HISTORY,
        payload: {
          id: content.id,
          title: content.title,
          type: content.type,
          poster: content.poster,
          timestamp: Date.now(),
        },
      });
    }
  };

  const play = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.play().catch(error => {
        console.error('Play error:', error);
        dispatch({ type: PLAYER_ACTIONS.SET_ERROR, payload: 'Failed to play content' });
      });
    }
    dispatch({ type: PLAYER_ACTIONS.SET_PLAYING, payload: true });
    dispatch({ type: PLAYER_ACTIONS.SET_SHOW_CONTROLS, payload: true });
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    dispatch({ type: PLAYER_ACTIONS.SET_PAUSED, payload: true });
    dispatch({ type: PLAYER_ACTIONS.SET_SHOW_CONTROLS, payload: true });
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, pause, play]);

  const setVolume = (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (playerRef.current) {
      playerRef.current.volume = clampedVolume;
    }
    dispatch({ type: PLAYER_ACTIONS.SET_VOLUME, payload: clampedVolume });
    localStorage.setItem('streamora-volume', clampedVolume.toString());
  };

  const toggleMute = useCallback(() => {
    const newMuted = !state.isMuted;
    if (playerRef.current) {
      playerRef.current.muted = newMuted;
    }
    dispatch({ type: PLAYER_ACTIONS.SET_MUTED, payload: newMuted });
  }, [state.isMuted]);

  const seek = useCallback((time) => {
    if (playerRef.current && state.duration > 0) {
      const clampedTime = Math.max(0, Math.min(state.duration, time));
      playerRef.current.currentTime = clampedTime;
      dispatch({ type: PLAYER_ACTIONS.SET_CURRENT_TIME, payload: clampedTime });
    }
  }, [state.duration]);

  const seekByProgress = (progress) => {
    const time = (progress / 100) * state.duration;
    seek(time);
  };

  const skipForward = useCallback((seconds = 10) => {
    seek(state.currentTime + seconds);
  }, [state.currentTime, seek]);

  const skipBackward = useCallback((seconds = 10) => {
    seek(state.currentTime - seconds);
  }, [state.currentTime, seek]);

  const setPlaybackRate = (rate) => {
    if (playerRef.current) {
      playerRef.current.playbackRate = rate;
    }
    dispatch({ type: PLAYER_ACTIONS.SET_PLAYBACK_RATE, payload: rate });
    localStorage.setItem('streamora-playback-rate', rate.toString());
  };

  const setQuality = (quality) => {
    dispatch({ type: PLAYER_ACTIONS.SET_QUALITY, payload: quality });
    localStorage.setItem('streamora-quality', quality);
    toast.success(`Quality changed to ${quality}`);
  };

  const switchSource = (sourceIndex) => {
    if (sourceIndex >= 0 && sourceIndex < state.sources.length) {
      dispatch({ type: PLAYER_ACTIONS.SET_CURRENT_SOURCE, payload: sourceIndex });
      toast.success('Source switched');
    }
  };

  const toggleSubtitles = () => {
    const newEnabled = !state.isSubtitlesEnabled;
    dispatch({ type: PLAYER_ACTIONS.SET_SUBTITLES_ENABLED, payload: newEnabled });
    localStorage.setItem('streamora-subtitles', newEnabled.toString());
    toast.success(`Subtitles ${newEnabled ? 'enabled' : 'disabled'}`);
  };

  const setSubtitle = (subtitle) => {
    dispatch({ type: PLAYER_ACTIONS.SET_CURRENT_SUBTITLE, payload: subtitle });
    if (subtitle) {
      toast.success(`Subtitles: ${subtitle.label}`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const playerElement = playerRef.current?.parentElement;
      if (playerElement) {
        playerElement.requestFullscreen().catch(error => {
          console.error('Fullscreen error:', error);
          toast.error('Fullscreen not supported');
        });
      }
    } else {
      document.exitFullscreen();
    }
  };

  const showControls = () => {
    dispatch({ type: PLAYER_ACTIONS.SET_SHOW_CONTROLS, payload: true });
  };

  const hideControls = () => {
    if (state.isPlaying) {
      dispatch({ type: PLAYER_ACTIONS.SET_SHOW_CONTROLS, payload: false });
    }
  };

  const nextInQueue = () => {
    if (state.queue.length > 0) {
      let nextIndex;
      
      if (state.isShuffle) {
        nextIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        nextIndex = state.currentQueueIndex + 1;
        if (nextIndex >= state.queue.length) {
          if (state.isRepeat) {
            nextIndex = 0;
          } else {
            return; // End of queue
          }
        }
      }
      
      dispatch({ type: PLAYER_ACTIONS.SET_QUEUE_INDEX, payload: nextIndex });
      const nextContent = state.queue[nextIndex];
      loadContent(nextContent);
    }
  };

  const previousInQueue = () => {
    if (state.queue.length > 0) {
      let prevIndex = state.currentQueueIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.isRepeat ? state.queue.length - 1 : 0;
      }
      
      dispatch({ type: PLAYER_ACTIONS.SET_QUEUE_INDEX, payload: prevIndex });
      const prevContent = state.queue[prevIndex];
      loadContent(prevContent);
    }
  };

  const setQueue = (queue, startIndex = 0) => {
    dispatch({ type: PLAYER_ACTIONS.SET_QUEUE, payload: queue });
    dispatch({ type: PLAYER_ACTIONS.SET_QUEUE_INDEX, payload: startIndex });
  };

  const toggleRepeat = () => {
    dispatch({ type: PLAYER_ACTIONS.SET_REPEAT, payload: !state.isRepeat });
    toast.success(`Repeat ${!state.isRepeat ? 'enabled' : 'disabled'}`);
  };

  const toggleShuffle = () => {
    dispatch({ type: PLAYER_ACTIONS.SET_SHUFFLE, payload: !state.isShuffle });
    toast.success(`Shuffle ${!state.isShuffle ? 'enabled' : 'disabled'}`);
  };

  const reset = () => {
    dispatch({ type: PLAYER_ACTIONS.RESET_PLAYER });
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      dispatch({ 
        type: PLAYER_ACTIONS.SET_FULLSCREEN, 
        payload: !!document.fullscreenElement 
      });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return; // Don't handle shortcuts when typing
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          togglePlay();
          break;
        case 'KeyF':
          event.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          event.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          event.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          event.preventDefault();
          setVolume(Math.min(1, state.volume + 0.1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          setVolume(Math.max(0, state.volume - 0.1));
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [state.volume, state.isPlaying, skipBackward, skipForward, toggleMute, togglePlay]);

  const value = {
    ...state,
    playerRef,
    loadContent,
    play,
    pause,
    togglePlay,
    setVolume,
    toggleMute,
    seek,
    seekByProgress,
    skipForward,
    skipBackward,
    setPlaybackRate,
    setQuality,
    switchSource,
    toggleSubtitles,
    setSubtitle,
    toggleFullscreen,
    showControls,
    hideControls,
    nextInQueue,
    previousInQueue,
    setQueue,
    toggleRepeat,
    toggleShuffle,
    reset,
    // Dispatch for advanced use cases
    dispatch,
    PLAYER_ACTIONS,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

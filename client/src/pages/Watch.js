import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import VideoPlayer from '../components/Player/VideoPlayer';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { contentAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Watch = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [videoSource, setVideoSource] = useState(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contentAPI.getContentDetails(type, id);
      setContent(response.data);

      // Try to find a video source
      if (response.data.sources && response.data.sources.length > 0) {
        // Use the first available source
        setVideoSource(response.data.sources[0]);
      } else if (response.data.trailers && response.data.trailers.length > 0) {
        // Fallback to trailer if no source available
        const trailer = response.data.trailers[0];
        setVideoSource({
          url: `https://www.youtube.com/embed/${trailer.key}?autoplay=1`,
          type: 'embed',
          provider: 'youtube'
        });
      } else {
        // No video source available
        setError('No video source available for this content');
      }

      // Add to watch history if user is logged in
      if (user) {
        await userAPI.addToHistory(id, type, 0);
      }

    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [type, id, user]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleTimeUpdate = async (currentTime, duration) => {
    if (duration > 0) {
      const progress = (currentTime / duration) * 100;
      setWatchProgress(progress);

      // Update progress in database every 10 seconds
      if (user && Math.floor(currentTime) % 10 === 0) {
        try {
          await userAPI.updateWatchProgress(id, type, progress);
        } catch (error) {
          console.error('Error updating watch progress:', error);
        }
      }
    }
  };

  const handleVideoEnded = async () => {
    if (user) {
      try {
        await userAPI.updateWatchProgress(id, type, 100);
        toast.success('Added to watch history');
      } catch (error) {
        console.error('Error updating watch progress:', error);
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error || 'Content not found'}</p>
          <button
            onClick={handleGoBack}
            className="flex items-center mx-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If no video source, show alternative content
  if (!videoSource) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto p-6">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
          <p className="text-gray-400 mb-6">
            This content is not currently available for streaming. 
            {content.trailers && content.trailers.length > 0 && 
              " You can watch the trailer below."
            }
          </p>

          {/* Show trailer if available */}
          {content.trailers && content.trailers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Watch Trailer</h3>
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${content.trailers[0].key}`}
                  title={`${content.title} Trailer`}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <button
            onClick={handleGoBack}
            className="flex items-center mx-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Details
          </button>
        </div>
      </div>
    );
  }

  // Show video player
  return (
    <div className="min-h-screen bg-black">
      {videoSource.type === 'embed' ? (
        // For YouTube embeds or other iframe sources
        <div className="relative w-full h-screen">
          <button
            onClick={handleGoBack}
            className="absolute top-4 left-4 z-50 flex items-center px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <iframe
            src={videoSource.url}
            title={content.title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      ) : (
        // For direct video files
        <VideoPlayer
          src={videoSource.url}
          poster={content.backdrop?.url || content.poster?.url}
          title={content.title}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onClose={handleGoBack}
          autoPlay={true}
          initialTime={watchProgress > 0 ? (watchProgress / 100) * (content.runtime * 60) : 0}
        />
      )}

      {/* Progress indicator */}
      {watchProgress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div 
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${watchProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Watch;

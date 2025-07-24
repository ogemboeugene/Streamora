import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Star } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const SeasonDetail = () => {
  const { id, seasonNumber } = useParams();
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/content/tv/${id}/season/${seasonNumber}`);
        const data = await response.json();
        
        if (data.success) {
          setSeason(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to load season details');
      } finally {
        setLoading(false);
      }
    };

    fetchSeasonDetails();
  }, [id, seasonNumber]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!season) return <div className="text-center py-8">Season not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            to={`/tv/${id}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Series
          </Link>
          
          <div className="flex items-center space-x-4">
            {season.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                alt={season.name}
                className="w-24 h-36 object-cover rounded-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {season.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {season.episode_count} episodes
              </p>
              {season.air_date && (
                <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                  <Calendar size={16} className="mr-2" />
                  {new Date(season.air_date).getFullYear()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Season Overview */}
      {season.overview && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              About This Season
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {season.overview}
            </p>
          </div>
        </div>
      )}

      {/* Episodes */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Episodes
          </h2>
          
          <div className="space-y-4">
            {season.episodes?.map((episode) => (
              <div
                key={episode.id}
                className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {episode.still_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                    alt={episode.name}
                    className="w-40 h-24 object-cover rounded flex-shrink-0"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {episode.air_date && (
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(episode.air_date).toLocaleDateString()}
                          </span>
                        )}
                        {episode.runtime && (
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {episode.runtime}m
                          </span>
                        )}
                        {episode.vote_average > 0 && (
                          <span className="flex items-center">
                            <Star size={14} className="mr-1 text-yellow-400" />
                            {episode.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {episode.overview && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 leading-relaxed">
                      {episode.overview}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonDetail;

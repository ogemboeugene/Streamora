import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Components
import LoadingSpinner from './components/UI/LoadingSpinner';
import ScrollToTop from './components/UI/ScrollToTop';
import CookieConsent from './components/UI/CookieConsent';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Movies = React.lazy(() => import('./pages/Movies'));
const TVShows = React.lazy(() => import('./pages/TVShows'));
const Radio = React.lazy(() => import('./pages/Radio'));
const SearchResults = React.lazy(() => import('./pages/SearchResults'));
const ContentDetail = React.lazy(() => import('./pages/ContentDetail'));
const SeasonDetail = React.lazy(() => import('./pages/SeasonDetail'));
const Watch = React.lazy(() => import('./pages/Watch'));
const Genres = React.lazy(() => import('./pages/Genres'));
const Trending = React.lazy(() => import('./pages/Trending'));
const AiringToday = React.lazy(() => import('./pages/AiringToday'));
const Watchlist = React.lazy(() => import('./pages/Watchlist'));
const Favorites = React.lazy(() => import('./pages/Favorites'));
const CustomLists = React.lazy(() => import('./pages/CustomLists'));
const TMDBWatchlist = React.lazy(() => import('./pages/TMDBWatchlist'));
const TMDBFavorites = React.lazy(() => import('./pages/TMDBFavorites'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Remove initial loader if it still exists
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.remove();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Streamora - Free Streaming Platform</title>
        <meta name="description" content="Watch free movies, TV shows, and listen to live radio stations. No subscription required." />
        <meta name="keywords" content="free movies, tv shows, streaming, radio, entertainment" />
        <link rel="canonical" href="https://streamora.com" />
      </Helmet>

      <ScrollToTop />
      
      <Routes>
        {/* Home Route */}
        <Route 
          path="/" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Home />
            </Suspense>
          } 
        />

        {/* Content Routes */}
        <Route 
          path="/movies" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Movies />
            </Suspense>
          } 
        />
        <Route 
          path="/tv-shows" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <TVShows />
            </Suspense>
          } 
        />
        <Route 
          path="/radio" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Radio />
            </Suspense>
          } 
        />
        <Route 
          path="/genres" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Genres />
            </Suspense>
          } 
        />
        <Route 
          path="/trending" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Trending />
            </Suspense>
          } 
        />
        <Route 
          path="/airing-today" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <AiringToday />
            </Suspense>
          } 
        />
        <Route 
          path="/watchlist" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Watchlist />
            </Suspense>
          } 
        />
        <Route 
          path="/favorites" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Favorites />
            </Suspense>
          } 
        />
        <Route 
          path="/lists" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <CustomLists />
            </Suspense>
          } 
        />
        <Route 
          path="/tmdb-watchlist" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <TMDBWatchlist />
            </Suspense>
          } 
        />
        <Route 
          path="/tmdb-favorites" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <TMDBFavorites />
            </Suspense>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Settings />
            </Suspense>
          } 
        />
        <Route 
          path="/search" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <SearchResults />
            </Suspense>
          } 
        />
        <Route 
          path="/movie/:id" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <ContentDetail />
            </Suspense>
          } 
        />
        <Route 
          path="/tv/:id" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <ContentDetail />
            </Suspense>
          } 
        />
        <Route 
          path="/tv/:id/season/:seasonNumber" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <SeasonDetail />
            </Suspense>
          } 
        />
        <Route 
          path="/radio/:id" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <ContentDetail />
            </Suspense>
          } 
        />

        {/* Watch Routes */}
        <Route 
          path="/watch/movie/:id" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Watch />
            </Suspense>
          } 
        />
        <Route 
          path="/watch/tv/:id" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Watch />
            </Suspense>
          } 
        />
        <Route 
          path="/watch/radio/:id" 
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Watch />
            </Suspense>
          } 
        />

        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : (
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <Login />
              </Suspense>
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? <Navigate to="/" replace /> : (
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <Register />
              </Suspense>
            )
          } 
        />

        {/* Catch all route - redirect to home for now */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </>
  );
}

export default App;

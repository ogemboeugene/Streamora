import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, Mail, Github, Twitter, Facebook, Instagram, ArrowUp } from 'lucide-react';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Streamora</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              Your ultimate destination for free movies, TV shows, and live radio streaming. 
              Enjoy thousands of titles in HD quality without any subscription fees.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://twitter.com/streamora"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/streamora"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/streamora"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/streamora"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Content Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
              Content
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/movies"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/tv-shows"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  TV Shows
                </Link>
              </li>
              <li>
                <Link
                  to="/radio"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Live Radio
                </Link>
              </li>
              <li>
                <Link
                  to="/genres"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Genres
                </Link>
              </li>
              <li>
                <Link
                  to="/trending"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Trending
                </Link>
              </li>
              <li>
                <Link
                  to="/new-releases"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  New Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  to="/watchlist"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Watchlist
                </Link>
              </li>
              <li>
                <Link
                  to="/tmdb/watchlist"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  TMDB Watchlist
                </Link>
              </li>
              <li>
                <Link
                  to="/tmdb/favorites"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  TMDB Favorites
                </Link>
              </li>
              <li>
                <Link
                  to="/watch-history"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Watch History
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Profile Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/dmca"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  DMCA
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@streamora.com"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-1">Stay Updated</h3>
              <p className="text-gray-400 text-sm">
                Get notified about new movies, shows, and features.
              </p>
            </div>
            <form className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-r-lg transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div className="mb-2 md:mb-0">
              <p>
                © {currentYear} Streamora. All rights reserved. Made with{' '}
                <Heart className="w-4 h-4 inline text-red-500" /> for movie lovers.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs">
                Powered by TMDB, YouTube API & Shoutcast
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
};

export default Footer;

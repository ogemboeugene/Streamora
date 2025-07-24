import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('streamora-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      window.cookieConsent = savedPreferences;
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    setPreferences(allAccepted);
    localStorage.setItem('streamora-cookie-consent', JSON.stringify(allAccepted));
    window.cookieConsent = allAccepted;
    setShowBanner(false);
    
    // Initialize analytics if accepted
    if (allAccepted.analytics) {
      initializeAnalytics();
    }
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('streamora-cookie-consent', JSON.stringify(preferences));
    window.cookieConsent = preferences;
    setShowBanner(false);
    setShowSettings(false);
    
    if (preferences.analytics) {
      initializeAnalytics();
    }
  };

  const handleRejectAll = () => {
    const minimal = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    setPreferences(minimal);
    localStorage.setItem('streamora-cookie-consent', JSON.stringify(minimal));
    window.cookieConsent = minimal;
    setShowBanner(false);
  };

  const initializeAnalytics = () => {
    // Initialize Google Analytics or other analytics services
    if (process.env.REACT_APP_GA_ID && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-gray-900 dark:text-white font-medium mb-1">
                  We use cookies to enhance your experience
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  We use cookies to provide you with the best experience, analyze site usage, and assist in our marketing efforts.{' '}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Customize settings
                  </button>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-2 inline" />
                Settings
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowSettings(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Cookie Settings
                  </h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  We use different types of cookies to provide you with the best experience. 
                  You can choose which types of cookies you want to allow.
                </p>
                
                {/* Cookie Categories */}
                <div className="space-y-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        Necessary Cookies
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Essential for the website to function properly. These cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-6 bg-primary-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        Analytics Cookies
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Help us understand how visitors interact with our website to improve user experience.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => togglePreference('analytics')}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          preferences.analytics 
                            ? 'bg-primary-600' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                          preferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        Marketing Cookies
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Used to track visitors across websites to display relevant advertisements.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => togglePreference('marketing')}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          preferences.marketing 
                            ? 'bg-primary-600' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                          preferences.marketing ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-dark-700">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptSelected}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;

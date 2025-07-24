import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Play, User, ArrowRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoginReminder = ({ isOpen, onClose, onLogin, contentTitle, contentType = 'movie' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <Play className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Enjoying Streamora?
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Create your free account
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400">
                {contentTitle ? (
                  <>You're watching <span className="font-medium">"{contentTitle}"</span>. </>
                ) : (
                  `You're enjoying our ${contentType} content. `
                )}
                Sign up to unlock exclusive features and personalized recommendations!
              </p>
            </div>
            
            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                <span>Create personal watchlists</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                <span>Get personalized recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                <span>Resume watching across devices</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                <span>Access exclusive content</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
              >
                <span>Sign Up Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                Continue watching without account
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing login reminders
export const useLoginReminder = () => {
  const { user } = useAuth();
  const [reminderCount, setReminderCount] = React.useState(0);
  const [lastReminderTime, setLastReminderTime] = React.useState(null);

  React.useEffect(() => {
    // Load reminder data from localStorage
    const savedCount = localStorage.getItem('streamora-reminder-count');
    const savedTime = localStorage.getItem('streamora-last-reminder');
    
    if (savedCount) {
      setReminderCount(parseInt(savedCount));
    }
    
    if (savedTime) {
      setLastReminderTime(new Date(savedTime));
    }
  }, []);

  const shouldShowReminder = React.useCallback(() => {
    if (user) return false; // Don't show if user is logged in
    
    // Don't show if user has dismissed too many times
    if (reminderCount >= 3) return false;
    
    // Don't show if shown recently (within 30 minutes)
    if (lastReminderTime) {
      const timeSinceLastReminder = Date.now() - lastReminderTime.getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      if (timeSinceLastReminder < thirtyMinutes) return false;
    }
    
    return true;
  }, [user, reminderCount, lastReminderTime]);

  const showReminder = React.useCallback(() => {
    const now = new Date();
    const newCount = reminderCount + 1;
    
    setReminderCount(newCount);
    setLastReminderTime(now);
    
    // Save to localStorage
    localStorage.setItem('streamora-reminder-count', newCount.toString());
    localStorage.setItem('streamora-last-reminder', now.toISOString());
  }, [reminderCount]);

  const resetReminder = React.useCallback(() => {
    setReminderCount(0);
    setLastReminderTime(null);
    localStorage.removeItem('streamora-reminder-count');
    localStorage.removeItem('streamora-last-reminder');
  }, []);

  return {
    shouldShowReminder,
    showReminder,
    resetReminder,
    reminderCount
  };
};

// Component for wrapping content that should trigger login reminders
export const LoginReminderTrigger = ({ children, contentTitle, contentType, watchTime = 300000 }) => {
  const { shouldShowReminder, showReminder } = useLoginReminder();
  const [showModal, setShowModal] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    if (!shouldShowReminder()) return;

    // Show reminder after specified watch time (default 5 minutes)
    const timer = setTimeout(() => {
      setShowModal(true);
      showReminder();
    }, watchTime);

    return () => clearTimeout(timer);
  }, [shouldShowReminder, showReminder, watchTime]);

  const handleLogin = () => {
    setShowModal(false);
    // Redirect to login with return URL
    window.location.href = `/login?returnTo=${encodeURIComponent(location.pathname)}`;
  };

  const handleClose = () => {
    setShowModal(false);
    toast.success('Continue enjoying our content!', {
      duration: 2000,
      position: 'bottom-center',
    });
  };

  return (
    <>
      {children}
      <LoginReminder
        isOpen={showModal}
        onClose={handleClose}
        onLogin={handleLogin}
        contentTitle={contentTitle}
        contentType={contentType}
      />
    </>
  );
};

export default LoginReminder;

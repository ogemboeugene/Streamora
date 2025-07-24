import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { userAPI } from '../services/api';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { userStats, refreshStats } = useUserData();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
    preferences: {
      theme: 'auto',
      language: 'en',
      autoplay: true,
      quality: 'auto',
      subtitles: true,
      notifications: {
        email: true,
        push: true
      }
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || '',
        preferences: {
          theme: user.preferences?.theme || 'auto',
          language: user.preferences?.language || 'en',
          autoplay: user.preferences?.autoplay !== false,
          quality: user.preferences?.quality || 'auto',
          subtitles: user.preferences?.subtitles !== false,
          notifications: {
            email: user.preferences?.notifications?.email !== false,
            push: user.preferences?.notifications?.push !== false
          }
        }
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile({
        username: formData.username,
        avatar: formData.avatar,
        preferences: formData.preferences
      });

      if (result.success) {
        toast.success('Profile updated successfully');
        // Update theme if changed
        if (formData.preferences.theme !== theme) {
          setTheme(formData.preferences.theme);
        }
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    )) {
      return;
    }

    const confirmText = prompt(
      'Please type "DELETE" to confirm account deletion:'
    );

    if (confirmText !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    setLoading(true);

    try {
      await userAPI.deleteAccount();
      toast.success('Account deleted successfully');
      // Redirect to home or login page
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete account');
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await userAPI.exportUserData();
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `streamora-data-${user.username}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (!user) {
    return (
      <Layout>
        <Helmet>
          <title>Settings - Streamora</title>
          <meta name="description" content="Manage your account settings on Streamora" />
        </Helmet>
        
        <div className="min-h-screen bg-white dark:bg-dark-900">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Please log in to access your settings
              </p>
              <a
                href="/login"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Log In
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: 'user' },
    { id: 'preferences', name: 'Preferences', icon: 'settings' },
    { id: 'security', name: 'Security', icon: 'shield' },
    { id: 'data', name: 'Data & Privacy', icon: 'database' }
  ];

  return (
    <Layout>
      <Helmet>
        <title>Settings - Streamora</title>
        <meta name="description" content="Manage your account settings on Streamora" />
      </Helmet>
      
      <div className="min-h-screen bg-white dark:bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account preferences and privacy settings
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <nav className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {tab.icon === 'user' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      )}
                      {tab.icon === 'settings' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      )}
                      {tab.icon === 'shield' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      )}
                      {tab.icon === 'database' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      )}
                    </svg>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:w-3/4">
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Profile Information
                    </h2>
                    
                    <form onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-dark-600 text-gray-500 dark:text-gray-400"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Avatar URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={formData.avatar}
                          onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>

                      <div className="mt-8">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Viewing Preferences
                    </h2>
                    
                    <form onSubmit={handleProfileUpdate}>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Theme
                          </label>
                          <select
                            value={formData.preferences.theme}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, theme: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                          >
                            <option value="auto">Auto (System)</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Default Video Quality
                          </label>
                          <select
                            value={formData.preferences.quality}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, quality: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                          >
                            <option value="auto">Auto</option>
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Autoplay
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.preferences.autoplay}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  preferences: { ...prev.preferences, autoplay: e.target.checked }
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Show Subtitles by Default
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.preferences.subtitles}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  preferences: { ...prev.preferences, subtitles: e.target.checked }
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email Notifications
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.preferences.notifications.email}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  preferences: {
                                    ...prev.preferences,
                                    notifications: { ...prev.preferences.notifications, email: e.target.checked }
                                  }
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          {loading ? 'Saving...' : 'Save Preferences'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Security Settings
                    </h2>
                    
                    <form onSubmit={handlePasswordChange}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                            minLength={6}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                            minLength={6}
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                        Danger Zone
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}

                {/* Data & Privacy Tab */}
                {activeTab === 'data' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Data & Privacy
                    </h2>
                    
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Your Data
                        </h3>
                        {userStats && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {userStats.watchHistoryCount}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Watch History
                              </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {userStats.favoritesCount}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Favorites
                              </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {userStats.ratingsCount}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Ratings
                              </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {userStats.listsCount}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Custom Lists
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={handleExportData}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Export My Data
                        </button>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Download all your data in JSON format
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Privacy Policy
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          We respect your privacy and are committed to protecting your personal data. 
                          Your viewing history and preferences are stored securely and are not shared with third parties.
                        </p>
                        <a
                          href="/privacy"
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Read our full Privacy Policy →
                        </a>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Data Retention
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Your data is retained as long as your account is active. 
                          When you delete your account, all personal data is permanently removed from our servers within 30 days.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

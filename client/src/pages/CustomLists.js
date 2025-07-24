import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const CustomLists = () => {
  const { user } = useAuth();
  const { customLists, isLoading, loadUserData, createCustomList, deleteCustomList } = useUserData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    setCreating(true);
    const result = await createCustomList({
      name: newListName.trim(),
      description: newListDescription.trim()
    });

    if (result.success) {
      setNewListName('');
      setNewListDescription('');
      setShowCreateModal(false);
    }
    setCreating(false);
  };

  const handleDeleteList = async (listId, listName) => {
    if (window.confirm(`Are you sure you want to delete "${listName}"? This action cannot be undone.`)) {
      await deleteCustomList(listId);
    }
  };

  if (!user) {
    return (
      <Layout>
        <Helmet>
          <title>My Lists - Streamora</title>
          <meta name="description" content="Create and manage your custom lists on Streamora" />
        </Helmet>
        
        <div className="min-h-screen bg-white dark:bg-dark-900">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                My Lists
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Please log in to create and manage your custom lists
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

  return (
    <Layout>
      <Helmet>
        <title>My Lists - Streamora</title>
        <meta name="description" content="Create and manage your custom lists on Streamora" />
      </Helmet>
      
      <div className="min-h-screen bg-white dark:bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Lists
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {customLists.length > 0 
                  ? `${customLists.length} custom list${customLists.length !== 1 ? 's' : ''}`
                  : 'No custom lists yet'
                }
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create List
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : customLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {customLists.map((list) => (
                <div key={list._id} className="bg-white dark:bg-dark-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {list.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteList(list._id, list.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete list"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {list.itemCount || 0} item{(list.itemCount || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {list.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>

                  <Link
                    to={`/lists/${list._id}`}
                    className="block w-full bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-900 dark:text-white text-center py-2 rounded-lg font-medium transition-colors"
                  >
                    View List
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg 
                    className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No custom lists yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create custom lists to organize your favorite content.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First List
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New List
            </h2>
            
            <form onSubmit={handleCreateList}>
              <div className="mb-4">
                <label htmlFor="listName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  id="listName"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                  placeholder="Enter list name"
                  maxLength={100}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="listDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="listDescription"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                  placeholder="Enter list description"
                  rows={3}
                  maxLength={500}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewListName('');
                    setNewListDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newListName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {creating ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CustomLists;

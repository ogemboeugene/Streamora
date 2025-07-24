import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '../UI/ErrorBoundary';
import CookieConsent from '../UI/CookieConsent';
import ScrollToTop from '../UI/ScrollToTop';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children, showHeader = true, showFooter = true, className = '' }) => {
  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col ${className}`}>
        {showHeader && <Header />}
        
        <main className="flex-1">
          {children}
        </main>
        
        {showFooter && <Footer />}
        
        {/* Global Components */}
        <ScrollToTop />
        <CookieConsent />
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

// Specialized layout variants
export const AuthLayout = ({ children }) => (
  <Layout showHeader={false} showFooter={false} className="items-center justify-center">
    <div className="w-full max-w-md px-4">
      {children}
    </div>
  </Layout>
);

export const PlayerLayout = ({ children }) => (
  <Layout showHeader={true} showFooter={false} className="bg-black">
    {children}
  </Layout>
);

export const AdminLayout = ({ children }) => (
  <Layout showHeader={true} showFooter={false}>
    <div className="flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 min-h-screen">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Admin Panel
          </h2>
          {/* Admin navigation will be added here */}
        </div>
      </aside>
      
      {/* Admin Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  </Layout>
);

export default Layout;

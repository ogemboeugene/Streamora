// Simple Service Worker for Streamora
const CACHE_NAME = 'streamora-v1.0.0';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache failed:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip requests for null URLs or favicon requests to external domains
  if (event.request.url.includes('/null') || 
      event.request.url.endsWith('/null') ||
      (event.request.url.includes('favicon.ico') && !event.request.url.includes(self.location.origin))) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // For favicon requests, return fallback if fetch fails
        if (event.request.url.includes('favicon.ico')) {
          return fetch(event.request).catch(() => {
            return new Response('', {
              status: 404,
              statusText: 'Not Found'
            });
          });
        }
        
        return fetch(event.request).catch(() => {
          // Return a valid Response for failed requests
          return new Response('Resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
      .catch(() => {
        // Always return a valid Response
        return new Response('Cache error', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Update Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

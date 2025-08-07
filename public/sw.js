const CACHE_NAME = 'soccer-planner-v1';
const STATIC_CACHE = 'soccer-planner-static-v1';
const DYNAMIC_CACHE = 'soccer-planner-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip unsupported schemes
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - cache first
    if (STATIC_ASSETS.includes(url.pathname) || 
        request.destination === 'script' || 
        request.destination === 'style' ||
        request.destination === 'image') {
      
      event.respondWith(
        caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            return fetch(request)
              .then((networkResponse) => {
                // Cache successful responses
                if (networkResponse.status === 200 && networkResponse.url.startsWith('http')) {
                  const responseClone = networkResponse.clone();
                  caches.open(STATIC_CACHE)
                    .then((cache) => {
                      cache.put(request, responseClone);
                    });
                }
                return networkResponse;
              })
              .catch(() => {
                // Return offline fallback for images
                if (request.destination === 'image') {
                  return new Response(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" fill="#6b7280">Offline</text></svg>',
                    { headers: { 'Content-Type': 'image/svg+xml' } }
                  );
                }
              });
          })
      );
    }
    
    // API requests - network first, cache fallback
    else if (url.hostname.includes('supabase') || url.pathname.startsWith('/api')) {
      event.respondWith(
        fetch(request)
          .then((networkResponse) => {
            // Cache successful API responses
            if (networkResponse.status === 200 && networkResponse.url.startsWith('http')) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback to cache for API requests
            return caches.match(request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // Return offline response for API calls
                return new Response(
                  JSON.stringify({ 
                    error: 'Offline', 
                    message: 'This feature requires an internet connection',
                    offline: true 
                  }),
                  { 
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              });
          })
      );
    }
    
    // HTML pages - network first, cache fallback
    else {
      event.respondWith(
        fetch(request)
          .then((networkResponse) => {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            return networkResponse;
          })
          .catch(() => {
            return caches.match(request)
              .then((cachedResponse) => {
                return cachedResponse || caches.match('/');
              });
          })
      );
    }
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      console.log('Service Worker: Syncing offline data', offlineData.length, 'items');
      
      // Send offline data to server
      for (const item of offlineData) {
        try {
          await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body
          });
          
          // Remove synced item from offline storage
          await removeOfflineData(item.id);
        } catch (error) {
          console.error('Service Worker: Error syncing item', error);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Error during sync', error);
  }
}

// Helper functions for offline data management
async function getOfflineData() {
  // This would integrate with IndexedDB
  return [];
}

async function removeOfflineData(id) {
  // This would remove from IndexedDB
  console.log('Removing offline data item', id);
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
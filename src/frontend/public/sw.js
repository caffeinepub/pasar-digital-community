const CACHE_NAME = 'pasar-digital-v4';

// Determine base path from service worker location
const getBasePath = () => {
  const swPath = self.location.pathname;
  return swPath.substring(0, swPath.lastIndexOf('/') + 1);
};

const BASE_PATH = getBasePath();

const STATIC_ASSETS = [
  `${BASE_PATH}assets/Logo Pasar Digital Community-1.png`,
];

// Assets that should never be cached (always fetch fresh)
const NEVER_CACHE_PATTERNS = [
  'favicon.dim_16x16.png',
  'favicon.dim_32x32.png',
  'pwa-icon.dim_192x192.png',
  'pwa-icon.dim_512x512.png',
  'pwa-maskable.dim_512x512.png',
  'apple-touch-icon.dim_180x180.png',
  'manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Failed to cache some static assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Never cache PWA icons, favicons, and manifest - always fetch fresh
  // If network fails, let it fail naturally (don't return synthetic 404)
  if (NEVER_CACHE_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
      }).catch(() => {
        // Try cache as fallback, but if not in cache, let request fail naturally
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Let the request fail naturally instead of returning synthetic 404
          throw new Error('Network request failed and no cache available');
        });
      })
    );
    return;
  }

  // Network-first for HTML/navigation requests to ensure fresh app shell
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || 
      url.pathname === BASE_PATH || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache HTML responses
          return response;
        })
        .catch(() => {
          // Fallback to cache only if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

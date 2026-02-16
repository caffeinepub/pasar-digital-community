const CACHE_NAME = 'pasar-digital-v6';

// Determine base path from service worker location
const getBasePath = () => {
  const swPath = self.location.pathname;
  return swPath.substring(0, swPath.lastIndexOf('/') + 1);
};

const BASE_PATH = getBasePath();

const STATIC_ASSETS = [`${BASE_PATH}assets/Logo Pasar Digital Community-1.png`];

// Assets that should always be fetched fresh (never cached)
const NEVER_CACHE_PATTERNS = [
  'favicon.dim_16x16.png',
  'favicon.dim_32x32.png',
  'pwa-icon.dim_192x192.png',
  'pwa-icon.dim_512x512.png',
  'pwa-maskable.dim_512x512.png',
  'apple-touch-icon.dim_180x180.png',
  'manifest.webmanifest',
];

// JS/CSS bundles should use network-first to avoid stale code
const CODE_BUNDLE_PATTERNS = ['.js', '.css', '.mjs'];

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

  // Always fetch fresh for PWA icons, favicons, and manifest
  if (NEVER_CACHE_PATTERNS.some((pattern) => url.pathname.includes(pattern))) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
      }).catch(() => {
        throw new Error('Network request failed and fresh fetch required');
      })
    );
    return;
  }

  // Network-first for HTML/navigation requests to ensure fresh app shell
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    url.pathname === BASE_PATH ||
    url.pathname.endsWith('.html')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Network-first for JS/CSS bundles to avoid serving stale code
  if (CODE_BUNDLE_PATTERNS.some((pattern) => url.pathname.includes(pattern))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh bundle for offline fallback
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache only if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first for other static assets (images, fonts)
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
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all old caches (including pasar-digital-v1 through v5)
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

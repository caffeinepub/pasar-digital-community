const CACHE_NAME = 'pasar-digital-v4';
const STATIC_ASSETS = [
  '/assets/Logo Pasar Digital Community-1.png',
];

// Assets that should never be cached (always fetch fresh)
const NEVER_CACHE = [
  '/assets/generated/favicon.dim_16x16.png',
  '/assets/generated/favicon.dim_32x32.png',
  '/assets/generated/pwa-icon.dim_192x192.png',
  '/assets/generated/pwa-icon.dim_512x512.png',
  '/assets/generated/pwa-maskable.dim_512x512.png',
  '/assets/generated/apple-touch-icon.dim_180x180.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Never cache PWA icons, favicons, and manifest - always fetch fresh
  if (NEVER_CACHE.some(path => url.pathname.includes(path))) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('', { status: 404 });
      })
    );
    return;
  }

  // Network-first for HTML/navigation requests to ensure fresh app shell
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || 
      url.pathname === '/' || url.pathname.endsWith('.html')) {
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

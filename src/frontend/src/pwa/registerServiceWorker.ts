/**
 * Service Worker registration helper for PWA support.
 * Registers the service worker only in production builds using base-path-safe URL.
 */

export function registerServiceWorker(): void {
  // Only register in production builds
  if (import.meta.env.DEV) {
    return;
  }

  // Check if Service Workers are supported
  if (!('serviceWorker' in navigator)) {
    console.info('Service Workers not supported in this browser');
    return;
  }

  window.addEventListener('load', () => {
    // Use base-path-safe URL for service worker registration
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.info('Service Worker registered successfully:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.info('New Service Worker available. Refresh to update.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

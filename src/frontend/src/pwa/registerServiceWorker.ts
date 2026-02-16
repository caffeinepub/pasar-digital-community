/**
 * Service Worker registration helper for PWA support.
 * Registers the service worker only in production builds with update detection and controlled reload.
 */

let hasReloadedOnce = false;

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
                console.info('New Service Worker available. Activating update...');

                // Send skip waiting message to new worker
                newWorker.postMessage({ type: 'SKIP_WAITING' });

                // Reload once to activate the new service worker
                if (!hasReloadedOnce) {
                  hasReloadedOnce = true;
                  console.info('Reloading to activate new service worker...');
                  window.location.reload();
                }
              }
            });
          }
        });

        // Check for updates on page load
        registration.update().catch((err) => {
          console.warn('Service Worker update check failed:', err);
        });
      })
      .catch((error) => {
        // Non-fatal: log error but don't throw
        console.error('Service Worker registration failed:', error);
      });
  });

  // Listen for controller change (new service worker activated)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hasReloadedOnce) {
      hasReloadedOnce = true;
      console.info('Service Worker controller changed. Reloading...');
      window.location.reload();
    }
  });
}

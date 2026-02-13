# Specification

## Summary
**Goal:** Fix PWA installation behavior and home-screen icon display on mobile by making PWA assets and registration work from any base path, and add an in-app “Install” entry point when supported.

**Planned changes:**
- Update `frontend/index.html` to reference `manifest.webmanifest` and PWA icon assets using base-path-safe URLs (avoid hard-coded absolute `/...` paths).
- Update `frontend/public/manifest.webmanifest` to use base-path-safe `start_url`, `scope`, and `icons[].src` so installs work correctly when not served from domain root.
- Update `frontend/src/pwa/registerServiceWorker.ts` to register the service worker using a base-path-safe URL (avoid hard-coded `'/sw.js'`).
- Adjust `frontend/public/sw.js` caching behavior so manifest/icon requests are not masked by synthetic 404s, and updated PWA metadata (manifest/icons) can be picked up reliably.
- Add a small, non-blocking in-app “Install” UI that appears only when the `beforeinstallprompt` event is available, can be dismissed, and does not disrupt existing flows.

**User-visible outcome:** On supported mobile browsers (e.g., Android Chrome/Edge), the app shows an in-app “Install” call-to-action when available; after installation, launching from the home screen opens in standalone mode and the correct app icon appears on Android/iOS.

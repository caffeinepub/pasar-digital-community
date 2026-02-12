# Specification

## Summary
**Goal:** Make the frontend installable as a PWA on Android and iOS, and ensure the favicon/app icons consistently use the Pasar Digital logo.

**Planned changes:**
- Ensure the existing service worker at `/sw.js` is registered in production and properly controls the page for PWA installability.
- Verify and update `manifest.webmanifest` so it is correctly served and references logo-based app icons from `/assets/generated/`.
- Update `frontend/index.html` to reference Pasar Digital logo favicon(s) and Apple touch icon from `/assets/generated/`.
- Add a minimal manual verification checklist to `CHANGELOG.md` for Android Chrome and iOS Safari PWA install/installability checks.

**User-visible outcome:** Users can install the web app to their Android/iOS home screen, open it in standalone mode, and see the Pasar Digital logo as the browser favicon and app icon.

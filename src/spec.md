# Specification

## Summary
**Goal:** Restore correct Pasar Digital Community branding across the app, ensure admin tools (invite tokens) are accessible and functional for admins, add an About page, and make the app installable as a PWA with mobile-friendly layouts.

**Planned changes:**
- Add the uploaded Pasar Digital Community logo as a frontend static asset and render it on the sign-in screen, onboarding, and authenticated app header with correct aspect ratio.
- Ensure admin navigation and routing are discoverable: show an "Admin" entry in the header navigation for admin principals only; hide it for non-admin users; show an access denied screen for non-admin access attempts.
- Provide an in-app, documented way to bootstrap/assign the first admin if none are configured, without granting admin to all users.
- Implement end-to-end admin invite-token management: generate tokens, list tokens split into unused/used, and provide a one-click "copy link" action for unused tokens that copies an onboarding URL containing `inviteToken=...`.
- Add a responsive "About" page reachable from the authenticated UI, displaying WhatsApp `089502436075` and email `pasardigital.ina@gmail.com`.
- Add PWA install support: include a valid web app manifest, required icons/metadata (including Apple touch icon), and ensure installability with no manifest/icon console errors.
- Improve responsive behavior for sign-in, dashboard, admin pages, and token tables to be usable on small screens (~360px), including mobile header navigation behavior and readable tables (responsive pattern or table-only scrolling).

**User-visible outcome:** The app shows the correct logo throughout, admins can find and use the Admin dashboard to generate and manage invite tokens (including copying onboarding links), users can access an About page with admin contact info, the app works well on mobile screens, and it can be installed as a PWA on Android and iOS.

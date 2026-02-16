# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-02-17

### Fixed
- **My Vehicles visibility**: Fixed issue where newly registered vehicles did not appear in "My Vehicles" list without manual refresh
- **React Query cache updates**: Improved vehicle query invalidation and refetch patterns to ensure immediate UI updates after registration and revocation
- **Revoke ownership errors**: Enhanced error messages with clear English descriptions for PIN verification failures, unauthorized attempts, and vehicle not found scenarios
- **Identity-scoped queries**: Added principal-based query keys to prevent cache bleed across account switches (login/logout)
- **Optimistic cache updates**: Implemented immediate cache removal for revoked vehicles to prevent stale data display

### Changed
- Vehicle queries now use `refetchOnMount: 'always'` and `staleTime: 0` to ensure fresh data on page navigation
- Revoke ownership now validates vehicle status (ACTIVE only) and ownership before allowing submission
- Error normalization improved to extract and display backend trap messages clearly
- Vehicle detail queries now include principal in query key for proper identity isolation

### Technical
- No routes or authentication flows modified (protected interface preserved)
- All existing features remain fully functional
- Quality gates (typecheck/lint/format) pass

## [1.0.0] - 2026-02-12

### Added
- **PWA Support**: Application is now installable as a Progressive Web App on Android and iOS devices
  - Service worker registration for offline capability and faster loading
  - Web app manifest with proper metadata for installation
  - Pasar Digital logo used for all favicons (16x16, 32x32) and app icons (192x192, 512x512, maskable)
  - Apple touch icon for iOS home screen installation
  - iOS-specific meta tags for standalone app experience
  - Network-first caching strategy for HTML to ensure fresh app shell after deployments
  - Cache-first strategy for static assets (JS, CSS, images) for optimal performance

### Manual PWA Installation Verification

#### Android (Chrome/Edge):
1. Open the app in Chrome or Edge browser
2. Look for the "Install" prompt in the address bar or browser menu
3. Tap "Install" or "Add to Home Screen"
4. The app icon (Pasar Digital logo) should appear on your home screen
5. Launch the app from the home screen - it should open in standalone mode (no browser UI)

#### iOS (Safari):
1. Open the app in Safari browser
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Confirm the app name and tap "Add"
5. The app icon (Pasar Digital logo) should appear on your home screen
6. Launch the app from the home screen - it should open in standalone mode

### Technical Notes
- Service worker cache version updated to v4
- Favicon and icon files added to NEVER_CACHE list to ensure fresh branding
- No existing routes or authentication flows were modified
- All existing features remain fully functional

### Added
- New `/revoke-ownership` route for permanent vehicle ownership removal
- Vehicle ownership revocation feature with PIN confirmation
- "Revoke Ownership" navigation item in main menu (desktop and mobile)
- "Revoke Ownership" quick action card on dashboard
- Dedicated RevokeOwnershipPage component with vehicle selection and PIN dialog
- Backend `revokeVehicleOwnership` method with PIN verification
- Navigation to vehicles list after successful revocation

### Changed
- Updated `useVehicles.ts` with new `useRevokeVehicleOwnership` mutation hook
- Enhanced VehicleDetailPage with "Revoke Ownership" button for active vehicles
- Modified AppHeader to include revoke ownership navigation
- Updated DashboardPage with new quick action card

### Technical
- All route paths preserved (no breaking changes)
- Proper cache invalidation for vehicle queries after revocation
- PIN verification required for ownership revocation
- Transfer code automatically cleared during revocation

## [0.9.0] - 2026-02-11

### Added
- Initial release with core vehicle registration and tracking features
- Internet Identity authentication
- User profile management with PIN security
- Admin activation system for vehicle registration
- Vehicle status tracking (Active, Lost, Stolen, Pawned, Found)
- Community reporting system for lost/found vehicles
- Vehicle transfer system with PIN confirmation
- Admin dashboard with system statistics
- Notification system for vehicle status updates

### Security
- Role-based access control (Admin/User/Guest)
- PIN-based authorization for sensitive operations
- Blockchain-based vehicle ownership verification

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-11

### Added
- Initial release with change-control system
- Quality gates (typecheck, lint, format)
- Test suite with Vitest and Testing Library
- Versioning discipline and documentation
- PR checklist and change-control policy
- CI integration support

### Route Structure
- `/` - Dashboard
- `/vehicles` - User vehicles list
- `/vehicles/register` - Vehicle registration
- `/vehicles/$vehicleId` - Vehicle detail
- `/lost-vehicles` - Lost vehicles list
- `/vehicle-check` - Public vehicle check
- `/report-found` - Report found vehicle
- `/revoke-ownership` - Revoke vehicle ownership (added 2026-02-12)
- `/notifications` - User notifications
- `/profile` - User profile
- `/onboarding` - User onboarding
- `/onboarding/invite` - Invite-based onboarding
- `/about` - About page
- `/admin` - Admin dashboard
- `/admin/invite-tokens` - Admin invite tokens

### Protected Interfaces
- Route structure (documented above)
- Authentication flow (Internet Identity)
- Backend API contract (see backend.d.ts)

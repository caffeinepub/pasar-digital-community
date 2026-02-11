# Changelog

All notable changes to the Pasar Digital Community vehicle security system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-11

### Added
- **Change Control System**: Comprehensive change-control policy and documentation
  - `CHANGE_CONTROL_POLICY.md`: Defines protected interfaces and review checklist
  - `PR_CHECKLIST.md`: Copy-paste checklist for pull requests
  - `README_CHANGE_CONTROL.md`: Quick start guide for developers
  
- **Quality Gates**: Automated quality checks for code stability
  - TypeScript typecheck gate
  - ESLint code quality gate
  - Prettier format check gate
  - Automated test suite
  - Single `npm run gates` command to run all checks
  - `QUALITY_GATES.md`: Detailed documentation for quality gates
  - `ci-run-gates.sh`: CI integration script
  
- **Test Suite**: Automated regression tests
  - RootRouteGate bootstrap behavior tests
  - Router smoke tests for core routes
  - Vehicle page data-fetch flow tests
  - Test setup with jsdom environment
  
- **Versioning System**: Visible version tracking
  - `frontend/src/version.ts`: Single source of truth for app version
  - Version displayed in authenticated footer
  - `README_VERSIONING.md`: Versioning discipline documentation

### Changed
- Footer now displays app version (v1.0.0)
- Enhanced footer with dynamic year and proper attribution

### Protected Interfaces
This release establishes the following as stable contracts:
- Frontend route structure in `frontend/src/App.tsx`
- Authentication/bootstrap flow in `frontend/src/routes/RootRouteGate.tsx`
- Backend public API in `frontend/src/backend.d.ts`

## [0.1.0] - 2026-02-11

### Initial Release
- Vehicle registration and management system
- Lost vehicle reporting and tracking
- Vehicle transfer system with PIN security
- Notification system for vehicle updates
- Admin dashboard and invite token management
- Internet Identity authentication
- Multi-language support (English, Indonesian, Chinese, Arabic)
- Responsive design with dark mode
- PWA support with offline capabilities

# Change Control Policy

## Purpose
This document defines the change-control rules and mandatory checklist for all code changes to ensure stability and prevent regressions in the Pasar Digital Community vehicle security system.

## Protected Interfaces

The following interfaces are considered **stable contracts** and must not be changed without explicit review and documentation:

### 1. Frontend Route Structure
**Location:** `frontend/src/App.tsx`

All routes defined in the route tree are part of the public interface:
- `/` - Dashboard
- `/vehicles` - Vehicle list
- `/vehicles/register` - Register vehicle
- `/vehicles/$vehicleId` - Vehicle detail
- `/lost-vehicles` - Lost vehicles
- `/notifications` - Notifications
- `/profile` - User profile
- `/security` - Security settings
- `/accept-transfer` - Accept transfer
- `/onboarding` - Onboarding
- `/admin` - Admin dashboard
- `/admin/invite-tokens` - Admin invite tokens
- `/about` - About page

**Rule:** Any route addition, removal, or path change requires documentation in CHANGELOG.md and verification that all navigation links are updated.

### 2. Authentication & Bootstrap Flow
**Locations:**
- `frontend/src/routes/RootRouteGate.tsx` - Root authentication gate
- `frontend/src/hooks/useInternetIdentity.ts` - Internet Identity integration
- `frontend/src/hooks/useActor.ts` - Backend actor initialization
- `frontend/src/hooks/useActorBootstrapStatus.ts` - Bootstrap status management

**Rule:** Changes to authentication flow, bootstrap sequence, or error handling require:
- Verification that all loading states render correctly
- Verification that error screens display properly
- Testing of login/logout cycles
- Documentation of behavior changes

### 3. Backend Public API
**Location:** `frontend/src/backend.d.ts`

All backend actor methods are part of the stable contract:
- User profile methods: `getCallerUserProfile`, `saveCallerUserProfile`, `completeOnboarding`
- Vehicle methods: `registerVehicle`, `getUserVehicles`, `getVehicle`, `getLostVehicles`, `markVehicleLost`, `reportVehicleFound`
- Transfer methods: `initiateTransfer`, `acceptTransfer`
- Notification methods: `getMyNotifications`, `markNotificationRead`
- Security methods: `setupPIN`, `updatePIN`
- Admin methods: `getRegisteredVehicles`, `adminUpdateVehicleStatus`, `getSystemStats`, `getInviteTokenReport`
- Invite methods: `generateInviteCode`, `getInviteCodes`, `getAllRSVPs`, `submitRSVP`
- Authorization methods: `isCallerAdmin`, `isAllowlistAdmin`, `isOnboardingAllowed`, `getCallerUserRole`, `assignCallerUserRole`
- Diagnostics: `getBackendDiagnostics`

**Rule:** Backend interface changes require:
- Update to `frontend/src/backend.d.ts`
- Update to all affected React Query hooks in `frontend/src/hooks/`
- Verification that all components using affected methods still work
- Documentation in CHANGELOG.md

## Mandatory Review Checklist

Before merging any code change, verify:

### Behavior Impact
- [ ] Does this change affect user authentication flow?
- [ ] Does this change affect route navigation or URLs?
- [ ] Does this change affect backend API calls?
- [ ] Does this change affect data persistence or state management?

### Route Impact
- [ ] Are all routes still defined in `frontend/src/App.tsx`?
- [ ] Are all navigation links updated to match route changes?
- [ ] Do all routes render without blank screens?
- [ ] Is the default route (`/`) properly configured?

### Backend API Impact
- [ ] Are all backend method signatures unchanged (or documented if changed)?
- [ ] Are all React Query hooks updated to match backend changes?
- [ ] Are error responses handled correctly?
- [ ] Are loading states displayed properly?

### State & Schema Impact
- [ ] Does this change affect data structures passed to/from backend?
- [ ] Are TypeScript types updated to match backend types?
- [ ] Are all components using affected data structures updated?

## Required Verification Steps

Before merging, run the following verification steps:

1. **Run Quality Gates** (see QUALITY_GATES.md):
   ```bash
   cd frontend && npm run gates
   ```

2. **Manual Testing**:
   - Test login/logout cycle
   - Navigate to all routes and verify they render
   - Test one complete user flow (e.g., register vehicle → view vehicle → mark lost)
   - Verify error states display correctly

3. **Documentation**:
   - Update CHANGELOG.md with changes
   - Update version in `frontend/src/version.ts` if releasing
   - Update README files if behavior changes

## Enforcement

- All changes must pass automated quality gates (typecheck, lint, format)
- All changes must be reviewed against this checklist
- Breaking changes to protected interfaces require explicit approval and migration plan
- See PR_CHECKLIST.md for copy-paste checklist format

# Specification

## Summary
**Goal:** Fix the initial app-open infinite “Loading…” state by correcting the AuthGate/AppLayout bootstrap flow so unauthenticated users see Sign In quickly and authenticated users reliably resolve to onboarding or dashboard based on the real backend profile.

**Planned changes:**
- Update the authentication gate so profile/actor queries are not awaited before authentication is established, and unauthenticated visitors are routed to Sign In instead of staying on an indefinite loading screen.
- Replace placeholder/role-based caller profile logic with the real backend caller-profile API, and ensure onboarding routing happens only after the profile fetch has definitively succeeded (redirect once, no loops).
- Add resilient error handling for authenticated profile fetch failures (show an error state with a retry action rather than a permanent spinner).
- Adjust AppLayout gating so onboarding and post-login pages always render content (header may be hidden on onboarding, but no full-screen blank/black “broken” state).

**User-visible outcome:** Opening the app without an existing session shows Sign In quickly; after login the app reliably loads the user’s real profile and routes to onboarding (if not onboarded) or the dashboard (if onboarded), with a retryable error UI instead of getting stuck on “Loading…”.

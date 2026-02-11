# Specification

## Summary
**Goal:** Treat a specific Internet Identity principal as an admin immediately and ensure admins bypass onboarding/registration on both frontend routing and backend authorization.

**Planned changes:**
- Frontend: update admin allowlist logic to use a multi-principal structure (e.g., list/set) and include `dcama-lvxhu-qf6zb-u75wm-yapdd-dosl4-b3rvi-pxrax-sznjy-3yq47-bae` so `isAllowlistedAdmin(...)` returns true for it.
- Frontend: adjust bootstrap/routing so admin users are not redirected to `/onboarding` when `getCallerUserProfile()` is `null`, and ensure an authenticated admin lands on a usable route (e.g., `/` or `/admin`) without seeing onboarding.
- Frontend: if an admin manually visits `/onboarding`, prevent completing the invite-based onboarding flow and route them back to a main authenticated page.
- Backend (Motoko `backend/main.mo`): update admin authorization checks so the allowlisted principal is treated as admin immediately after deploy/reinstall, enabling admin APIs without requiring onboarding/profile completion.

**User-visible outcome:** When logging in with the allowlisted Internet Identity principal, the user can access admin features right away and is not blocked by onboarding/registration—even after a reinstall/state reset.

# Specification

## Summary
**Goal:** Ensure signed-in users can reliably access their profile (without incorrect onboarding redirects), provide a Profile logout action and Principal ID display, and make admin claiming/navigation work consistently so admins can see and access the Admin Dashboard.

**Planned changes:**
- Fix caller profile loading so the frontend can fetch and display the signed-in user’s profile from the backend and only route to onboarding when the backend indicates no completed profile/onboarding exists.
- Update the Profile page (`/profile`) to reliably render after sign-in and show profile fields (full name, email, city, country) sourced from the backend.
- Add a clearly labeled "Logout" button to the Profile page that logs out of Internet Identity and clears cached app state (including React Query cache), returning the user to the signed-out experience.
- Display the signed-in user’s Internet Identity Principal ID on the Profile page as read-only text with a safe fallback/loading state when unavailable.
- Add backend support for robust “first admin” bootstrapping: an explicit capability check for whether first admin can be claimed, and a dedicated claim method that only succeeds when no admin exists.
- Update the frontend access-denied/admin bootstrap flow to use the new backend capability check and claim method, and ensure the Admin menu item and `/admin` access update immediately after a successful claim without a full refresh.
- Ensure admin navigation visibility (desktop and mobile) is driven by the backend admin check, and `/admin` renders for admins while non-admins see an access denied experience.

**User-visible outcome:** After signing in, users can open `/profile` to see their stored profile details and their Principal ID, and can log out directly from the Profile page. Admin users reliably see an Admin navigation entry (desktop/mobile) and can access `/admin`; if no admin exists yet, an eligible user can claim first admin and immediately gain access.

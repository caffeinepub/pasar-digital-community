# Specification

## Summary
**Goal:** Re-add PIN management on the Profile page so existing users can create or update a Security PIN without re-registering, while keeping all existing profile and app flows unchanged.

**Planned changes:**
- Backend: Add an authenticated API that returns whether the current caller has a PIN set (boolean only; never returns the PIN value), consistent with existing anonymous-caller handling.
- Frontend: Re-introduce a clearly labeled PIN section on the existing Profile page that:
  - Shows “Create PIN” when no PIN exists (uses existing `setupPIN` mutation).
  - Shows “Update PIN” when a PIN exists (old PIN + new PIN + confirm; uses existing `updatePIN` mutation).
  - Validates minimum PIN length (4) and matching new/confirm before submission.
  - Refreshes/invalidates the PIN-status query after a successful change so the UI updates immediately.
- Data safety: Ensure PIN create/update does not modify or overwrite existing stored profile fields and does not introduce any onboarding/registration steps.

**User-visible outcome:** Users can manage (create or update) their Security PIN directly from the Profile page, and existing users keep all their profile data without needing to sign up again.

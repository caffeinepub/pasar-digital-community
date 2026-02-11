# Specification

## Summary
**Goal:** Restore correct admin visibility/access immediately after sign-in for an allowlisted Principal, and replace the placeholder Profile implementation with a real editable Profile form backed by persisted data.

**Planned changes:**
- Ensure the allowlisted Principal `dcama-lvxhu-qf6zb-u75wm-yapdd-dosl4-b3rvi-pxrax-sznjy-3yq47-bae` is recognized as admin right after authentication so the Admin navigation item appears and `/admin` is accessible without any separate “claim admin” step.
- Fix frontend admin-status data flow so `useIsCallerAdmin()` reflects backend admin status reliably after login and after any successful admin-claim action, and provides a recoverable UI state on admin-check failures.
- Implement real profile fetch/save hooks so `useGetCallerUserProfile()` returns stored profile data and `useSaveCallerUserProfile()` persists edits via backend calls and refetches `currentUserProfile` on success.
- Update the Profile page to support view and edit modes with English UI text, editable fields (Full Name required; Email optional; City; Country), Save/Cancel actions, success confirmation on save, read-only Principal display, and unchanged Logout behavior (including clearing cached app state).

**User-visible outcome:** The allowlisted admin sees the Admin menu immediately after signing in and can access the Admin Dashboard, and all users can view and edit their Profile details (full name/email/city/country) with Save/Cancel, with changes persisted and reflected after saving.

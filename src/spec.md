# Specification

## Summary
**Goal:** Ensure the allowlisted Principal is recognized as admin immediately after Internet Identity login so Admin navigation, Admin Dashboard, and Invite Token management are accessible and reliable.

**Planned changes:**
- Fix backend admin authorization so the allowlisted Principal `dcama-lvxhu-qf6zb-u75wm-yapdd-dosl4-b3rvi-pxrax-sznjy-3yq47-bae` is treated as admin immediately after login, including for admin-gated endpoints (system stats and invite-token endpoints).
- Adjust routing/auth gating so the allowlisted admin is not forced into onboarding when a user profile is missing, and `/admin` renders the Admin Dashboard (not AccessDenied).
- Fix frontend admin-status detection and state flow to avoid stale/incorrect admin UI after logout/login (React Query cache/timing/actor bootstrap), ensuring the Admin nav item appears reliably when identity changes and offering a recoverable retry state on transient failures.
- Ensure the Admin Dashboard provides a working navigation path to `/admin/invite-tokens`, and that invite token generation and listing updates end-to-end without manual refresh, including a working copy-invite-link action.

**User-visible outcome:** After logging in with the allowlisted Principal, the user immediately sees an **Admin** menu item, can open the Admin Dashboard at `/admin`, and can navigate to `/admin/invite-tokens` to generate and copy invite links successfully without needing onboarding, hard refreshes, or repeated logins.

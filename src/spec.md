# Specification

## Summary
**Goal:** Fix vehicle ownership revoke/detach so vehicles can be re-registered, ensure “My Vehicles” reliably lists the signed-in user’s vehicles, and show clear (English) error states for these flows.

**Planned changes:**
- Backend: Fix revoke/detach ownership logic so revoking (“lepas/hapus”) consistently removes or detaches ownership without generic errors, and does not block re-registration of the same engine+chassis.
- Backend + Frontend: Fix user vehicle listing so vehicles owned by the current principal reliably appear in “My Vehicles”, including immediately after registration.
- Frontend: Prevent cross-account cached vehicle list leakage (React Query scoping), and add minimal, safe error UI for “My Vehicles” and “Revoke Ownership” that surfaces meaningful English error messages.

**User-visible outcome:** Users can revoke vehicle ownership without generic failures, re-register the same vehicle identifiers after a revoke, and see their vehicles consistently listed under “My Vehicles” with clear English error messages if something fails.

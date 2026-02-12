# Specification

## Summary
**Goal:** Fix the allowlist admin account so it is always treated as activated for vehicle registration, eliminating the incorrect “Not Activated” status while keeping all other activation behavior unchanged.

**Planned changes:**
- Backend: Update the vehicle-registration activation-status check so the hard-coded allowlist admin principal is always considered activated (returns true), independent of stored activation state.
- Backend: Preserve existing activation checks and token issuance/redeem flows for all non-admin users.
- Frontend: Ensure Profile and Vehicles pages reflect the corrected activation status for the allowlist admin (show “Activated” and the “Register Vehicle” primary action), without introducing new UI flows or altering other working features.

**User-visible outcome:** When logged in as the allowlist admin, the app shows Vehicle Registration as “Activated” (no activation-token redeem form) and allows registering vehicles; non-admin users see no change in activation behavior.

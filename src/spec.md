# Specification

## Summary
**Goal:** Fix “My Vehicles” visibility issues and ownership revocation errors so vehicle registration and revocation update the UI correctly for the current Internet Identity principal, then ship a new build.

**Planned changes:**
- Fix the “My Vehicles” (and any reused vehicle-list query) data flow so vehicles owned by the currently signed-in principal reliably appear without manual refresh.
- Correct React Query invalidation/refetch behavior after `registerVehicle` and `revokeVehicleOwnership` so listings and detail views update immediately and don’t leak stale results across account switches.
- Fix the revoke (“lepas”) ownership workflow to use the correct `vehicleId`, prevent revoking vehicles not owned by the current principal, and show clear English error messages on failure cases (e.g., incorrect PIN, unauthorized, vehicle not found).
- Produce and publish a new build containing only these targeted fixes while keeping existing routes unchanged and avoiding regressions in other working features.

**User-visible outcome:** After registering a vehicle, it appears in “My Vehicles” right away for the same signed-in account; after revoking ownership with the correct PIN, the vehicle is removed from relevant pages without generic errors; switching accounts shows the correct vehicle list for the active principal.

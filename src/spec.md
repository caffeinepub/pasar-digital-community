# Specification

## Summary
**Goal:** Let vehicle owners revoke their vehicle ownership with mandatory PIN confirmation, without affecting existing features.

**Planned changes:**
- Add a new backend canister method `revokeVehicleOwnership(vehicleId: Text, pin: Text) : async ()` that:
  - Requires authenticated caller, correct permissions, existing vehicle, and caller being the current owner.
  - Verifies the caller’s PIN using existing PIN verification logic (trap with clear messages for no PIN / incorrect PIN).
  - On success sets `owner` to the anonymous principal and clears `transferCode` to `null`.
- Expose the new backend method to the React frontend by updating `frontend/src/backend.d.ts` so the actor typing includes the method.
- Add a new "Revoke Ownership" destructive action in `VehicleDetailPage.tsx` (only for owners of ACTIVE vehicles) that:
  - Uses the existing `PinPromptDialog` to collect PIN before submitting.
  - Blocks the action if the user has no PIN (via `useHasPIN()`), shows an English toast, and provides navigation to `/security`.
  - On success shows an English success toast, invalidates relevant React Query caches (vehicle detail + user vehicles list), and navigates to `/vehicles`.
  - On failure shows an English error toast using existing error normalization patterns.

**User-visible outcome:** Owners of ACTIVE vehicles can revoke their vehicle ownership from the vehicle detail page by entering their PIN; after success the vehicle is no longer in their vehicles list and they are returned to the vehicles page.

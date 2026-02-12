# Specification

## Summary
**Goal:** Make the ownership revocation flow easy to find from the main navigation and Dashboard, and make Vehicle Detail easier to discover from the vehicle list and after registration.

**Planned changes:**
- Add a new main navigation (AppHeader) menu item labeled in English (e.g., “Revoke Ownership”) that takes users into the existing revocation flow without needing to first open Vehicle Detail.
- Add a new Dashboard “Quick Action” labeled in English (e.g., “Revoke Ownership”) that guides users to select a vehicle (if needed) and then continues to the existing PIN-gated revocation flow.
- Improve Vehicle Detail discoverability by adding an explicit English affordance (e.g., “View Details”) on each vehicle in the vehicle list.
- After successful vehicle registration, provide a clear path to the new vehicle’s detail page (e.g., redirect or a success message with a “View Details” action) while keeping the existing ability to go back to `/vehicles`.

**User-visible outcome:** Users can start “Revoke Ownership” directly from the header menu or Dashboard, and can more easily find and open a vehicle’s detail page from the vehicle list and immediately after registering a vehicle.

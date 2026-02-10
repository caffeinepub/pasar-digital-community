# Specification

## Summary
**Goal:** Build “Pasar Digital Community” as an invite-only, authenticated vehicle anti-theft registry with vehicle ownership transfer, lost/found reporting, notifications, and an admin dashboard.

**Planned changes:**
- Add Internet Identity (Principal-based) sign-in and gate all features behind authentication; show signed-in Principal in the UI.
- Implement invite-only onboarding: admin generates single-use invitation tokens; users must submit a valid unused token to complete first-time profile setup; admin can view token usage status with timestamps.
- Create user profiles linked to Principal (full name, email, city, country) with view/update after onboarding and owner-only access controls.
- Build vehicle registration tied to owner Principal with fields (engine number, chassis number, brand, type/model, year, vehicle location) and vehicle photo upload/storage; allow owners to list and view their vehicles.
- Add PIN setup and verification; require correct PIN to initiate ownership release/transfer; store only a non-plaintext verification representation.
- Implement ownership release/transfer: owner initiates transfer (after PIN check) and generates a one-time transfer code/link; authenticated recipient accepts to become the new owner; enforce owner-only initiation and one-time acceptance.
- Implement lost reporting: owners can mark a vehicle as lost/stolen with a note; all authenticated users can browse/search lost vehicles by engine/chassis number.
- Implement found reporting and in-app notifications: authenticated users can report a lost vehicle as found; owners receive persisted notifications and can mark them read.
- Add admin role (allowlisted Principals) and admin dashboard showing totals (registered vehicles, lost reports) plus invitation token issuance/usage report; restrict all admin routes/methods to admins only.
- Integrate the provided “Pasar Digital Community” logo as a static asset in the header and on sign-in/onboarding screens.
- Apply a consistent visual theme appropriate for a security/registry app, using a non-blue/non-purple primary palette across all pages.

**User-visible outcome:** Users can sign in with Internet Identity, onboard only with a one-time invite token, manage their profile, register vehicles with photos, securely transfer ownership using a PIN-gated transfer code, report vehicles as lost/found, and receive in-app notifications. Admins can manage invite tokens and view key system stats in an admin dashboard.

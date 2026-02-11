# Specification

## Summary
**Goal:** Make invite links provide one-click onboarding by automatically capturing and applying the invite token (no manual token entry), with English-only UI messaging.

**Planned changes:**
- Update onboarding invite flow to read `inviteToken` from the onboarding URL, auto-apply it, and hide any required invite-token input when a token is available.
- Persist the captured invite token for the session and remove the `inviteToken` parameter from the address bar after capture (without a page reload), so sign-in/navigation doesn’t lose the token.
- Update `OnboardingInvitePage.tsx` to use English-only labels/toasts/errors, including clear English messaging when no token is available and when token validation fails (invalid/expired/used).
- Update `AdminInviteTokensPage.tsx` “Copy Link” (and post-generate auto-copy) to copy an invite link that works with the new auto-apply onboarding behavior, and ensure related toasts are English-only.
- Keep backend validation semantics unchanged; frontend continues calling `completeOnboarding(inviteToken, profile)` using the token sourced from URL/session.

**User-visible outcome:** Users can click an admin-provided invite link and go straight to the registration form with the token applied automatically; they only fill in profile details. If the token is missing or invalid, they see clear English guidance/errors.

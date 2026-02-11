# Specification

## Summary
**Goal:** Allow normal users to complete onboarding with a valid invite token without requiring admin authorization, and improve onboarding error messages so raw backend authorization errors are not shown to end users.

**Planned changes:**
- Backend: Adjust `completeOnboarding(inviteToken, profile)` so non-admin users with a valid, unused invite token can be assigned the `#user` role without triggering `Unauthorized: Only admins can assign user roles`, while preserving the special allowlisted first-admin onboarding flow (allowlisted principal can onboard with an empty token).
- Frontend: Update `/onboarding` error handling to replace any authorization-related onboarding failures with a clear, actionable English message (without mentioning admin role assignment), while keeping existing messaging for invalid/used tokens and already-onboarded users.

**User-visible outcome:** Users can register successfully using a valid invite token without needing admin approval, and if registration fails due to authorization, they see a clear English message instead of the raw backend error.

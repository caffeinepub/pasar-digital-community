# Specification

## Summary
**Goal:** Make onboarding registration succeed for new non-admin users and improve debuggability of onboarding failures (including fixing broken PWA manifest icons).

**Planned changes:**
- Backend: update onboarding logic so newly authenticated non-admin users can successfully complete onboarding (create profile) without an invite token or relying on an already-onboarded allowlist admin, while preserving the “first allowlist admin claims admin role” special case.
- Frontend: improve onboarding submit flow observability (trace start/finish) so Register reliably triggers the React Query mutation and an actor call attempt (or a clear “actor not available” message).
- Frontend: improve onboarding error handling to preserve/log the raw backend error payload and display a more specific UI message when available instead of always the generic registration failure.
- Frontend: regenerate/fix the PWA icon PNG assets referenced by the manifest/index so they load without console warnings at the existing paths under `/assets/generated/`.

**User-visible outcome:** Users can complete account registration/onboarding successfully without an invite token; when onboarding fails, the UI shows a more specific error and developers can see the underlying error in console logs and clear submit tracing; PWA icons load correctly without browser console warnings.

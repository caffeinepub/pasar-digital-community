# Specification

## Summary
**Goal:** Rebuild and redeploy the existing application to recover from the stopped backend canister (IC0508) so the app can initialize normally again.

**Planned changes:**
- Trigger a new build and redeploy of the current codebase (no functional feature changes).
- Post-deploy validation: confirm the backend canister is running and startup initialization no longer fails with IC0508 canister-stopped errors.
- Verify the existing startup bootstrap error + retry flow still works: on init failure show the error screen, and “Retry Connection” attempts initialization again without leaving the UI stuck loading.

**User-visible outcome:** Opening the app proceeds past startup and shows the Sign In screen for logged-out users; if initialization fails, the app shows a clear error screen and “Retry Connection” reliably retries initialization.

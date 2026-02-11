# Specification

## Summary
**Goal:** Add repository guardrails to prevent unintended code changes during feature additions by introducing explicit change-control policy, automated quality gates, contract checks, minimal regression tests, and lightweight versioning.

**Planned changes:**
- Add an in-repo change-control policy (markdown) defining protected/stable contracts (backend public API/Candid surface, auth bootstrap flow, routing) plus a mandatory review checklist and verification steps.
- Add or update a PR template (or equivalent contributor checklist) that references the change-control policy so it is consistently followed.
- Introduce automated frontend quality gates (local + CI) covering TypeScript typecheck, lint, formatting check, and a minimal test runner, with a single command to run them all.
- Add a backend API contract check command and CI gate that detects unintended Candid/public interface changes unless an explicit artifact update/acknowledgement is made.
- Add minimal frontend smoke/regression tests for key existing flows (auth/bootstrap gate, core route rendering, one representative data-fetch flow) and include them in the quality-gates command.
- Add lightweight release/versioning discipline: a CHANGELOG file, a frontend-visible version string from a single canonical source, and a backend version/build identifier (or documented rationale for frontend-only versioning).

**User-visible outcome:** The app behavior remains stable during feature work; contributors follow a clear checklist, CI/local commands catch type/lint/format/test issues, unintended backend API changes are blocked unless explicitly updated, and users can see an app version while changes are tracked in a changelog.

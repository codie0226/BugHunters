---
title: localStorage as the only persistence layer in v1
date: 2026-06-10
status: Accepted
---

# 2026-06-10 — localStorage as the only persistence layer in v1

## Context
FR-4 and the locked assumptions require single-player, client-only progress with no
accounts, no server, no analytics. The save payload is small (a few hundred bytes) and
written at most a handful of times per session.

## Decision
We will persist GameState to `window.localStorage` under a single key
`bug-hunters:save:v1` as a JSON blob with a `version: number` field. On launch we read,
schema-validate, and either resume or discard. We treat `localStorage` failures
(disabled / quota / private mode) as a non-fatal degraded mode: the game runs in
memory and shows a non-blocking notice.

## Alternatives considered
- **IndexedDB.** Async API, transaction overhead, larger code surface — unjustified for
  a < 1 KB payload.
- **Cookies.** Sent on every request (none here), 4 KB cap, no advantage.
- **Server-side accounts.** Explicitly out of scope per spec assumptions.

## Consequences
- Trivial to implement and test; trivial to inspect during dev.
- No cross-device progress (acceptable for v1).
- A schema change requires a `version` bump; v1 ships with no migrations, so existing
  saves are discarded on bump. We accept that and surface it as a notice (AC-15).

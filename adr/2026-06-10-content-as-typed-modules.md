---
title: Author content as typed TypeScript modules, not raw JSON
date: 2026-06-10
status: Accepted
---

# 2026-06-10 — Author content as typed TypeScript modules, not raw JSON

## Context
FR-6.1 requires content in human-editable data files bundled with the build. The
edge-case rules (FR §Edge cases — "tied/ambiguous answer correctness") require an
invariant: exactly one `optimal` per encounter. JSON gives us no compile-time check;
TypeScript does.

## Decision
We will author monsters and encounters as `.ts` modules that `satisfies` the domain
types in `src/game/types.ts`. A small `validateContent()` runs at module load in dev
(and in a unit test unconditionally) to assert per-encounter invariants (exactly one
optimal; 3–4 options; non-empty Korean text; monster refs resolve). Violations log a
console warning at runtime (per spec) and fail the unit test in CI.

## Alternatives considered
- **JSON files.** The spec mentions JSON; we treat that as "human-editable data" rather
  than a strict file-format requirement. JSON loses type safety and would force
  duplicate runtime validation code.
- **YAML / TOML.** Adds a parser dependency for no editorial benefit.

## Consequences
- Authors get autocomplete and compile errors for malformed content.
- Slightly higher bar for non-developer contributors (must edit `.ts`), acceptable
  for v1 where the project owner authors content.
- Migrating to JSON later is mechanical (the types already exist).

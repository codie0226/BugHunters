---
title: Multiple-choice answer combat (no code editor) in v1
date: 2026-06-10
status: Accepted
---

# 2026-06-10 — Multiple-choice answer combat (no code editor) in v1

## Context
The core verb is "use CS knowledge as a weapon." The spec asks how the player expresses
that knowledge in combat. v1 must ship a credible playable demo on a tight scope.

## Decision
We will model every turn as selecting one of 3–4 pre-authored answer options. Each
option carries an authored `correctness` tag and an `effectiveComplexity` label that
the damage formula reads directly. No free-form text input, no embedded code editor,
no drag-and-drop ordering.

## Alternatives considered
- **In-browser code editor (Monaco / CodeMirror) with sandboxed execution.** Highest
  fidelity to the fantasy, but requires a sandbox (Web Worker + AST checks or Pyodide),
  test harnesses per problem, and content authoring that doubles the cost per
  encounter. Wrong scope for the MVP gate.
- **Drag-and-drop "build the algorithm."** Better than buttons for engagement, worse
  for authoring throughput and keyboard accessibility (AC-12). Deferred.
- **Free-text answer with fuzzy matching.** Pedagogically noisy; punishes typos.

## Consequences
- Authoring cost stays low; the bar of 5 encounters + ≥ 15 answers is reachable.
- Keyboard accessibility (AC-12) is straightforward — a list of buttons.
- The "feels like real coding" ceiling is lower; v2 may layer a code-editor mode on top
  of the same encounter schema (an `answerMode` field), which we will record as a new
  ADR superseding this one when we ship it.

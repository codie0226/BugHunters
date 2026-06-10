---
title: React + Vite + TypeScript for the MVP UI
date: 2026-06-10
status: Accepted
---

# 2026-06-10 — React + Vite + TypeScript for the MVP UI

## Context
The MVP is a single-player, turn-based, DOM-driven game with no real-time rendering
needs and no backend. We need a stack that ships a small static bundle quickly, gives
us strict typing on a content schema authored by hand, and is well-understood by
contributors. The spec (assumptions, MEDIUM) accepts React + Vite + TypeScript as the
default.

## Decision
We will build the MVP as a React 18 single-page app, bundled with Vite, written in
TypeScript with `strict` enabled. UI is plain DOM with CSS; no canvas, no game engine.

## Alternatives considered
- **Plain HTML + vanilla TS.** Smaller bundle, but no component model and no ecosystem
  for testing the UI; we would rebuild what React gives us.
- **Phaser / PixiJS (canvas).** Overkill for turn-based DOM combat with emoji art;
  raises bundle size and learning curve with no v1 payoff. Reconsider if v2 art
  direction demands sprite animation.
- **Next.js / Remix.** Pulls in SSR concerns we do not need for a static, client-only
  game. Slower cold-start dev experience than Vite.
- **Svelte / SolidJS.** Smaller runtimes, but smaller contributor pool and fewer
  off-the-shelf testing patterns; React wins on ecosystem at the MVP cost ceiling.

## Consequences
- Faster path to a playable demo; familiar component + hooks model.
- Bundle includes React (~45 KB gz); still well under the 1.5 MB NFR target (shipped at 57 KB gz).
- We accept that introducing real-time/animated combat later may require migrating to
  canvas; we will write a new ADR then.

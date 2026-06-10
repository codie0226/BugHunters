---
title: Static-site hosting on GitHub Pages for the v1 demo
date: 2026-06-10
status: Accepted
---

# 2026-06-10 — Static-site hosting on GitHub Pages for the v1 demo

## Context
The game has no backend, no auth, no analytics. NFRs require a static-deployable
artifact. The spec defaults the v1 hosting target to GitHub Pages.

## Decision
We will deploy the Vite build output (`dist/`) to GitHub Pages via a GitHub Actions
workflow triggered on push to `main`. We will set Vite's `base` to `'./'` so asset
URLs are relative and resolve correctly under any GitHub Pages subpath.

**Prerequisite:** the repository's Pages source must be set to "GitHub Actions" in
Settings → Pages before the deploy workflow will succeed. This is a one-time manual
repo configuration step, not a code change.

## Alternatives considered
- **Netlify / Vercel / Cloudflare Pages.** Equivalent capability; GitHub Pages is the
  spec default and removes a third-party signup from the demo path.
- **Self-hosted.** No operational team; unjustified.

## Consequences
- Zero hosting cost, zero ops.
- We accept the GitHub Pages constraints (no server-side redirects, no edge functions)
  — none of which v1 needs.
- A custom domain is a future config change, not a code change.

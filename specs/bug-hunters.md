---
title: Bug Hunters — Code Survival RPG (MVP slice)
date: 2026-06-10
status: Delivered
---

# 2026-06-10 — Bug Hunters: Code Survival RPG (MVP slice)

## Objective

Build a browser-playable, single-player MVP of **"Bug Hunters: 코드 생존 RPG"** — a
learning-game that recasts CS fundamentals (algorithms, data structures, debugging) as a
turn-based RPG. The player explores a tiny world map, enters a tutorial "dungeon" (CS
problem), fights "bug monsters" by choosing the **correct algorithm / data structure** in
combat, earns XP, and progresses. The MVP exists to validate the core fantasy — *"my CS
knowledge is the weapon"* — with the smallest playable slice that proves the loop is fun
and pedagogically useful. The full vision (co-op raids, skill trees per CS domain, Big-O
crit system, Git-merge raids, hotfix timed events) is **explicitly out of scope for v1**;
this spec carves out only what is needed to ship a credible playable demo.

## MVP scope (locked)

The MVP is a **single-player, single-session, locally-saved browser game** containing:

1. **One world map screen** with three nodes visible: `Tutorial Town` → `Loop Caverns
   (tutorial dungeon)` → `Boss: 무한루프 유령 (Infinite-Loop Wraith)`. Only the first two
   are playable in v1; the boss node is the v1 victory condition.
2. **One tutorial dungeon** (`Loop Caverns`) containing exactly **5 encounters**: 3 minor
   bug-monsters + 1 mini-boss + 1 final boss (the Infinite-Loop Wraith).
3. **Three bug-monster archetypes** in v1:
   - `Null Slime` (teaches null/None handling)
   - `Off-by-One Imp` (teaches loop boundaries / indexing)
   - `Infinite-Loop Wraith` (teaches termination conditions) — final boss
4. **Combat as multiple-choice algorithmic reasoning.** Each encounter presents:
   - a short problem statement (Korean text, with a small code/pseudo-code snippet),
   - 3–4 candidate answers (e.g., "use a hash map (O(1) lookup)", "linear scan (O(n))",
     "sort then binary search (O(n log n))", "nested loop (O(n²))"),
   - The player selects one answer per turn. The correctness + Big-O of the chosen answer
     determines damage dealt vs. damage taken (see §Functional requirements).
5. **A linear progression model**: XP, player level (1–5), and HP. **No skill tree, no
   inventory, no equipment** in v1.
6. **Local-only persistence** via `localStorage`. No accounts, no server, no network play.
7. **Korean-only UI text** in v1, with strings centralized in a single locale file to make
   later i18n a refactor, not a rewrite.
8. **Desktop browser first** (Chrome / Firefox / Safari latest), with layout that does not
   break on a mobile viewport but is not touch-optimized.

Anything not enumerated above — co-op raids, Git-merge mechanics, hotfix timer events,
skill trees, multi-domain world map, badges/titles, portfolio integration, real code
editor input — is **deferred to v2+**.

## User stories

- As a CS student, I want to fight a "bug monster" by picking the right algorithm so that
  I feel my coursework knowledge has immediate, visible payoff.
- As a CS student, I want to see my wrong answers explained briefly after combat so that a
  miss becomes a learning moment, not a dead end.
- As a casual visitor, I want to open the game URL and start playing within seconds with
  no signup so that friction does not kill curiosity.
- As a returning player, I want my progress (current node, level, XP, HP) preserved
  between sessions on the same browser so that I can come back later.
- As a player who beats the tutorial dungeon, I want a clear "you cleared v1" screen so
  that I know I have completed the available content.
- As a player who loses all HP, I want to retry the current encounter (or the dungeon)
  without losing all progress so that failure feels like learning, not punishment.

## Functional requirements

### FR-1 World map & navigation
1.1 The game opens to a **title screen** with a single "시작 (Start)" button and, if a
save exists, a "이어하기 (Continue)" button.
1.2 After "Start", the player sees a **world map** with three nodes connected by a path:
`Tutorial Town`, `Loop Caverns`, `Boss Lair`.
1.3 Only the next unvisited node along the path is selectable; earlier completed nodes are
re-enterable; later locked nodes are visually distinct and not clickable.
1.4 Entering `Loop Caverns` begins a linear sequence of 5 encounters; the player cannot
exit mid-dungeon except via defeat.

### FR-2 Combat loop
2.1 An **encounter screen** shows: monster name & sprite/glyph, monster HP bar, player HP
bar, the problem statement (Korean), an optional code snippet, and 3–4 answer choices.
2.2 The player selects exactly one answer per turn. The system resolves the turn
immediately (no real-time element in v1).
2.3 Each answer is tagged in content data with: `correctness ∈ {optimal, acceptable,
wrong}` and an `effectiveComplexity` label (e.g., `O(1)`, `O(log n)`, `O(n)`, `O(n log
n)`, `O(n²)`).
2.4 Damage rules (v1, deterministic — no RNG):
  - `optimal` answer → player deals `BASE_DMG × complexityMultiplier` to monster, takes 0
    damage. Multiplier: `O(1)=3.0, O(log n)=2.5, O(n)=2.0, O(n log n)=1.5, O(n²)=1.0`.
  - `acceptable` answer → player deals `BASE_DMG × complexityMultiplier × 0.5`, takes
    `MONSTER_DMG × 0.5`.
  - `wrong` answer → player deals 0, takes full `MONSTER_DMG`.
2.5 After every answer, an **explanation panel** displays 1–3 sentences of feedback
authored per-answer (why this choice is optimal/wrong, what the Big-O implies).
2.6 Monster is defeated when HP ≤ 0; the next encounter loads automatically. Player is
defeated when HP ≤ 0; game transitions to the **defeat screen** (FR-5).
2.7 `BASE_DMG`, `MONSTER_DMG`, monster max HP, and player max HP are tunable constants
in content data; v1 ships with values that let an "all-optimal" run clear the dungeon in
the designed number of turns (designer-tuned, not specified here).
2.8 **No re-attempt per encounter.** Once an answer is submitted, damage resolves; the
player cannot retry the same question without losing the encounter and using the defeat
→ retry flow (FR-5.2). "You picked, you eat the damage" is the intended teaching pressure.

### FR-3 Progression
3.1 Player has: `level` (int, 1–5), `xp` (int), `hp` (int), `maxHp` (int).
3.2 Defeating a bug-monster grants XP defined per monster in content data.
3.3 Crossing an XP threshold raises `level` by 1; `maxHp` increases by a fixed amount; HP
is fully restored on level-up.
3.4 Between encounters within a dungeon, the player does **not** auto-heal (so HP
management matters). On entering a dungeon afresh, HP is restored to `maxHp`.
3.5 v1 has no skill tree, no equipment, no consumables, no currency.

### FR-4 Persistence
4.1 Game state (current map node, dungeon progress index, level, xp, hp/maxHp) is
serialized to `localStorage` after every encounter resolution and every map transition.
4.2 On launch, if a save is present, "Continue" loads that state; otherwise the game
starts a new run.
4.3 A "처음부터 다시 (Restart)" option on the title screen wipes the save after a
confirmation dialog.
4.4 The save payload carries a `version` field; on version mismatch the save is
**discarded** (no migration in v1) and the user is shown a non-blocking notice.

### FR-5 Win / loss screens
5.1 Defeating the Infinite-Loop Wraith transitions to a **victory screen** with: a
clear-time stat (wall-clock time since first encounter entry of that run), total correct
vs. incorrect answer counts, and a "다시 도전" button that resets dungeon progress but
keeps level/xp.
5.2 Losing all HP transitions to a **defeat screen** with: the encounter the player lost
on, the correct answer + explanation, and a "재도전 (Retry encounter)" button that
restores HP to `maxHp` and reloads that encounter.
5.3 Defeat does not reduce level/xp in v1.

### FR-6 Content authoring
6.1 All problems, answers, explanations, monsters, and dungeon structure live in
human-editable data files (JSON) bundled with the build; no CMS, no runtime fetch from
a backend in v1.
6.2 The content schema supports: monster definition (id, name, maxHp, dmg, xpReward,
sprite/glyph reference), encounter definition (id, monster ref, problem text, code
snippet, answer list), answer entry (text, correctness, complexity, explanation).
6.3 v1 ships with at minimum: 3 monster definitions, 5 encounter definitions, ≥ 15 answer
entries total (3–4 per encounter), all Korean text reviewed for accuracy.

### FR-7 Accessibility & basic UX
7.1 All interactive elements are reachable by keyboard (Tab/Enter/arrow keys for answer
selection).
7.2 Colour is never the sole signal of correctness (after-answer feedback uses text +
icon, not only red/green).
7.3 Text contrast meets WCAG AA on the chosen palette.
7.4 No audio is required in v1; if audio is added, it must be mute-toggleable from the
title screen. v1 ships **without audio**.

### FR-8 Onboarding
8.1 The first encounter doubles as the tutorial. On the player's first-ever launch, a
lightweight help overlay explains the combat verbs (answer choice, HP bars, Big-O
multiplier, explanation panel) and can be dismissed. The overlay does not reappear on
subsequent launches unless the save is reset.

## Edge cases

- **Save corruption / schema mismatch.** If `localStorage` payload fails to parse or
  fails schema validation, the game discards it, shows a non-blocking notice, and starts
  a fresh run.
- **`localStorage` unavailable / disabled** (private browsing, quota exceeded). The game
  still runs as an in-memory session; the title screen shows a notice that progress will
  not persist.
- **Player refreshes mid-encounter.** State is restored to the start of the most recently
  entered encounter with HP as it was on entry; mid-turn state is not preserved.
- **Tied/ambiguous answer correctness.** Each encounter must have exactly one `optimal`;
  if content data violates this invariant the game logs a console warning and treats the
  first `optimal` as canonical (content authoring bug, not a player-facing flow).
- **No save vs. existing save.** "Continue" is hidden when no save exists.
- **Player reaches the dungeon at level 1 with full HP and answers all questions
  wrong.** They die before clearing; the retry loop (FR-5.2) must let them progress
  rather than soft-lock.
- **Mobile viewport (≤ 480 px wide).** Layout must remain readable and not horizontally
  scroll; touch targets ≥ 44 px even if not "touch-optimized."
- **Korean text rendering.** Fonts must include full Hangul coverage; no tofu boxes for
  any character in the shipped content.
- **Browser without ES2020+ support.** Out of scope; game may display "지원되지 않는
  브라우저" notice.

## Acceptance criteria

### AC-1 Cold start
- **Given** a browser with no prior save for this origin, **when** the user opens the
  game URL, **then** the title screen renders within 3 seconds on a typical broadband
  connection, "시작" is visible, and "이어하기" is hidden.

### AC-2 New game to first combat
- **Given** the title screen, **when** the user clicks "시작", **then** the world map
  appears with `Tutorial Town` selectable, `Loop Caverns` selectable, and `Boss Lair`
  visually locked.

### AC-3 Combat — optimal answer
- **Given** the player is in an encounter with full HP and the monster is at full HP,
  **when** the player selects the answer tagged `optimal`, **then** the monster's HP
  decreases by `BASE_DMG × complexityMultiplier` (rounded per the spec), the player's HP
  does **not** decrease, and the explanation panel for that answer is shown before the
  next turn.

### AC-4 Combat — wrong answer
- **Given** the player is in an encounter, **when** the player selects an answer tagged
  `wrong`, **then** the monster's HP is unchanged, the player's HP decreases by
  `MONSTER_DMG`, and the explanation panel shows the wrong-answer rationale.

### AC-5 Defeating a monster advances the dungeon
- **Given** a monster's HP reaches 0, **when** the resolution animation/text finishes,
  **then** the next encounter in the dungeon loads automatically, the player's HP carries
  over (no heal), and XP is granted.

### AC-6 Level-up
- **Given** the player gains XP that crosses a level threshold, **when** the XP grant
  resolves, **then** the level indicator increments by 1, `maxHp` increases by the
  configured amount, HP is restored to `maxHp`, and a "레벨 업" toast appears for ≥ 1.5
  seconds.

### AC-7 Defeat → retry
- **Given** the player's HP reaches 0 in an encounter, **when** the defeat screen shows
  and the user clicks "재도전", **then** the same encounter reloads with HP at `maxHp`
  and the monster at its full HP.

### AC-8 Victory — clearing the Wraith
- **Given** the player defeats the Infinite-Loop Wraith, **when** the encounter resolves,
  **then** the victory screen is shown with clear-time, correct-answer count, and
  wrong-answer count populated, and the save reflects "dungeon cleared."

### AC-9 Persistence across reload
- **Given** the player has completed at least one encounter and is on the world map,
  **when** the browser tab is closed and reopened to the game URL, **then** the title
  screen shows "이어하기", and clicking it restores: current map node, level, xp, hp,
  maxHp, and dungeon progress index identical to the saved state.

### AC-10 Save reset
- **Given** a save exists, **when** the user clicks "처음부터 다시" and confirms the
  dialog, **then** `localStorage` for this game is cleared, "이어하기" is hidden, and
  starting a new game begins at level 1 in Tutorial Town.

### AC-11 No-localStorage degraded mode
- **Given** a browser with `localStorage` disabled, **when** the user opens the game,
  **then** a non-blocking notice ("진행 상황이 저장되지 않습니다") appears, the game is
  fully playable in-session, and "이어하기" is hidden.

### AC-12 Keyboard play
- **Given** an encounter is on screen, **when** the user presses `Tab` and `Enter` only
  (no mouse), **then** the user can select and submit any answer choice and proceed to
  the next encounter.

### AC-13 Korean rendering
- **Given** the shipped content, **when** the player traverses every encounter in the
  tutorial dungeon, **then** no glyph renders as tofu/`▯` and every UI string is Korean
  (no untranslated English placeholder strings except code snippets, which stay in
  code-form).

### AC-14 First-launch tutorial overlay
- **Given** a browser with no prior save, **when** the player enters the first encounter,
  **then** a help overlay describes combat verbs and is dismissible; **and given** the
  overlay has been dismissed, **when** the player enters any subsequent encounter in the
  same save, **then** the overlay does not reappear.

### AC-15 Save-version mismatch
- **Given** a `localStorage` save whose `version` field does not match the current
  build's expected version, **when** the player opens the game, **then** the save is
  discarded, a non-blocking notice is shown, and the title screen behaves as cold start
  (AC-1).

## Non-functional requirements

- **Performance.** Title screen interactive within 3 s on a 10 Mbps connection on
  mid-range hardware (last-5-year laptop). Per-turn resolution < 100 ms from click to UI
  update. Total initial bundle < 1.5 MB compressed (a target, not a hard gate — the
  intent is "feels instant on a coffee-shop Wi-Fi").
- **Reliability.** No uncaught exceptions during a full clear run; console must be clean
  except for explicit author warnings.
- **Accessibility.** Keyboard-navigable, WCAG AA contrast, no colour-only signals (see
  FR-7).
- **Compatibility.** Latest two versions of Chrome, Firefox, Safari, Edge on desktop.
  Mobile Safari and Chrome Android must render without horizontal scroll at 360 px wide;
  touch interaction is best-effort, not certified.
- **Localization-readiness.** All user-facing strings live in a single locale file keyed
  by string id; switching locales is a future config change, not a refactor.
- **Privacy.** No analytics, no third-party scripts, no cookies in v1. Saves are
  client-only.
- **Build / distribution.** Static-site deployable to any static host; no server runtime
  required.
- **Observability.** Console-only in v1; no remote logging. Errors during save/load are
  surfaced to the user as in-game notices, not silently swallowed.

## Assumptions (all accepted by user — "accept all defaults", 2026-06-10)

Every item below was previously an `[OPEN QUESTION]`. The user accepted the proposed
default for each. No open questions remain.

### HIGH-impact — locked

- `[ASSUMPTION | accepted-by-user]` **MVP scope.** Single-dungeon, single-player,
  no-skill-tree, no-multiplayer slice with 5 encounters and 3 monster archetypes, as
  enumerated in "MVP scope (locked)". No expansion or further trimming.
- `[ASSUMPTION | accepted-by-user]` **Tech stack.** **React + Vite (DOM-only UI),
  TypeScript**, no canvas/game engine, no backend. Static-site build. Rationale: fastest
  path to a DOM-driven turn-based UI with a healthy ecosystem; canvas/Phaser deferred
  until art direction justifies it. An ADR will be authored alongside the plan.
- `[ASSUMPTION | accepted-by-user]` **Combat interaction model.** Multiple-choice answer
  selection (3–4 options per turn). No drag-and-drop, no text entry, no code editor in
  v1.
- `[ASSUMPTION | accepted-by-user]` **Art direction.** **Emoji + CSS shapes / SVG glyphs
  ("programmer art")** in v1. No pixel-art pipeline, no commissioned assets. Each monster
  is rendered as a large emoji/SVG glyph with a name label and HP bar.
- `[ASSUMPTION | accepted-by-user]` **Language scope.** **Korean-only UI** for v1,
  strings centralized in `/src/locale/ko.ts` (or equivalent) keyed by id. English deferred.
- `[ASSUMPTION | accepted-by-user]` **Content authoring & volume.** Hand-authored JSON
  committed to the repo. **5 encounters + ≥ 15 answer entries** at launch is the bar.
  Author: project owner with AI-assisted drafting allowed; Korean text reviewed by
  project owner before merge.
- `[ASSUMPTION | accepted-by-user]` **Multiplayer.** Deferred entirely to v2+. No co-op,
  no Git-merge raids, no networking in v1.
- `[ASSUMPTION | accepted-by-user]` **"v1 done" success criteria.** A player can: open
  the URL cold, clear the tutorial dungeon, defeat the Infinite-Loop Wraith, see the
  victory screen, and have progress persist across reloads — with all acceptance criteria
  (AC-1 through AC-15) passing. No external playtest threshold, no retention metric
  gating v1.

### MEDIUM-impact — locked

- `[ASSUMPTION | accepted-by-user]` **Target platform priority.** Desktop browser first;
  mobile-responsive (no horizontal scroll ≥ 360 px wide, touch targets ≥ 44 px) but not
  touch-optimized.
- `[ASSUMPTION | accepted-by-user]` **Accounts / progression backend.** None. Anonymous
  `localStorage` only. No auth, no DB, no server in v1.
- `[ASSUMPTION | accepted-by-user]` **Big-O crit / damage formula.** Multipliers
  `O(1)=3.0, O(log n)=2.5, O(n)=2.0, O(n log n)=1.5, O(n²)=1.0` as proposed; deterministic,
  no RNG. Designer may re-tune `BASE_DMG` / `MONSTER_DMG` / monster HP without spec
  changes.
- `[ASSUMPTION | accepted-by-user]` **Tutorial / onboarding.** First encounter doubles
  as tutorial with a dismissible first-launch help overlay (FR-8, AC-14). No separate
  scripted tutorial sequence.
- `[ASSUMPTION | accepted-by-user]` **Wrong-answer pedagogy.** No re-attempt within an
  encounter (FR-2.8). Wrong answer → take damage → see explanation → next turn.
- `[ASSUMPTION | accepted-by-user]` **Audio / music.** None in v1.
- `[ASSUMPTION | accepted-by-user]` **Analytics.** None in v1.
- `[ASSUMPTION | accepted-by-user]` **Hosting target.** Static-site host; default to
  **GitHub Pages** for the v1 demo (revisable at ship time without spec change since any
  static host satisfies the NFR).

### LOW-impact — locked

- `[ASSUMPTION | accepted-by-user]` **Branding / title.** Full title "Bug Hunters: 코드
  생존 RPG" used in UI; short codename "Bug Hunters" acceptable in repo / dev contexts.
- `[ASSUMPTION | accepted-by-user]` **Save format versioning.** Save payload carries a
  `version` field; mismatch → discard with non-blocking notice (FR-4.4, AC-15). No
  migration path in v1.
- `[ASSUMPTION | accepted-by-user]` **Restart confirmation copy.** Designer choice;
  Korean wording finalized during implementation, not gated by spec.
- `[ASSUMPTION | accepted-by-user]` **License / open-source posture.** v1 ships as open
  source under the repo's existing LICENSE; game content (problems, explanations)
  licensed identically to the code.
- `[ASSUMPTION | accepted-by-user]` **Domain / URL.** Deferred to ship stage; not
  load-bearing for spec. Default: project's GitHub Pages URL.
- `[ASSUMPTION | accepted-by-user]` **In-game error reporting.** No "report this
  encounter" link in v1.

## Open questions

*None.* All previously-flagged decisions have been resolved as accepted defaults above.

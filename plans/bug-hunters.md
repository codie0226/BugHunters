---
title: Bug Hunters MVP — Implementation Plan
date: 2026-06-10
spec: specs/bug-hunters.md
branch: feat/bug-hunters
---

# 2026-06-10 — Bug Hunters MVP — Implementation Plan

## Overview

Build the v1 MVP of "Bug Hunters: 코드 생존 RPG" as a static React + Vite + TypeScript
SPA that satisfies AC-1 through AC-15 of `specs/bug-hunters.md`. The player opens the
URL, sees a Korean title screen, walks a three-node world map, clears the five-encounter
Loop Caverns dungeon by picking correct algorithmic answers (Big-O drives a
deterministic damage multiplier), levels 1→5, and persists progress to `localStorage`.

**In scope.** Project skeleton; title / world-map / encounter / level-up / victory /
defeat screens; combat reducer with Big-O multiplier table; linear XP curve; content
JSON for 3 monsters + 5 encounters + ≥15 answers; Korean locale file; localStorage save
with version field + degraded in-memory mode; first-launch tutorial overlay; unit tests
(damage, save/load, level-up) + integration test (full dungeon clear); ESLint, Prettier,
Vitest, React Testing Library; GitHub Pages deploy workflow.

**Out of scope (v2+).** Co-op, Git-merge raids, hotfix timer events, skill trees,
inventory/equipment, multi-domain world map, real code editor input, audio, analytics,
non-Korean locales, save migration. Do not add affordances for these.

**Branch.** `feat/bug-hunters`.

## Architecture & Design

### Top-level structure

```
/  (worktree root)
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  index.html
  .eslintrc.cjs
  .prettierrc.json
  .prettierignore
  .gitignore               (extend existing — add node_modules, dist, coverage)
  vitest.config.ts         (or merged into vite.config.ts via /// <reference types>)
  .github/workflows/ci.yml
  .github/workflows/deploy.yml
  public/
    favicon.svg
  src/
    main.tsx
    App.tsx
    styles/
      globals.css
      tokens.css           (CSS custom properties: palette + spacing; WCAG AA tokens)
    locale/
      ko.ts                (single source of truth for UI strings; keyed by string id)
      strings.ts           (typed `t(id)` helper; throws on missing id in dev)
    content/
      monsters.ts          (Monster[] — typed, not raw JSON, so TS catches author errors)
      encounters.ts        (Encounter[] in dungeon order)
      dungeon.ts           (Dungeon definition referencing encounters)
      tuning.ts            (BASE_DMG, MONSTER_DMG default fallback, XP curve, complexity table)
    game/
      types.ts             (all domain types — see "Content data model")
      damage.ts            (pure: resolveTurn(answer, player, monster, tuning) → TurnResult)
      progression.ts       (pure: applyXp(state, xpGained) → {state, leveledUp})
      reducer.ts           (GameState + Action union + reducer; pure)
      selectors.ts         (derived views: currentEncounter, isDungeonCleared, etc.)
      saveSchema.ts        (SAVE_VERSION constant, SavePayload type, validate())
      save.ts              (loadSave / writeSave / clearSave; wraps localStorage with try/catch
                            and an in-memory fallback flag)
    hooks/
      useGameState.ts      (useReducer + persist-on-change effect)
      useKeyboardNav.ts    (Tab/Enter wiring for answer choices; AC-12)
      useFirstLaunch.ts    (tracks tutorial overlay dismissal in save)
    components/
      App/Router.tsx       (route by GameState.screen — no react-router; switch on union)
      TitleScreen.tsx
      WorldMap.tsx
      MapNode.tsx
      Dungeon.tsx          (renders the active encounter inside the dungeon shell)
      Encounter.tsx        (problem, code snippet, answer list)
      CombatScreen.tsx     (HP bars, monster glyph, turn resolution)
      AnswerChoice.tsx     (button; correctness-revealed state after submit)
      ExplanationPanel.tsx
      MonsterSprite.tsx    (emoji/SVG glyph)
      HpBar.tsx
      StatusBar.tsx        (level, xp, hp/maxHp; sticky during dungeon)
      LevelUpToast.tsx     (≥ 1.5 s; AC-6)
      VictoryScreen.tsx
      DefeatScreen.tsx
      TutorialOverlay.tsx  (AC-14)
      Notice.tsx           (non-blocking notice for save-disabled / version-mismatch)
      ConfirmDialog.tsx    (Restart confirmation; AC-10)
    test/
      setup.ts             (@testing-library/jest-dom matchers; jsdom polyfills)
      fixtures/
        encounters.fixture.ts
        save.fixture.ts
      damage.test.ts
      progression.test.ts
      reducer.test.ts
      save.test.ts
      saveSchema.test.ts
      Encounter.test.tsx
      TitleScreen.test.tsx
      WorldMap.test.tsx
      DefeatScreen.test.tsx
      VictoryScreen.test.tsx
      tutorialOverlay.test.tsx
      keyboardNav.test.tsx
      dungeonRun.integration.test.tsx
```

### Data / control flow

- **Single source of truth:** `useReducer` in `App.tsx` holds `GameState`; all UI
  reads from a `GameStateContext` and dispatches `Action`s. No prop-drilling of state.
- **Screens** are a tagged union on `state.screen` (`'title' | 'map' | 'encounter' |
  'levelUp' | 'victory' | 'defeat'`); `Router.tsx` switches on it.
- **Combat resolution is pure.** `damage.resolveTurn` takes the chosen answer and current
  HPs and returns `{ playerHp, monsterHp, monsterDefeated, playerDefeated, dmgDealt,
  dmgTaken }`. The reducer applies the result and decides the next screen.
- **Persistence is a side effect.** A `useEffect` in `useGameState` calls `writeSave`
  whenever `state.screen` becomes `'map'` or whenever an encounter resolves (i.e., on
  reducer actions `ENCOUNTER_RESOLVED` and `MAP_TRANSITION`). FR-4.1.
- **Refresh mid-encounter** (edge case): the saved snapshot is taken at *encounter
  entry*; mid-turn HP is not persisted. `ENCOUNTER_ENTERED` action stores
  `encounterEntryHp` in the save payload.

### New dependencies (justified, pinned at install time)

| Package | Purpose | Version policy |
|---|---|---|
| `react`, `react-dom` | UI runtime | latest 18.x |
| `vite`, `@vitejs/plugin-react` | dev + build | latest 5.x / 4.x |
| `typescript` | type checking | 5.x |
| `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | testing | latest stable |
| `eslint`, `@typescript-eslint/*`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` | lint + a11y | latest stable |
| `prettier`, `eslint-config-prettier` | format | latest stable |

No state library (Redux, Zustand) — `useReducer` + Context is sufficient for one player
in one dungeon. No CSS framework — plain CSS modules / global stylesheet with tokens.
No routing library — screen union covers it.

## Architecture Decisions (ADRs)

### ADRs to add (the implementer creates these files on the branch from this content)

#### `adr/2026-06-10-react-vite-typescript.md`

```
---
title: React + Vite + TypeScript for the MVP UI
date: 2026-06-10
status: Proposed
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
- Bundle includes React (~45 KB gz); still well under the 1.5 MB NFR target.
- We accept that introducing real-time/animated combat later may require migrating to
  canvas; we will write a new ADR then.
```

#### `adr/2026-06-10-localstorage-persistence.md`

```
---
title: localStorage as the only persistence layer in v1
date: 2026-06-10
status: Proposed
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
```

#### `adr/2026-06-10-static-site-github-pages.md`

```
---
title: Static-site hosting on GitHub Pages for the v1 demo
date: 2026-06-10
status: Proposed
---

# 2026-06-10 — Static-site hosting on GitHub Pages for the v1 demo

## Context
The game has no backend, no auth, no analytics. NFRs require a static-deployable
artifact. The spec defaults the v1 hosting target to GitHub Pages.

## Decision
We will deploy the Vite build output (`dist/`) to GitHub Pages via a GitHub Actions
workflow triggered on push to `main`. We will set Vite's `base` to the repo path so
asset URLs resolve correctly under `https://<user>.github.io/<repo>/`.

## Alternatives considered
- **Netlify / Vercel / Cloudflare Pages.** Equivalent capability; GitHub Pages is the
  spec default and removes a third-party signup from the demo path.
- **Self-hosted.** No operational team; unjustified.

## Consequences
- Zero hosting cost, zero ops.
- We accept the GitHub Pages constraints (no server-side redirects, no edge functions)
  — none of which v1 needs.
- A custom domain is a future config change, not a code change.
```

#### `adr/2026-06-10-multiple-choice-combat.md`

```
---
title: Multiple-choice answer combat (no code editor) in v1
date: 2026-06-10
status: Proposed
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
```

#### `adr/2026-06-10-content-as-typed-modules.md`

```
---
title: Author content as typed TypeScript modules, not raw JSON
date: 2026-06-10
status: Proposed
---

# 2026-06-10 — Author content as typed TypeScript modules, not raw JSON

## Context
FR-6.1 requires content in human-editable data files bundled with the build. The
edge-case rules (FR §Edge cases — "tied/ambiguous answer correctness") require an
invariant: exactly one `optimal` per encounter. JSON gives us no compile-time check;
TypeScript does.

## Decision
We will author monsters and encounters as `.ts` modules that `satisfies` the domain
types in `src/game/types.ts`. A small `validateContent()` runs at module load (and in
a unit test) to assert per-encounter invariants (exactly one optimal; 3–4 options;
non-empty Korean text). Violations log a console warning at runtime (per spec) and
fail the unit test in CI.

## Alternatives considered
- **JSON files.** Spec mentions JSON; we treat that as "human-editable data" rather
  than a strict file-format requirement. JSON loses type safety and would force
  duplicate runtime validation code.
- **YAML / TOML.** Adds a parser dependency for no editorial benefit.

## Consequences
- Authors get autocomplete and compile errors for malformed content.
- Slightly higher bar for non-developer contributors (must edit `.ts`), acceptable
  for v1 where the project owner authors content.
- Migrating to JSON later is mechanical (the types already exist).
```

### Relevant existing ADRs

None — `adr/README.md` index is empty. The five ADRs above are the first.

## Implementation Steps (ordered)

Each step is sized for a single focused commit. "Verify" lines are the gate that step
is done. Steps are ordered so each compiles and tests pass after it.

### Phase 1 — Skeleton & tooling

1. **Initialize npm project + Vite + React + TS.**
   - Create `package.json` with scripts: `dev`, `build`, `preview`, `test`, `test:watch`,
     `lint`, `format`, `typecheck`.
   - Install deps listed in "New dependencies" with `--save-exact` to pin.
   - Create `vite.config.ts` (React plugin, `base: './'` for relative asset paths so
     the build works under any GitHub Pages subpath).
   - Create `tsconfig.json` (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
     `jsx: react-jsx`, `target: ES2020`, `moduleResolution: bundler`).
   - Create `tsconfig.node.json` for the vite config file.
   - Create `index.html` with `<html lang="ko">`, viewport meta, and Hangul-coverage
     font stack (`'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui,
     sans-serif`).
   - Create `src/main.tsx` and a stub `src/App.tsx` rendering "Bug Hunters" so the dev
     server boots.
   - Extend `.gitignore` with `node_modules/`, `dist/`, `coverage/`, `.vite/`.
   - **Verify:** `npm run dev` starts; `npm run build` succeeds; `npm run typecheck` clean.
   - **Traces:** project foundation for all ACs.

2. **Add ESLint + Prettier configuration.**
   - `.eslintrc.cjs` extends `@typescript-eslint/recommended`, `plugin:react/recommended`,
     `plugin:react-hooks/recommended`, `plugin:jsx-a11y/recommended`, `prettier`.
   - `.prettierrc.json` (2-space indent, single quotes, trailing comma `all`, 100 col).
   - `.prettierignore` excludes `dist`, `coverage`.
   - `package.json` scripts: `lint` runs eslint on `src/**/*.{ts,tsx}`; `format` runs
     prettier write.
   - **Verify:** `npm run lint` clean on the skeleton; `npm run format -- --check` clean.

3. **Add Vitest + React Testing Library.**
   - `vitest.config.ts` (jsdom env, `setupFiles: ['src/test/setup.ts']`, `globals: true`,
     coverage provider v8).
   - `src/test/setup.ts` imports `@testing-library/jest-dom`.
   - Add one smoke test (`App.test.tsx`) asserting App renders.
   - **Verify:** `npm run test -- --run` passes one test.

### Phase 2 — Domain types, content, locale

4. **Define domain types in `src/game/types.ts`.** Concrete shapes — see "Content data
   model" below. Export `Complexity`, `Correctness`, `Answer`, `Monster`, `Encounter`,
   `Dungeon`, `PlayerState`, `GameState`, `Screen`, `Action`, `TurnResult`, `SavePayload`.
   - **Verify:** `tsc --noEmit` clean.
   - **Traces:** FR-2.3, FR-2.4, FR-3.1, FR-6.2.

5. **Add tuning constants in `src/game/tuning.ts`.**
   - `BASE_DMG = 10`, `MONSTER_DMG = 8` (designer-tunable; document as such).
   - `COMPLEXITY_MULTIPLIER: Record<Complexity, number>` exactly per spec FR-2.4:
     `{ 'O(1)': 3.0, 'O(log n)': 2.5, 'O(n)': 2.0, 'O(n log n)': 1.5, 'O(n²)': 1.0 }`.
   - `XP_CURVE: number[]` of length 5 — XP required to reach levels 2..5. Default:
     `[20, 50, 100, 180]` (tunable; 5 encounters at ~10–40 XP each must cover it).
   - `HP_PER_LEVEL = 20`, `BASE_MAX_HP = 50`.
   - **Verify:** unit test (`tuning.test.ts`) asserts the multiplier table matches the
     spec literally and that `XP_CURVE.length === 4` (4 thresholds for levels 1→5).
   - **Traces:** FR-2.4, FR-3.3.

6. **Author Korean locale in `src/locale/ko.ts`.**
   - Export `const ko = { 'title.start': '시작', 'title.continue': '이어하기',
     'title.restart': '처음부터 다시', 'title.restart.confirm': '...', 'map.node.town':
     'Tutorial Town', 'map.node.caverns': 'Loop Caverns', 'map.node.boss': 'Boss Lair',
     'combat.choose': '선택하세요', 'combat.dmgDealt': '...', 'combat.dmgTaken': '...',
     'level.up': '레벨 업', 'victory.title': '...', 'defeat.title': '...',
     'defeat.retry': '재도전', 'save.disabled': '진행 상황이 저장되지 않습니다',
     'save.versionMismatch': '...', 'tutorial.title': '...', 'tutorial.body': '...',
     'tutorial.dismiss': '확인' } as const`.
   - `strings.ts` exports `t(id: keyof typeof ko): string` that returns the string and
     in dev (`import.meta.env.DEV`) throws on missing keys.
   - **Verify:** unit test asserts every `StringId` used in components exists in `ko`
     (enforced by `keyof typeof ko` type).
   - **Traces:** FR-7 (Korean-only), AC-13, NFR localization-readiness.

7. **Author content in `src/content/`.**
   - `monsters.ts`: 3 monster records — Null Slime (maxHp 30, dmg 6, xp 15, emoji 🟢),
     Off-by-One Imp (maxHp 45, dmg 8, xp 25, emoji 👹), Infinite-Loop Wraith (maxHp 80,
     dmg 12, xp 60, emoji 👻).
   - `encounters.ts`: 5 encounters in order — 3 minor (Slime, Imp, Slime variant) + 1
     mini-boss (Imp variant) + 1 final (Wraith). Each has Korean problem statement, a
     code snippet (kept in code form per AC-13), 3–4 answers tagged
     `{ correctness, complexity, explanation }`. Exactly one `optimal` per encounter.
   - `dungeon.ts`: `LOOP_CAVERNS: Dungeon = { id, name: t('map.node.caverns'),
     encounterIds: [...] }`.
   - `validateContent.ts`: pure function asserting per-encounter invariants. Called
     once at module load behind `if (import.meta.env.DEV)`; called unconditionally in
     a unit test.
   - **Verify:** `validateContent.test.ts` runs validator over shipped content; asserts
     exactly one optimal per encounter, ≥3 answers, all Korean strings non-empty, every
     monster id referenced exists.
   - **Traces:** FR-6.2, FR-6.3, edge case "tied/ambiguous answer correctness".

### Phase 3 — Pure game logic

8. **Implement `damage.resolveTurn` in `src/game/damage.ts`.**
   - Signature: `resolveTurn(answer: Answer, playerHp: number, monsterHp: number,
     monster: Monster): TurnResult`.
   - Branches on `answer.correctness`. Rounds `Math.round` for whole-number HP. Clamps
     HP at 0. Returns full `TurnResult`.
   - **Verify:** `damage.test.ts` — table-driven tests for every combination of
     correctness × complexity, plus boundary cases (overkill clamps to 0; exact lethal
     hit). See "Test Strategy" for explicit AC mapping.
   - **Traces:** FR-2.4, AC-3, AC-4.

9. **Implement `progression.applyXp` in `src/game/progression.ts`.**
   - Signature: `applyXp(player: PlayerState, xpGained: number, tuning):
     { player: PlayerState; leveledUp: boolean; levelsGained: number }`.
   - Sums xp, walks `XP_CURVE` to compute new level (cap 5), increases `maxHp` by
     `HP_PER_LEVEL` per level, fully restores HP on any level up.
   - **Verify:** `progression.test.ts` — no-level-up case; single level-up; multi-level
     skip; cap at 5 (extra XP retained but level does not exceed 5).
   - **Traces:** FR-3.2, FR-3.3, AC-6.

10. **Implement `reducer.ts` (GameState + actions).**
    - `GameState`: `{ screen: Screen; player: PlayerState; mapState: { unlocked:
      MapNodeId[]; cleared: MapNodeId[] }; dungeonState: { dungeonId; encounterIndex;
      monsterHp; encounterEntryHp } | null; stats: { runStartedAt: number | null;
      correctAnswers: number; wrongAnswers: number }; tutorialDismissed: boolean;
      lastTurn: TurnResult | null; saveDisabled: boolean; pendingNotice: NoticeId |
      null; }`.
    - `Action` union: `START_NEW_GAME`, `CONTINUE_FROM_SAVE`, `SELECT_MAP_NODE`,
      `ENTER_DUNGEON`, `ENCOUNTER_ENTERED`, `SUBMIT_ANSWER`, `ADVANCE_AFTER_TURN`,
      `RETRY_FROM_DEFEAT`, `RESTART_FROM_VICTORY`, `RESET_SAVE`, `DISMISS_TUTORIAL`,
      `DISMISS_NOTICE`, `LOAD_FAILED`.
    - Reducer is pure; calls `resolveTurn` + `applyXp`; transitions `screen` based on
      results (encounter cleared → next encounter or victory; player HP 0 → defeat;
      level-up → levelUp screen with auto-advance after 1.5 s handled by the UI, not
      the reducer).
    - **Verify:** `reducer.test.ts` — state transitions per action; AC-5 (monster
      defeated → next encounter, HP carries, XP granted); AC-7 (retry restores HPs);
      AC-8 (Wraith defeat → victory); AC-10 (reset).
    - **Traces:** FR-2.6, FR-3.4, FR-5.

### Phase 4 — Persistence

11. **Implement save layer in `src/game/saveSchema.ts` + `src/game/save.ts`.**
    - `SAVE_VERSION = 1`. `SAVE_KEY = 'bug-hunters:save:v1'`.
    - `SavePayload` = `{ version: number; player: PlayerState; mapState; dungeonState;
      stats; tutorialDismissed }`. Note: `dungeonState.monsterHp` is reset to the
      monster's `maxHp` on load — only `encounterIndex` and `encounterEntryHp` are
      durable (edge case: refresh mid-encounter restores HP as it was on entry).
    - `validate(payload): payload is SavePayload` checks shape + version.
    - `loadSave(): { kind: 'ok'; payload } | { kind: 'absent' } | { kind: 'corrupt' } |
      { kind: 'versionMismatch' } | { kind: 'unavailable' }`.
    - `writeSave(payload)` swallows quota/access errors and returns a boolean.
    - `clearSave()` removes the key; tolerates unavailable storage.
    - **Verify:** `save.test.ts` mocks `localStorage` (jsdom provides one) — round trip
      ok; corrupt JSON → corrupt; mismatched version → versionMismatch; missing key →
      absent; throws (`Object.defineProperty(window, 'localStorage', { get: () => {
      throw } })`) → unavailable. `saveSchema.test.ts` covers `validate` directly.
    - **Traces:** FR-4, AC-9, AC-11, AC-15, edge cases "save corruption" and
      "localStorage unavailable".

12. **Wire persistence into `useGameState`.**
    - On mount: call `loadSave`. If `ok` → dispatch `CONTINUE_FROM_SAVE` is *not* done
      automatically; we only set `saveAvailable: true` so the title screen shows
      `이어하기`. If `corrupt | versionMismatch` → `clearSave()` and set
      `pendingNotice: 'save.versionMismatch'`. If `unavailable` → `saveDisabled: true`
      and `pendingNotice: 'save.disabled'`. If `absent` → nothing.
    - On state change: `useEffect` writes save when action was `ENCOUNTER_ENTERED`,
      `ADVANCE_AFTER_TURN` with monster defeated, `SELECT_MAP_NODE`, or
      `DISMISS_TUTORIAL`.
    - **Verify:** integration via component tests in Phase 6.

### Phase 5 — Styles & shared UI

13. **Add design tokens + global styles.**
    - `src/styles/tokens.css`: palette (background, surface, text, accent, danger,
      success) verified to meet WCAG AA (≥ 4.5:1 for body text) against the chosen
      background. Spacing scale, radius, touch target min `--touch-min: 44px`.
    - `src/styles/globals.css`: CSS reset, body font stack from index.html, focus
      outline visible (never `outline: none` without a replacement).
    - **Verify:** manual; documented contrast pairs as comments.
    - **Traces:** FR-7.3, NFR accessibility, edge case "Mobile viewport".

14. **Build leaf UI: `HpBar`, `MonsterSprite`, `AnswerChoice`, `ExplanationPanel`,
    `StatusBar`, `Notice`, `ConfirmDialog`, `LevelUpToast`.**
    - `AnswerChoice` is a real `<button>`. After submit, it renders an icon (`✓` /
      `✗` / `~`) *in addition* to colour (FR-7.2).
    - `LevelUpToast` stays visible ≥ 1500 ms (`setTimeout` + state); accept a `onDone`
      callback.
    - Touch targets `min-height: var(--touch-min)`.
    - **Verify:** snapshot-free behavioural tests for `AnswerChoice` (renders correctly,
      shows icon + text on submitted state) and `LevelUpToast` (stays visible ≥ 1.5 s
      using `vi.useFakeTimers()`).
    - **Traces:** FR-7.1, FR-7.2, AC-6, AC-12, edge case "mobile viewport".

### Phase 6 — Screens

15. **Build `TitleScreen`.**
    - Shows "Bug Hunters: 코드 생존 RPG" title, `시작` button (always), `이어하기`
      button (only when `saveAvailable`), `처음부터 다시` button (only when save
      exists). `처음부터 다시` opens `ConfirmDialog` before dispatching `RESET_SAVE`.
    - Surfaces `pendingNotice` via `Notice` component.
    - **Verify:** `TitleScreen.test.tsx` — AC-1 (no save → no 이어하기), AC-10 (restart
      confirmation), AC-11 (save disabled notice), AC-15 (version mismatch notice).
    - **Traces:** FR-1.1, FR-4.2, FR-4.3, AC-1, AC-10, AC-11, AC-15.

16. **Build `WorldMap`.**
    - Three nodes laid out horizontally with connecting path. `Tutorial Town` and
      `Loop Caverns` are clickable; `Boss Lair` is visually locked (greyscale, `aria-
      disabled`). Clicking `Loop Caverns` dispatches `ENTER_DUNGEON`.
    - **Verify:** `WorldMap.test.tsx` — AC-2 (renders three nodes, Boss Lair locked).
    - **Traces:** FR-1.2, FR-1.3, AC-2.

17. **Build `Encounter` + `CombatScreen` + `Dungeon`.**
    - `Dungeon` reads `state.dungeonState` and renders the current `Encounter`.
    - `Encounter` shows monster sprite + name + HP bar, player HP bar, problem text,
      `<pre>` code snippet, list of `AnswerChoice` buttons.
    - On submit: dispatch `SUBMIT_ANSWER`, show `ExplanationPanel`, on Continue
      dispatch `ADVANCE_AFTER_TURN`.
    - First-launch tutorial: if `!tutorialDismissed && first encounter`, render
      `TutorialOverlay`. Dismiss dispatches `DISMISS_TUTORIAL`.
    - Keyboard nav via `useKeyboardNav`: Tab focuses answers; Enter submits focused
      answer; arrow keys move focus among answers.
    - **Verify:** `Encounter.test.tsx` — AC-3, AC-4, AC-5 (encounter resolves and next
      loads), AC-14 (overlay shows first time, hidden after dismissal).
      `keyboardNav.test.tsx` — AC-12 (Tab + Enter only completes a turn).
    - **Traces:** FR-1.4, FR-2.1–2.6, FR-2.8, FR-8, AC-3, AC-4, AC-5, AC-12, AC-14.

18. **Build `DefeatScreen` and `VictoryScreen`.**
    - `DefeatScreen`: shows lost encounter name, correct answer text + its explanation
      (sourced from the failed encounter), `재도전` button → `RETRY_FROM_DEFEAT`.
    - `VictoryScreen`: shows clear-time (`Date.now() - stats.runStartedAt`), correct
      count, wrong count, `다시 도전` → `RESTART_FROM_VICTORY` (resets dungeon, keeps
      level/xp per FR-5.1).
    - **Verify:** `DefeatScreen.test.tsx` (AC-7), `VictoryScreen.test.tsx` (AC-8).
    - **Traces:** FR-5, AC-7, AC-8.

19. **Wire `Router.tsx` + provide `GameStateContext` in `App.tsx`.**
    - Switch on `state.screen` to render the right screen. Render `LevelUpToast`
      overlay when `state.lastTurn?.levelsGained > 0`; auto-clear after 1.5 s via
      `useEffect` that dispatches `ADVANCE_AFTER_TURN`'s follow-up.
    - **Verify:** integration test below covers this end-to-end.
    - **Traces:** FR-1, FR-5, AC-6.

### Phase 7 — Integration + a11y polish

20. **Write integration test `dungeonRun.integration.test.tsx`.**
    - Starts from cold (`localStorage` cleared). Drives through Title → Map →
      Encounter 1..5 picking the `optimal` answer each turn. Asserts: tutorial overlay
      appears on encounter 1 only; HP carries between encounters; at least one level-up
      toast fires; final state is `VictoryScreen` with `correctAnswers === 5,
      wrongAnswers === 0`.
    - Second scenario: re-mount after the third encounter; assert `이어하기` restores
      to the world map at the right node with HP/level/XP preserved (AC-9).
    - Third scenario: reload mid-encounter — assert HP is `encounterEntryHp`, not
      mid-turn HP (edge case).
    - **Verify:** runs green.
    - **Traces:** AC-5, AC-6, AC-8, AC-9, AC-14, edge case "refresh mid-encounter".

21. **Korean rendering sanity test.**
    - `korean.test.tsx` walks every encounter's problem text, every answer text, every
      explanation, every locale string, and asserts each contains at least one Hangul
      character (`/[가-힣]/`) and no placeholder ASCII like `TODO`/`XXX`. Code
      snippets are excluded (they stay in code form per AC-13).
    - **Verify:** runs green.
    - **Traces:** AC-13.

### Phase 8 — CI + deploy

22. **Add CI workflow `.github/workflows/ci.yml`.**
    - Runs on push and pull_request: install, `npm run lint`, `npm run typecheck`,
      `npm run test -- --run`, `npm run build`.
    - **Verify:** workflow file syntactically valid (commit triggers a run).

23. **Add deploy workflow `.github/workflows/deploy.yml`.**
    - On push to `main`: build, upload `dist/` as Pages artifact, deploy. Uses
      `actions/configure-pages`, `actions/upload-pages-artifact`,
      `actions/deploy-pages`.
    - Repo settings note: Pages source must be set to "GitHub Actions" before this
      runs.
    - **Verify:** does not run from a branch; manual check on `main` merge later.

24. **Final quality gate.**
    - Run `npm run lint && npm run typecheck && npm run test -- --run && npm run
      build`. Zero warnings in console during the integration test (NFR reliability).
    - Manually walk through AC-1 through AC-15 in a real browser (Chrome + Firefox);
      verify mobile viewport (Chrome DevTools, 360 px width) has no horizontal scroll.

## Interface & Compatibility

This is a greenfield project — there are no existing public contracts to preserve.
The internal contracts defined here that downstream code (and v2 work) must respect:

- **`SAVE_KEY` and `SAVE_VERSION`** are constants. Changing the schema must bump
  `SAVE_VERSION`; AC-15 path handles the resulting discard.
- **Locale `t(id)` keys** are string literals known to TypeScript via `keyof typeof
  ko`. Removing or renaming a key is a breaking change to every consumer.
- **`COMPLEXITY_MULTIPLIER` table** is the spec's literal contract (FR-2.4). Tests
  pin the values; designers may not silently re-tune these without a spec change.
- **`Answer.correctness` and `Answer.complexity`** are the durable content schema for
  v2 (which may add an `answerMode` field but must keep these).

## Data / Migration Notes

No database. `localStorage` only.

- **Key:** `bug-hunters:save:v1`.
- **Value:** JSON-serialized `SavePayload`.
- **Fields:**
  - `version: number` — currently `1`.
  - `player: { level: 1..5; xp: number; hp: number; maxHp: number }`.
  - `mapState: { unlocked: MapNodeId[]; cleared: MapNodeId[]; currentNode: MapNodeId }`.
  - `dungeonState: null | { dungeonId; encounterIndex: 0..4; encounterEntryHp: number }`
    — `monsterHp` is deliberately *not* persisted (mid-turn state is not preserved per
    spec edge cases).
  - `stats: { runStartedAt: number | null; correctAnswers: number; wrongAnswers: number
    }`.
  - `tutorialDismissed: boolean`.
- **Write triggers:** encounter entry, encounter resolution (after the monster is
  defeated), map node selection, tutorial dismissal, save reset. FR-4.1.
- **No migration path.** Version mismatch → discard + notice (AC-15).

## Test Strategy

Framework: **Vitest** + **@testing-library/react** + **@testing-library/user-event**.
jsdom environment. Tests live in `src/test/`. Coverage target is "every AC has at
least one test; every pure function has a table-driven unit test." Coverage threshold
is *not* enforced in CI (avoids cargo-cult tests).

### Unit tests

- **`damage.test.ts`** — Table over `{correctness} × {complexity}`. Asserts exact
  formulas: optimal O(1) → `30` dmg dealt, `0` taken; acceptable O(n) → `10` dmg
  dealt, `4` taken; wrong → `0` dmg, full `MONSTER_DMG` taken. Boundary: lethal
  monster hit clamps monster HP to 0; lethal player hit clamps player HP to 0.
  **Covers:** AC-3, AC-4.
- **`progression.test.ts`** — No threshold crossed; single level-up restores HP and
  bumps maxHp; multi-level skip from a large XP grant; cap at level 5.
  **Covers:** AC-6.
- **`tuning.test.ts`** — Asserts `COMPLEXITY_MULTIPLIER` literal values match spec
  FR-2.4 exactly (regression guard against accidental retuning).
- **`saveSchema.test.ts`** — `validate` accepts a well-formed payload; rejects on
  missing version, wrong version, malformed nested types.
- **`save.test.ts`** — Round-trips `writeSave`/`loadSave`; returns `corrupt` on bad
  JSON; returns `versionMismatch` on stale version; returns `unavailable` when
  `localStorage` throws on access. **Covers:** AC-9, AC-11, AC-15, edge cases "save
  corruption" and "localStorage unavailable".
- **`reducer.test.ts`** — `START_NEW_GAME` resets state; `SUBMIT_ANSWER` updates HPs
  and counters; `ADVANCE_AFTER_TURN` advances encounter index when monster defeated;
  transitions to `defeat` on player HP 0; transitions to `victory` on Wraith defeat;
  `RETRY_FROM_DEFEAT` restores HPs; `RESET_SAVE` clears state. **Covers:** AC-5, AC-7,
  AC-8, AC-10.
- **`validateContent.test.ts`** — Runs on shipped content: every encounter has
  exactly one `optimal`, 3–4 answers, non-empty Korean text, monster ref resolves.
  **Covers:** edge case "tied/ambiguous answer correctness", FR-6.3.

### Component tests

- **`TitleScreen.test.tsx`** — AC-1 (no `이어하기` when no save), AC-10 (restart with
  confirm), AC-11 (notice rendered), AC-15 (notice rendered on version mismatch).
- **`WorldMap.test.tsx`** — AC-2 (three nodes, Boss Lair `aria-disabled`).
- **`Encounter.test.tsx`** — AC-3 (optimal answer: monster HP drops by exact value,
  player HP unchanged, explanation shown), AC-4 (wrong answer: player HP drops,
  monster HP unchanged, explanation shown), AC-14 (overlay first encounter only).
- **`keyboardNav.test.tsx`** — AC-12 (Tab focuses an answer, Enter submits, advance
  by keyboard alone).
- **`DefeatScreen.test.tsx`** — AC-7 (retry restores HP and reloads same encounter).
- **`VictoryScreen.test.tsx`** — AC-8 (renders clear time + correct/wrong counts;
  save marks dungeon cleared).
- **`tutorialOverlay.test.tsx`** — AC-14 (appears on first encounter; persisted
  dismissal across mounts via save).
- **`korean.test.tsx`** — AC-13 (every content/locale string has Hangul).

### Integration test

- **`dungeonRun.integration.test.tsx`** — Full clear with `optimal` answers, asserts
  victory. Restart-mid-run scenario for AC-9. Mid-encounter reload scenario for the
  edge case.

### AC → test mapping (each AC has at least one)

| AC | Test |
|----|------|
| AC-1 | `TitleScreen.test.tsx` |
| AC-2 | `WorldMap.test.tsx` |
| AC-3 | `damage.test.ts`, `Encounter.test.tsx` |
| AC-4 | `damage.test.ts`, `Encounter.test.tsx` |
| AC-5 | `reducer.test.ts`, integration |
| AC-6 | `progression.test.ts`, integration |
| AC-7 | `reducer.test.ts`, `DefeatScreen.test.tsx` |
| AC-8 | `reducer.test.ts`, `VictoryScreen.test.tsx` |
| AC-9 | `save.test.ts`, integration |
| AC-10 | `TitleScreen.test.tsx`, `reducer.test.ts` |
| AC-11 | `save.test.ts`, `TitleScreen.test.tsx` |
| AC-12 | `keyboardNav.test.tsx` |
| AC-13 | `korean.test.tsx` |
| AC-14 | `Encounter.test.tsx`, `tutorialOverlay.test.tsx` |
| AC-15 | `save.test.ts`, `TitleScreen.test.tsx` |

## Content Data Model (TypeScript types)

These are the concrete types `src/game/types.ts` ships. Implementer should copy them
verbatim and only add fields if a step below mandates it.

```ts
export type Complexity = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)';
export type Correctness = 'optimal' | 'acceptable' | 'wrong';

export interface Answer {
  readonly id: string;                  // unique within encounter
  readonly text: string;                // Korean
  readonly correctness: Correctness;
  readonly complexity: Complexity;
  readonly explanation: string;         // Korean, 1–3 sentences
}

export interface Monster {
  readonly id: string;
  readonly name: string;                // Korean
  readonly maxHp: number;
  readonly dmg: number;                 // MONSTER_DMG override; if omitted, use tuning default
  readonly xpReward: number;
  readonly glyph: string;               // emoji or SVG path id
  readonly isBoss?: boolean;
}

export interface Encounter {
  readonly id: string;
  readonly monsterId: Monster['id'];
  readonly problem: string;             // Korean prose
  readonly codeSnippet?: string;        // verbatim code, not localized
  readonly answers: readonly Answer[];  // length 3 or 4; exactly one 'optimal'
}

export interface Dungeon {
  readonly id: string;
  readonly name: string;
  readonly encounterIds: readonly Encounter['id'][];
}

export interface PlayerState {
  readonly level: number;     // 1..5
  readonly xp: number;
  readonly hp: number;
  readonly maxHp: number;
}

export type MapNodeId = 'tutorialTown' | 'loopCaverns' | 'bossLair';
export type Screen =
  | 'title' | 'map' | 'encounter' | 'levelUp' | 'defeat' | 'victory';

export interface TurnResult {
  readonly playerHp: number;
  readonly monsterHp: number;
  readonly dmgDealt: number;
  readonly dmgTaken: number;
  readonly correctness: Correctness;
  readonly explanation: string;
  readonly monsterDefeated: boolean;
  readonly playerDefeated: boolean;
  readonly xpGained: number;     // 0 unless monster defeated this turn
  readonly leveledUp: boolean;
  readonly levelsGained: number;
}
```

Damage formula (encoded in `damage.resolveTurn`):

```
mult = COMPLEXITY_MULTIPLIER[answer.complexity]
mDmg = monster.dmg ?? MONSTER_DMG
switch (answer.correctness):
  'optimal':    dealt = round(BASE_DMG * mult),       taken = 0
  'acceptable': dealt = round(BASE_DMG * mult * 0.5), taken = round(mDmg * 0.5)
  'wrong':      dealt = 0,                            taken = mDmg
playerHp'  = max(0, playerHp  - taken)
monsterHp' = max(0, monsterHp - dealt)
```

## Risk & Sequencing

- **Risk: content tuning makes the dungeon unwinnable or trivial.** Mitigated by an
  integration test that drives an "all-optimal" run and asserts victory; if HP/dmg
  values change, the test catches an unwinnable config when the monster damages a full
  optimal player. The designer can re-tune freely as long as the integration test
  passes.
- **Risk: `localStorage` access in jsdom differs from real browsers.** Mitigated by
  testing `unavailable` by stubbing `Object.defineProperty(window, 'localStorage')` to
  throw, not by relying on jsdom's behaviour.
- **Risk: focus management in keyboard nav.** Mitigated by an isolated
  `keyboardNav.test.tsx` using `user-event`'s real Tab dispatch — no manual focus()
  calls in tests.
- **Risk: GitHub Pages base path breaks asset URLs.** Mitigated by setting
  `vite.config.ts` `base: './'` so the bundle is path-agnostic.
- **Risk: Korean font tofu on systems missing Hangul.** Mitigated by stacking
  `Pretendard`/`Apple SD Gothic Neo`/`Noto Sans KR`/`system-ui`; `korean.test.tsx`
  asserts content has Hangul; manual visual check in CI-built preview is the final
  gate (AC-13).

### Step dependencies

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 is a
strict order. Within Phase 6, steps 15/16/17/18 can be parallelized but must all
complete before step 19 (router wiring). The integration test (step 20) requires every
earlier step. The deploy workflow (step 23) can be authored at any time but should
land last so it does not deploy a half-built game on the first push.

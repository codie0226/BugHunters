import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { reducer, INITIAL_STATE } from '../game/reducer';
import type { GameState } from '../game/types';
import { LOOP_CAVERNS } from '../content/dungeon';
import { ENCOUNTER_MAP } from '../content/encounters';
import { clearSave, writeSave, loadSave, buildSavePayload } from '../game/save';

beforeEach(() => clearSave());
afterEach(() => clearSave());

/**
 * Run a full optimal dungeon clear, returning the final state.
 * This tests the core integration: START → ENTER_DUNGEON → 5×(submit optimal + advance) → VICTORY
 */
function runOptimalClear(): GameState {
  let state = INITIAL_STATE;
  state = reducer(state, { type: 'START_NEW_GAME' });
  state = reducer(state, { type: 'ENTER_DUNGEON' });

  for (let i = 0; i < LOOP_CAVERNS.encounterIds.length; i++) {
    const encId = LOOP_CAVERNS.encounterIds[i] as string;
    const enc = ENCOUNTER_MAP[encId];
    if (!enc) throw new Error(`Missing encounter ${encId}`);

    const optAns = enc.answers.find((a) => a.correctness === 'optimal');
    if (!optAns) throw new Error(`No optimal answer in ${encId}`);

    // Force monster HP low enough to die in one hit so we always advance
    state = {
      ...state,
      dungeonState: { ...state.dungeonState!, monsterHp: 1 },
    };

    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: optAns });
    state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });
  }

  return state;
}

describe('Integration: full optimal dungeon clear', () => {
  it('ends at victory screen (AC-8)', () => {
    const state = runOptimalClear();
    expect(state.screen).toBe('victory');
  });

  it('correctAnswers === 5, wrongAnswers === 0 (AC-8)', () => {
    const state = runOptimalClear();
    expect(state.stats.correctAnswers).toBe(5);
    expect(state.stats.wrongAnswers).toBe(0);
  });

  it('dungeon is marked cleared after victory (AC-8)', () => {
    const state = runOptimalClear();
    expect(state.mapState.cleared).toContain('loopCaverns');
  });

  it('tutorial overlay fires on encounter 1 only (AC-14)', () => {
    // First encounter: tutorialDismissed = false → tutorial shows (checked in component tests)
    // After dismissal, tutorialDismissed = true → no overlay
    let state = INITIAL_STATE;
    state = reducer(state, { type: 'START_NEW_GAME' });
    state = reducer(state, { type: 'ENTER_DUNGEON' });

    // Simulate dismissal on first encounter
    expect(state.tutorialDismissed).toBe(false);
    state = reducer(state, { type: 'DISMISS_TUTORIAL' });
    expect(state.tutorialDismissed).toBe(true);

    // Subsequent encounters: tutorialDismissed stays true
    const encId0 = LOOP_CAVERNS.encounterIds[0] as string;
    const enc0 = ENCOUNTER_MAP[encId0]!;
    const opt0 = enc0.answers.find((a) => a.correctness === 'optimal')!;
    state = { ...state, dungeonState: { ...state.dungeonState!, monsterHp: 1 } };
    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: opt0 });
    state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });
    expect(state.tutorialDismissed).toBe(true); // persists across encounters
  });

  it('at least one level-up occurs during an all-optimal run (AC-6)', () => {
    let leveled = false;
    let state = INITIAL_STATE;
    state = reducer(state, { type: 'START_NEW_GAME' });
    state = reducer(state, { type: 'ENTER_DUNGEON' });

    for (let i = 0; i < LOOP_CAVERNS.encounterIds.length; i++) {
      const encId = LOOP_CAVERNS.encounterIds[i] as string;
      const enc = ENCOUNTER_MAP[encId]!;
      const optAns = enc.answers.find((a) => a.correctness === 'optimal')!;

      state = { ...state, dungeonState: { ...state.dungeonState!, monsterHp: 1 } };
      state = reducer(state, { type: 'SUBMIT_ANSWER', answer: optAns });
      if (state.lastTurn?.leveledUp) leveled = true;
      state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });
    }

    expect(leveled).toBe(true);
  });
});

describe('Integration: persistence across reload (AC-9)', () => {
  it('save after second encounter restores state on reload', () => {
    let state = INITIAL_STATE;
    state = reducer(state, { type: 'START_NEW_GAME' });
    state = reducer(state, { type: 'ENTER_DUNGEON' });

    // Clear first encounter
    const enc0Id = LOOP_CAVERNS.encounterIds[0] as string;
    const enc0 = ENCOUNTER_MAP[enc0Id]!;
    const opt0 = enc0.answers.find((a) => a.correctness === 'optimal')!;
    state = { ...state, dungeonState: { ...state.dungeonState!, monsterHp: 1 } };
    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: opt0 });
    state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });

    // Save the state
    const dungeonState = state.dungeonState
      ? {
          dungeonId: state.dungeonState.dungeonId,
          encounterIndex: state.dungeonState.encounterIndex,
          encounterEntryHp: state.dungeonState.encounterEntryHp,
        }
      : null;

    const payload = buildSavePayload(
      state.player,
      state.mapState,
      dungeonState,
      state.stats,
      state.tutorialDismissed,
    );
    writeSave(payload);

    // Reload: read save
    const loaded = loadSave();
    expect(loaded.kind).toBe('ok');
    if (loaded.kind !== 'ok') throw new Error('Expected ok');

    // Restore state
    let restoredState = INITIAL_STATE;
    restoredState = reducer(restoredState, { type: 'CONTINUE_FROM_SAVE', payload: loaded.payload });

    expect(restoredState.screen).toBe('map');
    expect(restoredState.player.level).toBe(state.player.level);
    expect(restoredState.player.xp).toBe(state.player.xp);
    expect(restoredState.player.hp).toBe(state.player.hp);
    expect(restoredState.dungeonState?.encounterIndex).toBe(state.dungeonState?.encounterIndex);
  });
});

describe('Integration: mid-encounter refresh (edge case)', () => {
  it('save records encounterEntryHp, not mid-turn HP', () => {
    let state = INITIAL_STATE;
    state = reducer(state, { type: 'START_NEW_GAME' });
    state = reducer(state, { type: 'ENTER_DUNGEON' });
    state = reducer(state, { type: 'ENCOUNTER_ENTERED' });

    const entryHp = state.dungeonState!.encounterEntryHp;

    // Simulate taking damage mid-encounter
    const enc0Id = LOOP_CAVERNS.encounterIds[0] as string;
    const enc0 = ENCOUNTER_MAP[enc0Id]!;
    const wrongAns = enc0.answers.find((a) => a.correctness === 'wrong')!;
    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: wrongAns });

    // HP mid-turn is now less than entry HP
    expect(state.player.hp).toBeLessThan(entryHp);

    // Save payload uses encounterEntryHp (not persisting monsterHp or mid-turn hp)
    const dungeonState = state.dungeonState
      ? {
          dungeonId: state.dungeonState.dungeonId,
          encounterIndex: state.dungeonState.encounterIndex,
          encounterEntryHp: state.dungeonState.encounterEntryHp,
        }
      : null;

    const payload = buildSavePayload(
      state.player,
      state.mapState,
      dungeonState,
      state.stats,
      state.tutorialDismissed,
    );
    writeSave(payload);

    const loaded = loadSave();
    expect(loaded.kind).toBe('ok');
    if (loaded.kind !== 'ok') throw new Error();

    // Restored: encounterEntryHp equals what it was on entry
    expect(loaded.payload.dungeonState?.encounterEntryHp).toBe(entryHp);
  });

  it('reload after non-fatal turn restores player.hp to encounterEntryHp (P1 regression)', () => {
    // Spec edge case: "Player refreshes mid-encounter — HP as it was on entry; mid-turn state is not preserved."
    let state = INITIAL_STATE;
    state = reducer(state, { type: 'START_NEW_GAME' });
    state = reducer(state, { type: 'ENTER_DUNGEON' });
    state = reducer(state, { type: 'ENCOUNTER_ENTERED' });

    const entryHp = state.dungeonState!.encounterEntryHp;

    // Submit a non-fatal wrong answer so player takes damage but is not defeated
    const enc0Id = LOOP_CAVERNS.encounterIds[0] as string;
    const enc0 = ENCOUNTER_MAP[enc0Id]!;
    const wrongAns = enc0.answers.find((a) => a.correctness === 'wrong')!;
    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: wrongAns });

    // Verify non-fatal: player took damage but is alive
    expect(state.player.hp).toBeLessThan(entryHp);
    expect(state.player.hp).toBeGreaterThan(0);

    // Advance the turn so the encounter continues (lastTurn cleared)
    state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });
    expect(state.lastTurn).toBeNull();

    // Save mid-encounter (as useGameState does after ADVANCE_AFTER_TURN)
    const dungeonState = state.dungeonState
      ? {
          dungeonId: state.dungeonState.dungeonId,
          encounterIndex: state.dungeonState.encounterIndex,
          encounterEntryHp: state.dungeonState.encounterEntryHp,
        }
      : null;
    const payload = buildSavePayload(
      state.player,
      state.mapState,
      dungeonState,
      state.stats,
      state.tutorialDismissed,
    );
    writeSave(payload);

    // Reload: CONTINUE_FROM_SAVE must restore hp to encounterEntryHp, not the post-turn hp
    const loaded = loadSave();
    expect(loaded.kind).toBe('ok');
    if (loaded.kind !== 'ok') throw new Error();

    let restoredState = INITIAL_STATE;
    restoredState = reducer(restoredState, { type: 'CONTINUE_FROM_SAVE', payload: loaded.payload });

    // HP must equal the encounter-entry HP, not the leaked post-turn HP
    expect(restoredState.player.hp).toBe(entryHp);

    // Re-entering the dungeon: encounterEntryHp should match the restored player.hp
    restoredState = reducer(restoredState, { type: 'ENTER_DUNGEON' });
    expect(restoredState.dungeonState!.encounterEntryHp).toBe(entryHp);
    expect(restoredState.player.hp).toBe(entryHp);
  });
});

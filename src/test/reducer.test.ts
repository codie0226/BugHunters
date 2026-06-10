import { describe, it, expect } from 'vitest';
import { reducer, INITIAL_STATE } from '../game/reducer';
import type { GameState, Action } from '../game/types';
import { ENCOUNTERS } from '../content/encounters';
import { LOOP_CAVERNS } from '../content/dungeon';
import { MONSTER_MAP } from '../content/monsters';
import { ENCOUNTER_MAP } from '../content/encounters';

function getState(actions: Action[]): GameState {
  return actions.reduce(reducer, INITIAL_STATE);
}

describe('reducer — START_NEW_GAME', () => {
  it('transitions to map screen (AC-2)', () => {
    const state = getState([{ type: 'START_NEW_GAME' }]);
    expect(state.screen).toBe('map');
    expect(state.player.level).toBe(1);
    expect(state.player.xp).toBe(0);
  });
});

describe('reducer — ENTER_DUNGEON', () => {
  it('transitions to encounter screen and sets dungeonState', () => {
    const state = getState([{ type: 'START_NEW_GAME' }, { type: 'ENTER_DUNGEON' }]);
    expect(state.screen).toBe('encounter');
    expect(state.dungeonState).not.toBeNull();
    expect(state.dungeonState?.encounterIndex).toBe(0);
  });
});

describe('reducer — SUBMIT_ANSWER', () => {
  function enterDungeon(): GameState {
    return getState([{ type: 'START_NEW_GAME' }, { type: 'ENTER_DUNGEON' }]);
  }

  it('wrong answer: player loses HP, monster HP unchanged (AC-4)', () => {
    const before = enterDungeon();
    const enc = ENCOUNTER_MAP[LOOP_CAVERNS.encounterIds[0] as string];
    const wrongAnswer = enc?.answers.find((a) => a.correctness === 'wrong');
    if (!enc || !wrongAnswer) throw new Error('No wrong answer in fixture');

    const after = reducer(before, { type: 'SUBMIT_ANSWER', answer: wrongAnswer });
    expect(after.player.hp).toBeLessThan(before.player.hp);
    expect(after.dungeonState?.monsterHp).toBe(before.dungeonState?.monsterHp);
    expect(after.stats.wrongAnswers).toBe(1);
  });

  it('optimal answer: player keeps HP, monster loses HP (AC-3)', () => {
    const before = enterDungeon();
    const enc = ENCOUNTER_MAP[LOOP_CAVERNS.encounterIds[0] as string];
    const optimalAnswer = enc?.answers.find((a) => a.correctness === 'optimal');
    if (!enc || !optimalAnswer) throw new Error('No optimal answer in fixture');

    const after = reducer(before, { type: 'SUBMIT_ANSWER', answer: optimalAnswer });
    expect(after.player.hp).toBe(before.player.hp);
    expect(after.dungeonState!.monsterHp).toBeLessThan(before.dungeonState!.monsterHp);
    expect(after.stats.correctAnswers).toBe(1);
  });
});

describe('reducer — ADVANCE_AFTER_TURN (AC-5)', () => {
  it('advances to next encounter when monster is defeated, HP carries over', () => {
    const enc0Id = LOOP_CAVERNS.encounterIds[0] as string;
    const enc0 = ENCOUNTER_MAP[enc0Id];
    const monster0 = MONSTER_MAP[enc0?.monsterId as string];
    if (!enc0 || !monster0) throw new Error('Missing fixture');

    const optAns = enc0.answers.find((a) => a.correctness === 'optimal');
    if (!optAns) throw new Error('No optimal answer');

    // Force monster HP to a level where one optimal hit kills it
    let state = getState([{ type: 'START_NEW_GAME' }, { type: 'ENTER_DUNGEON' }]);
    // Manually set monster HP to 1 to guarantee a kill on next optimal answer
    state = {
      ...state,
      dungeonState: { ...state.dungeonState!, monsterHp: 1 },
    };

    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: optAns });
    expect(state.lastTurn?.monsterDefeated).toBe(true);

    const hpBeforeAdvance = state.player.hp;
    state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });

    expect(state.screen).toBe('encounter');
    expect(state.dungeonState?.encounterIndex).toBe(1);
    expect(state.player.hp).toBe(hpBeforeAdvance); // HP carries over (no heal)
  });
});

describe('reducer — defeat (AC-7)', () => {
  it('transitions to defeat when player HP reaches 0', () => {
    const enc0Id = LOOP_CAVERNS.encounterIds[0] as string;
    const enc0 = ENCOUNTER_MAP[enc0Id];
    if (!enc0) throw new Error('Missing enc0');
    const wrongAns = enc0.answers.find((a) => a.correctness === 'wrong');
    if (!wrongAns) throw new Error('No wrong answer');

    let state = getState([{ type: 'START_NEW_GAME' }, { type: 'ENTER_DUNGEON' }]);
    // Force player HP to 1 so wrong answer kills them
    state = { ...state, player: { ...state.player, hp: 1 } };
    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: wrongAns });
    expect(state.player.hp).toBe(0);
    state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });
    expect(state.screen).toBe('defeat');
  });

  it('RETRY_FROM_DEFEAT restores HP and reloads same encounter (AC-7)', () => {
    const enc0Id = LOOP_CAVERNS.encounterIds[0] as string;
    const enc0 = ENCOUNTER_MAP[enc0Id];
    if (!enc0) throw new Error('Missing enc0');
    const wrongAns = enc0.answers.find((a) => a.correctness === 'wrong');
    if (!wrongAns) throw new Error('No wrong answer');

    let state = getState([{ type: 'START_NEW_GAME' }, { type: 'ENTER_DUNGEON' }]);
    state = { ...state, player: { ...state.player, hp: 1 } };
    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: wrongAns });
    state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });
    expect(state.screen).toBe('defeat');

    state = reducer(state, { type: 'RETRY_FROM_DEFEAT' });
    expect(state.screen).toBe('encounter');
    expect(state.player.hp).toBe(state.player.maxHp); // restored
    expect(state.dungeonState?.encounterIndex).toBe(0); // same encounter
    const monster0 = MONSTER_MAP[enc0.monsterId];
    expect(state.dungeonState?.monsterHp).toBe(monster0?.maxHp); // full monster HP
  });
});

describe('reducer — victory (AC-8)', () => {
  function clearAllEncounters(): GameState {
    let state = getState([{ type: 'START_NEW_GAME' }, { type: 'ENTER_DUNGEON' }]);

    for (let i = 0; i < LOOP_CAVERNS.encounterIds.length; i++) {
      const encId = LOOP_CAVERNS.encounterIds[i] as string;
      const enc = ENCOUNTER_MAP[encId];
      const optAns = enc?.answers.find((a) => a.correctness === 'optimal');
      if (!enc || !optAns) throw new Error(`Missing data for enc ${i}`);

      // Force monster HP to 1 so one optimal hit kills
      state = { ...state, dungeonState: { ...state.dungeonState!, monsterHp: 1 } };
      state = reducer(state, { type: 'SUBMIT_ANSWER', answer: optAns });
      state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });
    }

    return state;
  }

  it('transitions to victory after clearing all 5 encounters (AC-8)', () => {
    const state = clearAllEncounters();
    expect(state.screen).toBe('victory');
  });

  it('save reflects dungeon cleared after victory', () => {
    const state = clearAllEncounters();
    expect(state.mapState.cleared).toContain('loopCaverns');
  });
});

describe('reducer — RESET_SAVE (AC-10)', () => {
  it('resets to initial state', () => {
    let state = getState([{ type: 'START_NEW_GAME' }, { type: 'ENTER_DUNGEON' }]);
    state = reducer(state, { type: 'RESET_SAVE' });
    expect(state.screen).toBe('title');
    expect(state.player.level).toBe(1);
    expect(state.dungeonState).toBeNull();
  });
});

describe('reducer — XP grant on monster defeat', () => {
  it('grants XP when monster is defeated (AC-5)', () => {
    const enc0Id = LOOP_CAVERNS.encounterIds[0] as string;
    const enc0 = ENCOUNTER_MAP[enc0Id];
    const monster0 = MONSTER_MAP[enc0?.monsterId as string];
    if (!enc0 || !monster0) throw new Error('Missing fixture');

    const optAns = enc0.answers.find((a) => a.correctness === 'optimal');
    if (!optAns) throw new Error('No optimal answer');

    let state = getState([{ type: 'START_NEW_GAME' }, { type: 'ENTER_DUNGEON' }]);
    state = { ...state, dungeonState: { ...state.dungeonState!, monsterHp: 1 } };
    const before = state.player.xp;
    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: optAns });
    expect(state.player.xp).toBe(before + monster0.xpReward);
  });
});

describe('reducer — RESTART_FROM_VICTORY', () => {
  it('resets dungeon but keeps level/xp', () => {
    const enc0Id = LOOP_CAVERNS.encounterIds[0] as string;
    const enc0 = ENCOUNTER_MAP[enc0Id];
    if (!enc0) throw new Error();
    const optAns = enc0.answers.find((a) => a.correctness === 'optimal');
    if (!optAns) throw new Error();

    // Build up some XP first
    let state = getState([{ type: 'START_NEW_GAME' }, { type: 'ENTER_DUNGEON' }]);
    state = { ...state, dungeonState: { ...state.dungeonState!, monsterHp: 1 } };
    state = reducer(state, { type: 'SUBMIT_ANSWER', answer: optAns });
    state = reducer(state, { type: 'ADVANCE_AFTER_TURN' });
    // Set to victory manually
    state = { ...state, screen: 'victory' };

    const savedLevel = state.player.level;
    const savedXp = state.player.xp;

    state = reducer(state, { type: 'RESTART_FROM_VICTORY' });
    expect(state.screen).toBe('map');
    expect(state.player.level).toBe(savedLevel);
    expect(state.player.xp).toBe(savedXp);
    expect(state.dungeonState).toBeNull();
    expect(state.stats.correctAnswers).toBe(0);
  });
});

describe('reducer — ENCOUNTERS count', () => {
  it('ENCOUNTERS has exactly 5 entries', () => {
    expect(ENCOUNTERS.length).toBe(5);
  });
});

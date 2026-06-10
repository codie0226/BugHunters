import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CombatScreen } from '../components/CombatScreen';
import type { GameState, Action } from '../game/types';
import { INITIAL_STATE, reducer } from '../game/reducer';
import { ENCOUNTER_MAP } from '../content/encounters';
import { MONSTER_MAP } from '../content/monsters';
import { LOOP_CAVERNS } from '../content/dungeon';
import { BASE_DMG, COMPLEXITY_MULTIPLIER } from '../game/tuning';

function getEncounterState(encounterIndex = 0): GameState {
  const encId = LOOP_CAVERNS.encounterIds[encounterIndex] as string;
  const enc = ENCOUNTER_MAP[encId]!;
  const monster = MONSTER_MAP[enc.monsterId]!;
  return {
    ...INITIAL_STATE,
    screen: 'encounter',
    dungeonState: {
      dungeonId: 'loop-caverns',
      encounterIndex,
      monsterHp: monster.maxHp,
      encounterEntryHp: 50,
    },
    stats: { ...INITIAL_STATE.stats, runStartedAt: Date.now() },
  };
}

describe('CombatScreen — AC-3 optimal answer', () => {
  it('monster HP decreases by expected amount, player HP unchanged', () => {
    const dispatch = vi.fn<React.Dispatch<Action>>();
    const state = getEncounterState(0);
    const encId = LOOP_CAVERNS.encounterIds[0] as string;
    const enc = ENCOUNTER_MAP[encId]!;
    const optAns = enc.answers.find((a) => a.correctness === 'optimal')!;

    render(<CombatScreen state={state} dispatch={dispatch} />);

    // Find and click the optimal answer button
    const answerBtns = screen.getAllByRole('button', {
      name: new RegExp(optAns.text.slice(0, 10)),
    });
    fireEvent.click(answerBtns[0]!);

    // dispatch should have been called with SUBMIT_ANSWER
    const submitCall = dispatch.mock.calls.find(
      (call) => (call[0] as Action).type === 'SUBMIT_ANSWER',
    );
    expect(submitCall).toBeDefined();
    const submitted = submitCall![0] as Extract<Action, { type: 'SUBMIT_ANSWER' }>;
    expect(submitted.answer.correctness).toBe('optimal');
  });

  it('shows explanation panel after submit', () => {
    const dispatch = vi.fn<React.Dispatch<Action>>();
    const state = getEncounterState(0);
    const encId = LOOP_CAVERNS.encounterIds[0] as string;
    const enc = ENCOUNTER_MAP[encId]!;
    const optAns = enc.answers.find((a) => a.correctness === 'optimal')!;

    // Simulate a state with lastTurn set (post-submit)
    const afterSubmit = reducer(state, { type: 'SUBMIT_ANSWER', answer: optAns });
    render(<CombatScreen state={afterSubmit} dispatch={dispatch} />);
    expect(screen.getByRole('region', { name: '설명' })).toBeInTheDocument();
  });
});

describe('CombatScreen — AC-4 wrong answer', () => {
  it('player HP decreases, monster HP unchanged after wrong answer', () => {
    const encId = LOOP_CAVERNS.encounterIds[0] as string;
    const enc = ENCOUNTER_MAP[encId]!;
    const wrongAns = enc.answers.find((a) => a.correctness === 'wrong')!;

    const state = getEncounterState(0);
    const afterSubmit = reducer(state, { type: 'SUBMIT_ANSWER', answer: wrongAns });

    expect(afterSubmit.player.hp).toBeLessThan(state.player.hp);
    // monster HP should be same since dmgDealt = 0 for wrong
    const monster = MONSTER_MAP[enc.monsterId]!;
    expect(afterSubmit.dungeonState?.monsterHp).toBe(monster.maxHp);
  });
});

describe('CombatScreen — AC-14 tutorial overlay', () => {
  it('shows tutorial overlay on first encounter when not dismissed', () => {
    const dispatch = vi.fn<React.Dispatch<Action>>();
    const state: GameState = {
      ...getEncounterState(0),
      tutorialDismissed: false,
      lastTurn: null, // not submitted yet
    };
    render(<CombatScreen state={state} dispatch={dispatch} />);
    expect(screen.getByRole('dialog', { name: /전투 방법/ })).toBeInTheDocument();
  });

  it('does not show tutorial overlay when dismissed', () => {
    const dispatch = vi.fn<React.Dispatch<Action>>();
    const state: GameState = { ...getEncounterState(0), tutorialDismissed: true };
    render(<CombatScreen state={state} dispatch={dispatch} />);
    expect(screen.queryByRole('dialog', { name: /전투 방법/ })).not.toBeInTheDocument();
  });

  it('does not show tutorial on subsequent encounters', () => {
    const dispatch = vi.fn<React.Dispatch<Action>>();
    const state: GameState = {
      ...getEncounterState(2), // encounter index 2, not first
      tutorialDismissed: false,
    };
    render(<CombatScreen state={state} dispatch={dispatch} />);
    expect(screen.queryByRole('dialog', { name: /전투 방법/ })).not.toBeInTheDocument();
  });
});

describe('CombatScreen — AC-5 damage formula spot check', () => {
  it('optimal O(1) deals BASE_DMG * 3.0 = 30 to the monster', () => {
    const encId = LOOP_CAVERNS.encounterIds[2] as string; // enc-3 has O(1) optimal
    const enc = ENCOUNTER_MAP[encId]!;
    const optAns = enc.answers.find((a) => a.correctness === 'optimal')!;

    const state = getEncounterState(2);
    const monster = MONSTER_MAP[enc.monsterId]!;
    const afterSubmit = reducer(state, { type: 'SUBMIT_ANSWER', answer: optAns });

    const expectedDmg = Math.round(BASE_DMG * COMPLEXITY_MULTIPLIER[optAns.complexity]);
    expect(afterSubmit.dungeonState?.monsterHp).toBe(monster.maxHp - expectedDmg);
    expect(afterSubmit.player.hp).toBe(state.player.hp);
  });
});

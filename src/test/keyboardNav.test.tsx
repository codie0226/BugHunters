import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CombatScreen } from '../components/CombatScreen';
import type { GameState, Action } from '../game/types';
import { INITIAL_STATE } from '../game/reducer';
import { ENCOUNTER_MAP } from '../content/encounters';
import { MONSTER_MAP } from '../content/monsters';
import { LOOP_CAVERNS } from '../content/dungeon';

function getEncounterState(): GameState {
  const encId = LOOP_CAVERNS.encounterIds[0] as string;
  const enc = ENCOUNTER_MAP[encId]!;
  const monster = MONSTER_MAP[enc.monsterId]!;
  return {
    ...INITIAL_STATE,
    screen: 'encounter',
    tutorialDismissed: true, // dismiss tutorial so we can test answer buttons
    dungeonState: {
      dungeonId: 'loop-caverns',
      encounterIndex: 0,
      monsterHp: monster.maxHp,
      encounterEntryHp: 50,
    },
    stats: { ...INITIAL_STATE.stats, runStartedAt: Date.now() },
  };
}

describe('keyboardNav — AC-12', () => {
  it('Tab focuses answer buttons and Enter submits (Tab + Enter only)', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn<React.Dispatch<Action>>();
    render(<CombatScreen state={getEncounterState()} dispatch={dispatch} />);

    // The first answer button should be focused after mount (via useKeyboardNav)
    // Tab to the second button
    await user.tab();

    // Press Enter to submit
    await user.keyboard('{Enter}');

    const submitCall = dispatch.mock.calls.find(
      (call) => (call[0] as Action).type === 'SUBMIT_ANSWER',
    );
    expect(submitCall).toBeDefined();
  });

  it('ArrowDown does not submit (only Enter submits)', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn<React.Dispatch<Action>>();
    render(<CombatScreen state={getEncounterState()} dispatch={dispatch} />);

    // Focus the answer container and press ArrowDown
    const answerContainer = document.querySelector('[aria-label="선택하세요"]');
    if (answerContainer) (answerContainer as HTMLElement).focus();

    await user.keyboard('{ArrowDown}');
    // ArrowDown should NOT dispatch a submit action
    expect(dispatch).not.toHaveBeenCalled();
  });
});

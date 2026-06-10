import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DefeatScreen } from '../components/DefeatScreen';
import type { GameState, Action } from '../game/types';
import { INITIAL_STATE } from '../game/reducer';

const dispatch = vi.fn<React.Dispatch<Action>>();

function getDefeatState(): GameState {
  return {
    ...INITIAL_STATE,
    screen: 'defeat',
    player: { level: 1, xp: 0, hp: 0, maxHp: 50 },
    dungeonState: {
      dungeonId: 'loop-caverns',
      encounterIndex: 0,
      monsterHp: 20,
      encounterEntryHp: 50,
    },
  };
}

describe('DefeatScreen — AC-7', () => {
  it('shows 재도전 button', () => {
    render(<DefeatScreen state={getDefeatState()} dispatch={dispatch} />);
    expect(screen.getByRole('button', { name: /재도전/ })).toBeInTheDocument();
  });

  it('shows correct answer from the lost encounter', () => {
    render(<DefeatScreen state={getDefeatState()} dispatch={dispatch} />);
    // Should display the optimal answer text
    expect(screen.getByText(/정답:/)).toBeInTheDocument();
  });

  it('clicking 재도전 dispatches RETRY_FROM_DEFEAT (AC-7)', () => {
    dispatch.mockClear();
    render(<DefeatScreen state={getDefeatState()} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole('button', { name: /재도전/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'RETRY_FROM_DEFEAT' });
  });
});

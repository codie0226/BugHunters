import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VictoryScreen } from '../components/VictoryScreen';
import type { GameState, Action } from '../game/types';
import { INITIAL_STATE } from '../game/reducer';

const dispatch = vi.fn<React.Dispatch<Action>>();

function getVictoryState(): GameState {
  return {
    ...INITIAL_STATE,
    screen: 'victory',
    player: { level: 3, xp: 75, hp: 90, maxHp: 90 },
    mapState: {
      unlocked: ['tutorialTown', 'loopCaverns'],
      cleared: ['loopCaverns'],
      currentNode: 'loopCaverns',
    },
    stats: {
      runStartedAt: Date.now() - 120000, // 2 minutes ago
      correctAnswers: 5,
      wrongAnswers: 1,
    },
  };
}

describe('VictoryScreen — AC-8', () => {
  it('shows victory title', () => {
    render(<VictoryScreen state={getVictoryState()} dispatch={dispatch} />);
    expect(screen.getByText('던전 클리어!')).toBeInTheDocument();
  });

  it('shows correct answer count', () => {
    render(<VictoryScreen state={getVictoryState()} dispatch={dispatch} />);
    expect(screen.getByText(/정답: 5개/)).toBeInTheDocument();
  });

  it('shows wrong answer count', () => {
    render(<VictoryScreen state={getVictoryState()} dispatch={dispatch} />);
    expect(screen.getByText(/오답: 1개/)).toBeInTheDocument();
  });

  it('shows clear time', () => {
    render(<VictoryScreen state={getVictoryState()} dispatch={dispatch} />);
    // Time should mention minutes and seconds
    expect(screen.getByText(/분.*초/)).toBeInTheDocument();
  });

  it('clicking 다시 도전 dispatches RESTART_FROM_VICTORY (AC-8)', () => {
    dispatch.mockClear();
    render(<VictoryScreen state={getVictoryState()} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole('button', { name: /다시 도전/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESTART_FROM_VICTORY' });
  });
});

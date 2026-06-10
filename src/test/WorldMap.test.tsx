import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorldMap } from '../components/WorldMap';
import type { GameState, Action } from '../game/types';
import { INITIAL_STATE } from '../game/reducer';

const dispatch = vi.fn<React.Dispatch<Action>>();

function renderMap(stateOverride?: Partial<GameState>) {
  const state: GameState = { ...INITIAL_STATE, ...stateOverride, screen: 'map' };
  render(<WorldMap state={state} dispatch={dispatch} />);
}

describe('WorldMap — AC-2', () => {
  it('renders three map nodes', () => {
    renderMap();
    expect(screen.getByText('Tutorial Town')).toBeInTheDocument();
    expect(screen.getByText('Loop Caverns')).toBeInTheDocument();
    expect(screen.getByText('Boss Lair')).toBeInTheDocument();
  });

  it('Boss Lair is aria-disabled (locked)', () => {
    renderMap({
      mapState: {
        unlocked: ['tutorialTown', 'loopCaverns'],
        cleared: [],
        currentNode: 'tutorialTown',
      },
    });
    const bossBtn = screen.getByRole('button', {
      name: /Boss Lair/,
    });
    expect(bossBtn).toBeDisabled();
    expect(bossBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('Loop Caverns is clickable when unlocked', () => {
    renderMap({
      mapState: {
        unlocked: ['tutorialTown', 'loopCaverns'],
        cleared: [],
        currentNode: 'tutorialTown',
      },
    });
    const cavernsBtn = screen.getByRole('button', { name: /Loop Caverns/ });
    expect(cavernsBtn).not.toBeDisabled();
  });
});

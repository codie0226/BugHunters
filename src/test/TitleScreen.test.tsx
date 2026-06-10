import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TitleScreen } from '../components/TitleScreen';
import type { GameState, Action } from '../game/types';
import { INITIAL_STATE } from '../game/reducer';
import { writeSave, clearSave } from '../game/save';
import { VALID_SAVE } from './fixtures/save.fixture';

const dispatch = vi.fn<React.Dispatch<Action>>();

function renderTitle(stateOverride?: Partial<GameState>) {
  const state: GameState = { ...INITIAL_STATE, ...stateOverride };
  render(<TitleScreen state={state} dispatch={dispatch} />);
}

beforeEach(() => {
  dispatch.mockClear();
  clearSave();
});

afterEach(() => {
  clearSave();
  vi.restoreAllMocks();
});

describe('TitleScreen — AC-1', () => {
  it('shows 시작 button', () => {
    renderTitle();
    expect(screen.getByRole('button', { name: /시작/ })).toBeInTheDocument();
  });

  it('hides 이어하기 when no save (AC-1)', () => {
    renderTitle({ saveAvailable: false });
    expect(screen.queryByRole('button', { name: /이어하기/ })).not.toBeInTheDocument();
  });

  it('shows 이어하기 when save is available', () => {
    writeSave(VALID_SAVE);
    renderTitle({ saveAvailable: true });
    expect(screen.getByRole('button', { name: /이어하기/ })).toBeInTheDocument();
  });
});

describe('TitleScreen — AC-10 restart', () => {
  it('shows 처음부터 다시 only when save is available', () => {
    renderTitle({ saveAvailable: true });
    expect(screen.getByRole('button', { name: /처음부터 다시/ })).toBeInTheDocument();
  });

  it('clicking 처음부터 다시 opens confirm dialog', () => {
    renderTitle({ saveAvailable: true });
    fireEvent.click(screen.getByRole('button', { name: /처음부터 다시/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('confirm dialog: clicking yes dispatches RESET_SAVE (AC-10)', () => {
    writeSave(VALID_SAVE);
    renderTitle({ saveAvailable: true });
    fireEvent.click(screen.getByRole('button', { name: /처음부터 다시/ }));
    fireEvent.click(screen.getByRole('button', { name: /네, 삭제합니다/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_SAVE' });
  });

  it('confirm dialog: clicking cancel does not dispatch', () => {
    renderTitle({ saveAvailable: true });
    fireEvent.click(screen.getByRole('button', { name: /처음부터 다시/ }));
    fireEvent.click(screen.getByRole('button', { name: /취소/ }));
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'RESET_SAVE' });
  });
});

describe('TitleScreen — AC-11 save disabled notice', () => {
  it('renders notice when saveDisabled', () => {
    renderTitle({ saveDisabled: true, pendingNotice: 'save.disabled' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/저장되지 않습니다/)).toBeInTheDocument();
  });
});

describe('TitleScreen — AC-15 version mismatch', () => {
  it('renders mismatch notice when pendingNotice is versionMismatch', () => {
    renderTitle({ pendingNotice: 'save.versionMismatch' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

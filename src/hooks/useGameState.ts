import { useReducer, useEffect, useRef } from 'react';
import { reducer, INITIAL_STATE } from '../game/reducer';
import type { GameState, Action, SavePayload } from '../game/types';
import { loadSave, writeSave, buildSavePayload } from '../game/save';

export function useGameState(): [GameState, React.Dispatch<Action>] {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Track actions that should trigger a save
  const lastActionRef = useRef<Action | null>(null);
  const wrappedDispatch: React.Dispatch<Action> = (action: Action) => {
    lastActionRef.current = action;
    dispatch(action);
  };

  // On mount: check for a saved game and configure save availability
  useEffect(() => {
    const result = loadSave();
    switch (result.kind) {
      case 'ok':
        dispatch({ type: 'SET_SAVE_AVAILABLE', payload: result.payload });
        break;
      case 'unavailable':
        dispatch({ type: 'SET_SAVE_DISABLED' });
        dispatch({ type: 'LOAD_FAILED', noticeId: 'save.disabled' });
        break;
      case 'versionMismatch':
        dispatch({ type: 'LOAD_FAILED', noticeId: 'save.versionMismatch' });
        break;
      case 'corrupt':
        dispatch({ type: 'LOAD_FAILED', noticeId: 'save.corrupt' });
        break;
      case 'absent':
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state after relevant actions
  useEffect(() => {
    if (state.saveDisabled) return;
    const action = lastActionRef.current;
    if (!action) return;

    const persistOnActions: Action['type'][] = [
      'ENCOUNTER_ENTERED',
      'ADVANCE_AFTER_TURN',
      'SELECT_MAP_NODE',
      'DISMISS_TUTORIAL',
      'START_NEW_GAME',
      'CONTINUE_FROM_SAVE',
    ];

    if (persistOnActions.includes(action.type)) {
      const dungeonState = state.dungeonState
        ? {
            dungeonId: state.dungeonState.dungeonId,
            encounterIndex: state.dungeonState.encounterIndex,
            encounterEntryHp: state.dungeonState.encounterEntryHp,
          }
        : null;

      const payload: SavePayload = buildSavePayload(
        state.player,
        state.mapState,
        dungeonState,
        state.stats,
        state.tutorialDismissed,
      );
      writeSave(payload);
    }
  });

  return [state, wrappedDispatch];
}

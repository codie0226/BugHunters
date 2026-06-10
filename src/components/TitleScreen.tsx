import { useState } from 'react';
import type { GameState, Action } from '../game/types';
import { t } from '../locale/strings';
import { Notice } from './Notice';
import { ConfirmDialog } from './ConfirmDialog';
import { clearSave, loadSave } from '../game/save';

interface TitleScreenProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

export function TitleScreen({ state, dispatch }: TitleScreenProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStart = () => dispatch({ type: 'START_NEW_GAME' });

  const handleContinue = () => {
    const result = loadSave();
    if (result.kind === 'ok') {
      dispatch({ type: 'CONTINUE_FROM_SAVE', payload: result.payload });
    } else {
      dispatch({ type: 'START_NEW_GAME' });
    }
  };

  const handleRestartConfirm = () => {
    clearSave();
    dispatch({ type: 'RESET_SAVE' });
    setShowConfirm(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: 'var(--space-8)',
        gap: 'var(--space-6)',
      }}
    >
      {state.pendingNotice && (
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <Notice
            noticeId={state.pendingNotice}
            onDismiss={() => dispatch({ type: 'DISMISS_NOTICE' })}
          />
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🐛</div>
        <h1
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 700,
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {t('title.game')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)' }}>
          CS 지식으로 버그 몬스터를 물리쳐라!
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          width: '100%',
          maxWidth: '300px',
        }}
      >
        <button
          onClick={handleStart}
          style={{
            minHeight: 'var(--touch-min)',
            padding: 'var(--space-3) var(--space-8)',
            background: 'var(--color-accent)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 700,
          }}
        >
          {t('title.start')}
        </button>

        {state.saveAvailable && (
          <button
            onClick={handleContinue}
            style={{
              minHeight: 'var(--touch-min)',
              padding: 'var(--space-3) var(--space-8)',
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-accent)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-lg)',
            }}
          >
            {t('title.continue')}
          </button>
        )}

        {state.saveAvailable && (
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              minHeight: 'var(--touch-min)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {t('title.restart')}
          </button>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title={t('title.restart.confirm.title')}
          body={t('title.restart.confirm.body')}
          onConfirm={handleRestartConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

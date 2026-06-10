import type { GameState, Action } from '../game/types';
import { t } from '../locale/strings';

interface VictoryScreenProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}분 ${sec}초`;
}

export function VictoryScreen({ state, dispatch }: VictoryScreenProps) {
  const { stats } = state;
  const elapsed = stats.runStartedAt !== null ? Date.now() - stats.runStartedAt : 0;

  const handlePlayAgain = () => dispatch({ type: 'RESTART_FROM_VICTORY' });

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
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '5rem' }}>🏆</div>

      <h1
        style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, color: 'var(--color-success)' }}
      >
        {t('victory.title')}
      </h1>

      <p style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-muted)' }}>
        {t('victory.subtitle')}
      </p>

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          minWidth: '280px',
        }}
      >
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>
            {t('victory.clearTime').replace('{time}', '')}
          </span>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)' }}>
            {formatTime(elapsed)}
          </span>
        </div>
        <div>
          <span
            style={{
              color: 'var(--color-success)',
              fontWeight: 700,
              fontSize: 'var(--font-size-lg)',
            }}
          >
            {t('victory.correctAnswers').replace('{count}', String(stats.correctAnswers))}
          </span>
        </div>
        <div>
          <span
            style={{
              color: 'var(--color-danger)',
              fontWeight: 700,
              fontSize: 'var(--font-size-lg)',
            }}
          >
            {t('victory.wrongAnswers').replace('{count}', String(stats.wrongAnswers))}
          </span>
        </div>
      </div>

      <button
        onClick={handlePlayAgain}
        style={{
          minHeight: 'var(--touch-min)',
          padding: 'var(--space-3) var(--space-10)',
          background: 'var(--color-accent)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 700,
        }}
      >
        {t('victory.playAgain')}
      </button>
    </div>
  );
}

import type { GameState, Action, Encounter, Answer } from '../game/types';
import { t } from '../locale/strings';
import { ENCOUNTER_MAP } from '../content/encounters';
import { LOOP_CAVERNS } from '../content/dungeon';

interface DefeatScreenProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

function getOptimalAnswer(enc: Encounter): Answer | null {
  return enc.answers.find((a) => a.correctness === 'optimal') ?? null;
}

export function DefeatScreen({ state, dispatch }: DefeatScreenProps) {
  const dungeonState = state.dungeonState;
  const encounterIndex = dungeonState?.encounterIndex ?? 0;
  const encId = LOOP_CAVERNS.encounterIds[encounterIndex];
  const enc = encId ? ENCOUNTER_MAP[encId] : null;
  const optimalAnswer = enc ? getOptimalAnswer(enc) : null;

  const handleRetry = () => dispatch({ type: 'RETRY_FROM_DEFEAT' });

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
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div style={{ fontSize: '4rem' }}>💀</div>

      <h1
        style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, color: 'var(--color-danger)' }}
      >
        {t('defeat.title')}
      </h1>

      <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-muted)' }}>
        {t('defeat.subtitle')}
      </p>

      {enc && (
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            textAlign: 'left',
          }}
        >
          <p style={{ fontWeight: 600 }}>
            {t('defeat.encounter').replace('{name}', enc.problem.slice(0, 30) + '...')}
          </p>

          {optimalAnswer && (
            <div>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {t('defeat.correctAnswer')}
              </p>
              <p
                style={{
                  fontWeight: 600,
                  color: 'var(--color-success)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                ✓ {optimalAnswer.text}
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
                {optimalAnswer.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleRetry}
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
        {t('defeat.retry')}
      </button>
    </div>
  );
}

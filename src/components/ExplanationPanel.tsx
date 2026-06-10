import { useEffect, useRef } from 'react';
import type { TurnResult } from '../game/types';
import { t } from '../locale/strings';

interface ExplanationPanelProps {
  turn: TurnResult;
  onContinue: () => void;
}

function resultHeadline(turn: TurnResult): string {
  if (turn.correctness === 'optimal') return t('combat.result.optimal');
  if (turn.correctness === 'acceptable') return t('combat.result.acceptable');
  return t('combat.result.wrong');
}

function headlineColor(turn: TurnResult): string {
  if (turn.correctness === 'optimal') return 'var(--color-success)';
  if (turn.correctness === 'acceptable') return 'var(--color-warning)';
  return 'var(--color-danger)';
}

export function ExplanationPanel({ turn, onContinue }: ExplanationPanelProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Move focus to the continue button so keyboard users can proceed without tabbing
  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  return (
    <div
      role="region"
      aria-label="설명"
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${headlineColor(turn)}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 700,
          color: headlineColor(turn),
        }}
      >
        {resultHeadline(turn)}
      </p>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        {turn.dmgDealt > 0 && (
          <span>⚔️ {t('combat.dmgDealt').replace('{dmg}', String(turn.dmgDealt))}</span>
        )}
        {turn.dmgTaken > 0 && (
          <span>🛡️ {t('combat.dmgTaken').replace('{dmg}', String(turn.dmgTaken))}</span>
        )}
        {turn.dmgDealt === 0 && turn.dmgTaken === 0 && <span>데미지 없음</span>}
      </div>

      <p style={{ lineHeight: 1.7 }}>{turn.explanation}</p>

      <button
        ref={btnRef}
        onClick={onContinue}
        style={{
          alignSelf: 'flex-end',
          minHeight: 'var(--touch-min)',
          padding: 'var(--space-2) var(--space-6)',
          background: turn.playerDefeated
            ? 'var(--color-danger)'
            : turn.monsterDefeated
              ? 'var(--color-success)'
              : 'var(--color-accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-md)',
          fontWeight: 600,
        }}
      >
        {turn.playerDefeated
          ? '패배 화면으로'
          : turn.monsterDefeated
            ? '다음 전투로'
            : t('combat.next')}
      </button>
    </div>
  );
}

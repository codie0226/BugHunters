import type { PlayerState } from '../game/types';
import { t } from '../locale/strings';
import { XP_CURVE } from '../game/tuning';

interface StatusBarProps {
  player: PlayerState;
}

export function StatusBar({ player }: StatusBarProps) {
  const nextThreshold = XP_CURVE[player.level - 1] ?? null;
  const prevThreshold = player.level >= 2 ? (XP_CURVE[player.level - 2] ?? 0) : 0;
  const xpRange = nextThreshold !== null ? nextThreshold - prevThreshold : 1;
  const xpProgress = nextThreshold !== null ? ((player.xp - prevThreshold) / xpRange) * 100 : 100;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-5)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          {t('level.label')}
        </span>
        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{player.level}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flex: 1 }}>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          {t('xp.label')}: {player.xp}
          {nextThreshold !== null && ` / ${nextThreshold}`}
        </span>
        <div
          style={{
            height: '6px',
            background: 'var(--color-hp-track)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, xpProgress)}%`,
              height: '100%',
              background: 'var(--color-xp)',
              transition: 'width var(--transition-med)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          minWidth: '120px',
        }}
      >
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          {t('hp.label')}: {player.hp}/{player.maxHp}
        </span>
        <div
          style={{
            height: '6px',
            background: 'var(--color-hp-track)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100))}%`,
              height: '100%',
              background: 'var(--color-hp-player)',
              transition: 'width var(--transition-med)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

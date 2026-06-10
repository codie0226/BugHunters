interface HpBarProps {
  current: number;
  max: number;
  variant?: 'player' | 'monster';
  label?: string;
}

export function HpBar({ current, max, variant = 'player', label }: HpBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const fillColor = variant === 'player' ? 'var(--color-hp-player)' : 'var(--color-hp-monster)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {label && (
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          {label}: {current}/{max}
        </span>
      )}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? (variant === 'player' ? '플레이어 HP' : '몬스터 HP')}
        style={{
          height: '12px',
          background: 'var(--color-hp-track)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: fillColor,
            transition: 'width var(--transition-med)',
            borderRadius: 'var(--radius-sm)',
          }}
        />
      </div>
    </div>
  );
}

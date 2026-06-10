import { useEffect, useState } from 'react';
import { t } from '../locale/strings';

interface LevelUpToastProps {
  level: number;
  onDone: () => void;
}

const DISPLAY_MS = 1500;

/** Shows a level-up toast for at least DISPLAY_MS (≥ 1.5 s) per AC-6. */
export function LevelUpToast({ level, onDone }: LevelUpToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--color-accent)',
        color: '#fff',
        padding: 'var(--space-6) var(--space-10)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)' }}>⬆️</div>
      <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{t('level.up')}</div>
      <div style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--space-2)' }}>
        {t('level.label')} {level}
      </div>
    </div>
  );
}

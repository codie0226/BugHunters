import { useEffect, useRef } from 'react';
import { t } from '../locale/strings';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

export function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 800,
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          maxWidth: '480px',
          width: '100%',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        <h2
          id="tutorial-title"
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            textAlign: 'center',
            color: 'var(--color-accent)',
          }}
        >
          📖 {t('tutorial.title')}
        </h2>
        <p
          style={{
            whiteSpace: 'pre-line',
            lineHeight: 1.8,
            color: 'var(--color-text)',
          }}
        >
          {t('tutorial.body')}
        </p>
        <button
          ref={btnRef}
          onClick={onDismiss}
          style={{
            minHeight: 'var(--touch-min)',
            padding: 'var(--space-3) var(--space-8)',
            background: 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            alignSelf: 'center',
          }}
        >
          {t('tutorial.dismiss')}
        </button>
      </div>
    </div>
  );
}

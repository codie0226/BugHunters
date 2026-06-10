import { useEffect, useRef } from 'react';
import { t } from '../locale/strings';

interface ConfirmDialogProps {
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, body, onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  // Focus the cancel button on mount (safe default — destructive action requires intentional choice)
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 900,
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          maxWidth: '400px',
          width: '100%',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        <h2 id="confirm-title" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
          {title}
        </h2>
        <p style={{ color: 'var(--color-text-muted)' }}>{body}</p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            style={{
              minHeight: 'var(--touch-min)',
              padding: 'var(--space-2) var(--space-5)',
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-md)',
            }}
          >
            {t('title.restart.confirm.no')}
          </button>
          <button
            onClick={onConfirm}
            style={{
              minHeight: 'var(--touch-min)',
              padding: 'var(--space-2) var(--space-5)',
              background: 'var(--color-danger)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 600,
            }}
          >
            {t('title.restart.confirm.yes')}
          </button>
        </div>
      </div>
    </div>
  );
}

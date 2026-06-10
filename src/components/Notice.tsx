import { t } from '../locale/strings';
import type { NoticeId } from '../game/types';
import type { StringId } from '../locale/ko';

const NOTICE_TEXT: Record<NoticeId, StringId> = {
  'save.disabled': 'save.disabled',
  'save.versionMismatch': 'save.versionMismatch',
  'save.corrupt': 'save.corrupt',
};

interface NoticeProps {
  noticeId: NoticeId;
  onDismiss: () => void;
}

export function Notice({ noticeId, onDismiss }: NoticeProps) {
  return (
    <div
      role="alert"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-warning)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 'var(--font-size-lg)' }}>
        ⚠️
      </span>
      <span style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>{t(NOTICE_TEXT[noticeId])}</span>
      <button
        onClick={onDismiss}
        style={{
          minHeight: 'var(--touch-min)',
          padding: 'var(--space-1) var(--space-3)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
          borderRadius: 'var(--radius-sm)',
        }}
        aria-label={t('notice.dismiss')}
      >
        ✕
      </button>
    </div>
  );
}

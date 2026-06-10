import type { Answer, Correctness } from '../game/types';

interface AnswerChoiceProps {
  answer: Answer;
  index: number;
  submitted: boolean;
  selectedCorrectness: Correctness | null;
  onSelect: (answer: Answer) => void;
  disabled: boolean;
}

const ICON: Record<Correctness, string> = {
  optimal: '✓',
  acceptable: '~',
  wrong: '✗',
};

const CORRECTNESS_LABEL: Record<Correctness, string> = {
  optimal: '최적',
  acceptable: '가능',
  wrong: '오답',
};

function getBorderColor(correctness: Correctness): string {
  switch (correctness) {
    case 'optimal':
      return 'var(--color-success)';
    case 'acceptable':
      return 'var(--color-warning)';
    case 'wrong':
      return 'var(--color-danger)';
  }
}

function getBgColor(correctness: Correctness): string {
  switch (correctness) {
    case 'optimal':
      return 'var(--color-success-bg)';
    case 'acceptable':
      return 'var(--color-warning-bg)';
    case 'wrong':
      return 'var(--color-danger-bg)';
  }
}

export function AnswerChoice({ answer, index, submitted, onSelect, disabled }: AnswerChoiceProps) {
  const handleClick = () => {
    if (!disabled) onSelect(answer);
  };

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-3)',
    width: '100%',
    minHeight: 'var(--touch-min)',
    padding: 'var(--space-3) var(--space-4)',
    background: submitted ? getBgColor(answer.correctness) : 'var(--color-surface-elevated)',
    border: submitted ? `2px solid ${getBorderColor(answer.correctness)}` : '2px solid transparent',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)',
    fontSize: 'var(--font-size-md)',
    textAlign: 'left',
    transition: 'background var(--transition-fast), border-color var(--transition-fast)',
    cursor: disabled ? 'default' : 'pointer',
  };

  return (
    <button
      data-answer={index}
      onClick={handleClick}
      disabled={disabled}
      style={baseStyle}
      aria-pressed={submitted ? true : undefined}
    >
      <span
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: submitted ? getBorderColor(answer.correctness) : 'var(--color-text-muted)',
        }}
        aria-hidden={!submitted}
      >
        {submitted ? ICON[answer.correctness] : String.fromCharCode(65 + index)}
      </span>
      <span style={{ flex: 1 }}>
        {answer.text}
        {submitted && (
          <span
            style={{
              display: 'inline-block',
              marginLeft: 'var(--space-2)',
              fontSize: 'var(--font-size-sm)',
              color: getBorderColor(answer.correctness),
              fontWeight: 600,
            }}
          >
            ({CORRECTNESS_LABEL[answer.correctness]})
          </span>
        )}
      </span>
    </button>
  );
}

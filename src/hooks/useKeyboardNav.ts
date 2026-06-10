import { useEffect, useRef } from 'react';

/**
 * Wires keyboard navigation for a list of answer buttons.
 * Tab/Shift-Tab cycles focus among them; ArrowDown/ArrowUp also move focus.
 * Enter submits the currently-focused answer.
 *
 * Returns a ref to attach to the container element.
 */
export function useKeyboardNav(
  answerCount: number,
  onSubmit: (index: number) => void,
  disabled: boolean,
): React.RefObject<HTMLDivElement> {
  const containerRef = useRef<HTMLDivElement>(null);
  const focusedIndex = useRef(0);

  useEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[data-answer]'),
    );
    if (buttons.length === 0) return;

    // Focus first button on mount
    buttons[0]?.focus();
    focusedIndex.current = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
      e.preventDefault();

      if (e.key === 'ArrowDown') {
        focusedIndex.current = (focusedIndex.current + 1) % answerCount;
        buttons[focusedIndex.current]?.focus();
      } else if (e.key === 'ArrowUp') {
        focusedIndex.current = (focusedIndex.current - 1 + answerCount) % answerCount;
        buttons[focusedIndex.current]?.focus();
      } else if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        const idx = buttons.indexOf(activeEl as HTMLButtonElement);
        if (idx !== -1) {
          onSubmit(idx);
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [answerCount, onSubmit, disabled]);

  return containerRef;
}

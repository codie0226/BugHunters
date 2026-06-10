import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TutorialOverlay } from '../components/TutorialOverlay';

describe('TutorialOverlay — AC-14', () => {
  it('renders with the combat verbs explanation', () => {
    const onDismiss = vi.fn();
    render(<TutorialOverlay onDismiss={onDismiss} />);
    expect(screen.getByRole('dialog', { name: /전투 방법/ })).toBeInTheDocument();
    expect(screen.getByText(/알고리즘/)).toBeInTheDocument();
  });

  it('calls onDismiss when 확인 is clicked', () => {
    const onDismiss = vi.fn();
    render(<TutorialOverlay onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /확인/ }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('calls onDismiss when Escape is pressed', () => {
    const onDismiss = vi.fn();
    render(<TutorialOverlay onDismiss={onDismiss} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

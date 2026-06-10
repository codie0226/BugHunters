import { describe, it, expect } from 'vitest';
import { COMPLEXITY_MULTIPLIER, XP_CURVE } from '../game/tuning';

describe('COMPLEXITY_MULTIPLIER (FR-2.4 spec-pinned values)', () => {
  it('O(1) = 3.0', () => expect(COMPLEXITY_MULTIPLIER['O(1)']).toBe(3.0));
  it('O(log n) = 2.5', () => expect(COMPLEXITY_MULTIPLIER['O(log n)']).toBe(2.5));
  it('O(n) = 2.0', () => expect(COMPLEXITY_MULTIPLIER['O(n)']).toBe(2.0));
  it('O(n log n) = 1.5', () => expect(COMPLEXITY_MULTIPLIER['O(n log n)']).toBe(1.5));
  it('O(n²) = 1.0', () => expect(COMPLEXITY_MULTIPLIER['O(n²)']).toBe(1.0));
});

describe('XP_CURVE', () => {
  it('has exactly 4 thresholds for levels 1→5', () => {
    expect(XP_CURVE.length).toBe(4);
  });

  it('thresholds are strictly increasing', () => {
    for (let i = 1; i < XP_CURVE.length; i++) {
      expect(XP_CURVE[i]).toBeGreaterThan(XP_CURVE[i - 1] as number);
    }
  });
});

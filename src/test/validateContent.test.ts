import { describe, it, expect } from 'vitest';
import { validateContent } from '../content/validateContent';
import { ENCOUNTERS } from '../content/encounters';
import { MONSTER_MAP } from '../content/monsters';
import { LOOP_CAVERNS } from '../content/dungeon';

describe('validateContent — shipped content', () => {
  it('passes with no errors', () => {
    const result = validateContent();
    if (!result.valid) {
      console.error('Content validation errors:', result.errors);
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('every encounter has exactly one optimal answer', () => {
    for (const enc of ENCOUNTERS) {
      const optCount = enc.answers.filter((a) => a.correctness === 'optimal').length;
      expect(optCount).toBe(1);
    }
  });

  it('every encounter has 3 or 4 answers', () => {
    for (const enc of ENCOUNTERS) {
      expect(enc.answers.length).toBeGreaterThanOrEqual(3);
      expect(enc.answers.length).toBeLessThanOrEqual(4);
    }
  });

  it('every monster id referenced in encounters exists in MONSTER_MAP', () => {
    for (const enc of ENCOUNTERS) {
      expect(MONSTER_MAP[enc.monsterId]).toBeDefined();
    }
  });

  it('dungeon references exactly 5 known encounter ids', () => {
    expect(LOOP_CAVERNS.encounterIds.length).toBe(5);
    const encIds = new Set(ENCOUNTERS.map((e) => e.id));
    for (const eid of LOOP_CAVERNS.encounterIds) {
      expect(encIds.has(eid)).toBe(true);
    }
  });

  it('every encounter problem has Korean (Hangul) text', () => {
    for (const enc of ENCOUNTERS) {
      expect(/[가-힣]/.test(enc.problem)).toBe(true);
    }
  });

  it('every answer text and explanation is non-empty', () => {
    for (const enc of ENCOUNTERS) {
      for (const ans of enc.answers) {
        expect(ans.text.trim().length).toBeGreaterThan(0);
        expect(ans.explanation.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

import { describe, it, expect } from 'vitest';
import { resolveTurn } from '../game/damage';
import { BASE_DMG, COMPLEXITY_MULTIPLIER } from '../game/tuning';
import type { Answer, Monster } from '../game/types';

const MONSTER: Monster = {
  id: 'm1',
  name: '테스트',
  maxHp: 100,
  dmg: 8,
  xpReward: 10,
  glyph: '🧪',
};

function makeAnswer(correctness: Answer['correctness'], complexity: Answer['complexity']): Answer {
  return {
    id: 'a1',
    text: '테스트',
    correctness,
    complexity,
    explanation: '설명',
  };
}

describe('resolveTurn — optimal answers', () => {
  it('O(1) optimal: deals BASE_DMG * 3.0, takes 0 (AC-3)', () => {
    const result = resolveTurn(makeAnswer('optimal', 'O(1)'), 50, 100, MONSTER);
    expect(result.dmgDealt).toBe(Math.round(BASE_DMG * COMPLEXITY_MULTIPLIER['O(1)']));
    expect(result.dmgTaken).toBe(0);
    expect(result.playerHp).toBe(50);
  });

  it('O(log n) optimal: deals BASE_DMG * 2.5, takes 0', () => {
    const result = resolveTurn(makeAnswer('optimal', 'O(log n)'), 50, 100, MONSTER);
    expect(result.dmgDealt).toBe(Math.round(BASE_DMG * COMPLEXITY_MULTIPLIER['O(log n)']));
    expect(result.dmgTaken).toBe(0);
  });

  it('O(n) optimal: deals BASE_DMG * 2.0, takes 0', () => {
    const result = resolveTurn(makeAnswer('optimal', 'O(n)'), 50, 100, MONSTER);
    expect(result.dmgDealt).toBe(Math.round(BASE_DMG * COMPLEXITY_MULTIPLIER['O(n)']));
    expect(result.dmgTaken).toBe(0);
  });

  it('O(n log n) optimal: deals BASE_DMG * 1.5, takes 0', () => {
    const result = resolveTurn(makeAnswer('optimal', 'O(n log n)'), 50, 100, MONSTER);
    expect(result.dmgDealt).toBe(Math.round(BASE_DMG * COMPLEXITY_MULTIPLIER['O(n log n)']));
    expect(result.dmgTaken).toBe(0);
  });

  it('O(n²) optimal: deals BASE_DMG * 1.0, takes 0', () => {
    const result = resolveTurn(makeAnswer('optimal', 'O(n²)'), 50, 100, MONSTER);
    expect(result.dmgDealt).toBe(Math.round(BASE_DMG * COMPLEXITY_MULTIPLIER['O(n²)']));
    expect(result.dmgTaken).toBe(0);
  });
});

describe('resolveTurn — acceptable answers', () => {
  it('O(n) acceptable: deals BASE_DMG * 2.0 * 0.5 = 10, takes monster.dmg * 0.5 = 4', () => {
    const result = resolveTurn(makeAnswer('acceptable', 'O(n)'), 50, 100, MONSTER);
    expect(result.dmgDealt).toBe(10);
    expect(result.dmgTaken).toBe(4);
    expect(result.playerHp).toBe(46);
  });
});

describe('resolveTurn — wrong answers', () => {
  it('wrong: deals 0, takes full MONSTER.dmg (AC-4)', () => {
    const result = resolveTurn(makeAnswer('wrong', 'O(n²)'), 50, 100, MONSTER);
    expect(result.dmgDealt).toBe(0);
    expect(result.dmgTaken).toBe(MONSTER.dmg);
    expect(result.playerHp).toBe(50 - MONSTER.dmg);
    expect(result.monsterHp).toBe(100);
  });
});

describe('resolveTurn — boundary cases', () => {
  it('overkill clamps monster HP to 0', () => {
    // Monster has 1 HP, O(1) optimal deals 30 — result must be 0 not negative
    const result = resolveTurn(makeAnswer('optimal', 'O(1)'), 50, 1, MONSTER);
    expect(result.monsterHp).toBe(0);
    expect(result.monsterDefeated).toBe(true);
  });

  it('lethal player hit clamps player HP to 0', () => {
    const result = resolveTurn(makeAnswer('wrong', 'O(n²)'), 4, 100, MONSTER);
    // MONSTER.dmg = 8, player has 4 HP → would go to -4, clamped to 0
    expect(result.playerHp).toBe(0);
    expect(result.playerDefeated).toBe(true);
  });

  it('exact lethal monster hit sets monsterDefeated true', () => {
    // MONSTER.dmg = 8, O(1) deals 30; monster with exactly 30 HP
    const result = resolveTurn(makeAnswer('optimal', 'O(1)'), 50, 30, MONSTER);
    expect(result.monsterHp).toBe(0);
    expect(result.monsterDefeated).toBe(true);
    expect(result.xpGained).toBe(MONSTER.xpReward);
  });

  it('non-lethal turn: xpGained = 0', () => {
    const result = resolveTurn(makeAnswer('optimal', 'O(1)'), 50, 100, MONSTER);
    expect(result.xpGained).toBe(0);
    expect(result.monsterDefeated).toBe(false);
  });

  it('explanation is forwarded from the answer', () => {
    const ans = { ...makeAnswer('wrong', 'O(n²)'), explanation: '이 설명입니다' };
    const result = resolveTurn(ans, 50, 100, MONSTER);
    expect(result.explanation).toBe('이 설명입니다');
  });
});

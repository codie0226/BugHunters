import { describe, it, expect } from 'vitest';
import { applyXp } from '../game/progression';
import { HP_PER_LEVEL, XP_CURVE } from '../game/tuning';
import type { PlayerState } from '../game/types';

const BASE_PLAYER: PlayerState = { level: 1, xp: 0, hp: 50, maxHp: 50 };

describe('applyXp — no level-up', () => {
  it('XP below threshold: level stays, xp accumulates', () => {
    const result = applyXp(BASE_PLAYER, 10);
    expect(result.leveledUp).toBe(false);
    expect(result.levelsGained).toBe(0);
    expect(result.player.xp).toBe(10);
    expect(result.player.level).toBe(1);
    expect(result.player.hp).toBe(50); // no heal
  });

  it('0 xp returns unchanged player', () => {
    const result = applyXp(BASE_PLAYER, 0);
    expect(result.player).toBe(BASE_PLAYER); // same reference
    expect(result.leveledUp).toBe(false);
  });
});

describe('applyXp — single level-up (AC-6)', () => {
  it('crossing threshold 1 bumps to level 2, restores HP, increases maxHp', () => {
    const threshold = XP_CURVE[0] as number; // level 2 threshold = 20
    const result = applyXp(BASE_PLAYER, threshold);
    expect(result.leveledUp).toBe(true);
    expect(result.levelsGained).toBe(1);
    expect(result.player.level).toBe(2);
    expect(result.player.maxHp).toBe(50 + HP_PER_LEVEL);
    expect(result.player.hp).toBe(result.player.maxHp); // fully restored
    expect(result.player.xp).toBe(threshold);
  });
});

describe('applyXp — multi-level skip', () => {
  it('large XP grant can skip multiple levels', () => {
    const threshold3 = XP_CURVE[2] as number; // 100 — enough for level 4
    const result = applyXp(BASE_PLAYER, threshold3);
    expect(result.player.level).toBeGreaterThanOrEqual(3);
    expect(result.leveledUp).toBe(true);
    expect(result.levelsGained).toBeGreaterThanOrEqual(2);
  });
});

describe('applyXp — level cap at 5', () => {
  it('extra XP at max level retains XP but does not exceed level 5', () => {
    const maxPlayer: PlayerState = { level: 5, xp: 180, hp: 130, maxHp: 130 };
    const result = applyXp(maxPlayer, 9999);
    expect(result.player.level).toBe(5);
    expect(result.player.xp).toBe(180 + 9999);
    expect(result.leveledUp).toBe(false);
    expect(result.levelsGained).toBe(0);
  });
});

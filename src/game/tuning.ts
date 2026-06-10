import type { Complexity } from './types';

// Designer-tunable combat constants.
// To re-tune: change BASE_DMG/MONSTER_DMG/monster maxHp/xpReward here and in content/monsters.ts.
// The integration test will catch an unwinnable or trivially-easy config.

/** Base damage an optimal answer deals before the complexity multiplier. */
export const BASE_DMG = 10;

/** Default monster damage per turn; individual monsters may override via Monster.dmg. */
export const MONSTER_DMG = 8;

/** Complexity multiplier table per FR-2.4. These values are spec-pinned — tests guard them. */
export const COMPLEXITY_MULTIPLIER: Record<Complexity, number> = {
  'O(1)': 3.0,
  'O(log n)': 2.5,
  'O(n)': 2.0,
  'O(n log n)': 1.5,
  'O(n²)': 1.0,
};

/** HP gained per level-up (applied to maxHp; HP fully restored on level-up). */
export const HP_PER_LEVEL = 20;

/** Starting max HP at level 1. */
export const BASE_MAX_HP = 50;

/**
 * XP thresholds to reach levels 2, 3, 4, 5.
 * Length must equal 4 (transitions for a 1-to-5 level span).
 * 5 encounters award 15, 25, 15, 25, 60 XP = 140 total — designed so an all-optimal
 * run hits level 3 mid-dungeon, giving a satisfying arc without overflow.
 */
export const XP_CURVE: readonly number[] = [20, 50, 100, 180];

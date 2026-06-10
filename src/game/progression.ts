import type { PlayerState } from './types';
import { HP_PER_LEVEL, XP_CURVE } from './tuning';

interface ProgressionResult {
  player: PlayerState;
  leveledUp: boolean;
  levelsGained: number;
}

/**
 * Applies gained XP to a player, handling level-ups.
 * On level-up: maxHp increases by HP_PER_LEVEL per level gained; HP is fully restored.
 * Level is capped at 5; extra XP is retained but level does not exceed 5.
 */
export function applyXp(player: PlayerState, xpGained: number): ProgressionResult {
  if (xpGained === 0) {
    return { player, leveledUp: false, levelsGained: 0 };
  }

  const newXp = player.xp + xpGained;
  let newLevel = player.level;

  // Walk thresholds to determine new level
  for (let i = newLevel - 1; i < XP_CURVE.length; i++) {
    const threshold = XP_CURVE[i];
    if (threshold !== undefined && newXp >= threshold) {
      newLevel = i + 2; // XP_CURVE[0] = threshold for level 2, etc.
    } else {
      break;
    }
  }

  // Cap at level 5
  newLevel = Math.min(newLevel, 5);
  const levelsGained = newLevel - player.level;

  if (levelsGained === 0) {
    return {
      player: { ...player, xp: newXp },
      leveledUp: false,
      levelsGained: 0,
    };
  }

  const newMaxHp = player.maxHp + HP_PER_LEVEL * levelsGained;

  return {
    player: {
      level: newLevel,
      xp: newXp,
      hp: newMaxHp,
      maxHp: newMaxHp,
    },
    leveledUp: true,
    levelsGained,
  };
}

import type { Answer, Monster, TurnResult } from './types';
import { BASE_DMG, COMPLEXITY_MULTIPLIER } from './tuning';

/**
 * Resolves a single combat turn deterministically.
 * No side effects; called from the reducer.
 *
 * XP is calculated here only for monsterDefeated turns; the caller
 * (reducer) is responsible for applying XP via applyXp.
 */
export function resolveTurn(
  answer: Answer,
  playerHp: number,
  monsterHp: number,
  monster: Monster,
): TurnResult {
  const mult = COMPLEXITY_MULTIPLIER[answer.complexity];
  const mDmg = monster.dmg;

  let dmgDealt: number;
  let dmgTaken: number;

  switch (answer.correctness) {
    case 'optimal':
      dmgDealt = Math.round(BASE_DMG * mult);
      dmgTaken = 0;
      break;
    case 'acceptable':
      dmgDealt = Math.round(BASE_DMG * mult * 0.5);
      dmgTaken = Math.round(mDmg * 0.5);
      break;
    case 'wrong':
      dmgDealt = 0;
      dmgTaken = mDmg;
      break;
  }

  const newPlayerHp = Math.max(0, playerHp - dmgTaken);
  const newMonsterHp = Math.max(0, monsterHp - dmgDealt);
  const monsterDefeated = newMonsterHp === 0;
  const playerDefeated = newPlayerHp === 0;

  return {
    playerHp: newPlayerHp,
    monsterHp: newMonsterHp,
    dmgDealt,
    dmgTaken,
    correctness: answer.correctness,
    explanation: answer.explanation,
    monsterDefeated,
    playerDefeated,
    // XP awarded when monster is defeated; the reducer applies it via applyXp
    xpGained: monsterDefeated ? monster.xpReward : 0,
    // leveledUp and levelsGained are filled in by the reducer after applyXp
    leveledUp: false,
    levelsGained: 0,
  };
}

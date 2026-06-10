import type { GameState, Encounter, Monster } from './types';
import { ENCOUNTER_MAP } from '../content/encounters';
import { MONSTER_MAP } from '../content/monsters';
import { LOOP_CAVERNS } from '../content/dungeon';

export function currentEncounter(state: GameState): Encounter | null {
  if (!state.dungeonState) return null;
  const encId = LOOP_CAVERNS.encounterIds[state.dungeonState.encounterIndex];
  if (!encId) return null;
  return ENCOUNTER_MAP[encId] ?? null;
}

export function currentMonster(state: GameState): Monster | null {
  const enc = currentEncounter(state);
  if (!enc) return null;
  return MONSTER_MAP[enc.monsterId] ?? null;
}

export function isDungeonCleared(state: GameState): boolean {
  return state.mapState.cleared.includes('loopCaverns');
}

export function isFirstEncounter(state: GameState): boolean {
  return state.dungeonState?.encounterIndex === 0;
}

import type { SavePayload, PlayerState, MapState, RunStats } from './types';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'bug-hunters:save:v1';

function isPlayerState(v: unknown): v is PlayerState {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p['level'] === 'number' &&
    typeof p['xp'] === 'number' &&
    typeof p['hp'] === 'number' &&
    typeof p['maxHp'] === 'number'
  );
}

function isMapState(v: unknown): v is MapState {
  if (typeof v !== 'object' || v === null) return false;
  const m = v as Record<string, unknown>;
  return (
    Array.isArray(m['unlocked']) &&
    Array.isArray(m['cleared']) &&
    typeof m['currentNode'] === 'string'
  );
}

function isStats(v: unknown): v is RunStats {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    (s['runStartedAt'] === null || typeof s['runStartedAt'] === 'number') &&
    typeof s['correctAnswers'] === 'number' &&
    typeof s['wrongAnswers'] === 'number'
  );
}

function isDungeonState(v: unknown): v is NonNullable<SavePayload['dungeonState']> {
  if (v === null) return true; // null is valid
  if (typeof v !== 'object' || v === null) return false;
  const d = v as Record<string, unknown>;
  return (
    typeof d['dungeonId'] === 'string' &&
    typeof d['encounterIndex'] === 'number' &&
    typeof d['encounterEntryHp'] === 'number'
  );
}

/** Type-guard validator for the save payload shape + version. */
export function validate(payload: unknown): payload is SavePayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const p = payload as Record<string, unknown>;

  if (p['version'] !== SAVE_VERSION) return false;
  if (!isPlayerState(p['player'])) return false;
  if (!isMapState(p['mapState'])) return false;
  if (!isDungeonState(p['dungeonState'] ?? null)) return false;
  if (!isStats(p['stats'])) return false;
  if (typeof p['tutorialDismissed'] !== 'boolean') return false;

  return true;
}

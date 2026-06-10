import type { SavePayload } from './types';
import { SAVE_KEY, SAVE_VERSION, validate } from './saveSchema';

export type LoadResult =
  | { kind: 'ok'; payload: SavePayload }
  | { kind: 'absent' }
  | { kind: 'corrupt' }
  | { kind: 'versionMismatch' }
  | { kind: 'unavailable' };

function getStorage(): Storage | null {
  try {
    const s = window.localStorage;
    // Quick probe to detect quota/access errors in some browsers
    s.setItem('__probe__', '1');
    s.removeItem('__probe__');
    return s;
  } catch {
    return null;
  }
}

export function loadSave(): LoadResult {
  const storage = getStorage();
  if (!storage) return { kind: 'unavailable' };

  const raw = storage.getItem(SAVE_KEY);
  if (raw === null) return { kind: 'absent' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { kind: 'corrupt' };
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const p = parsed as Record<string, unknown>;
    if (p['version'] !== SAVE_VERSION) return { kind: 'versionMismatch' };
  }

  if (!validate(parsed)) return { kind: 'corrupt' };

  return { kind: 'ok', payload: parsed };
}

export function writeSave(payload: SavePayload): boolean {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    const storage = getStorage();
    storage?.removeItem(SAVE_KEY);
  } catch {
    // Unavailable storage — nothing to clear
  }
}

/** Builds a SavePayload from the parts of GameState that are durable. */
export function buildSavePayload(
  player: SavePayload['player'],
  mapState: SavePayload['mapState'],
  dungeonState: SavePayload['dungeonState'],
  stats: SavePayload['stats'],
  tutorialDismissed: boolean,
): SavePayload {
  return { version: SAVE_VERSION, player, mapState, dungeonState, stats, tutorialDismissed };
}

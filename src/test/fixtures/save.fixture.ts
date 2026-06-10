import type { SavePayload } from '../../game/types';
import { SAVE_VERSION } from '../../game/saveSchema';

export const VALID_SAVE: SavePayload = {
  version: SAVE_VERSION,
  player: { level: 2, xp: 35, hp: 60, maxHp: 70 },
  mapState: {
    unlocked: ['tutorialTown', 'loopCaverns'],
    cleared: [],
    currentNode: 'loopCaverns',
  },
  dungeonState: {
    dungeonId: 'loop-caverns',
    encounterIndex: 2,
    encounterEntryHp: 60,
  },
  stats: { runStartedAt: 1000000, correctAnswers: 2, wrongAnswers: 0 },
  tutorialDismissed: true,
};

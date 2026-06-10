import type { Dungeon } from '../game/types';

export const LOOP_CAVERNS: Dungeon = {
  id: 'loop-caverns',
  name: 'Loop Caverns',
  encounterIds: ['enc-1', 'enc-2', 'enc-3', 'enc-4', 'enc-5'],
} satisfies Dungeon;

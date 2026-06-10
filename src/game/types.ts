export type Complexity = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)';
export type Correctness = 'optimal' | 'acceptable' | 'wrong';

export interface Answer {
  readonly id: string;
  readonly text: string;
  readonly correctness: Correctness;
  readonly complexity: Complexity;
  readonly explanation: string;
}

export interface Monster {
  readonly id: string;
  readonly name: string;
  readonly maxHp: number;
  readonly dmg: number;
  readonly xpReward: number;
  readonly glyph: string;
  readonly isBoss?: boolean;
}

export interface Encounter {
  readonly id: string;
  readonly monsterId: Monster['id'];
  readonly problem: string;
  readonly codeSnippet?: string;
  readonly answers: readonly Answer[];
}

export interface Dungeon {
  readonly id: string;
  readonly name: string;
  readonly encounterIds: readonly Encounter['id'][];
}

export interface PlayerState {
  readonly level: number;
  readonly xp: number;
  readonly hp: number;
  readonly maxHp: number;
}

export type MapNodeId = 'tutorialTown' | 'loopCaverns' | 'bossLair';

export type Screen = 'title' | 'map' | 'encounter' | 'defeat' | 'victory';

export interface TurnResult {
  readonly playerHp: number;
  readonly monsterHp: number;
  readonly dmgDealt: number;
  readonly dmgTaken: number;
  readonly correctness: Correctness;
  readonly explanation: string;
  readonly monsterDefeated: boolean;
  readonly playerDefeated: boolean;
  readonly xpGained: number;
  readonly leveledUp: boolean;
  readonly levelsGained: number;
}

export type NoticeId = 'save.disabled' | 'save.versionMismatch' | 'save.corrupt';

export interface MapState {
  readonly unlocked: readonly MapNodeId[];
  readonly cleared: readonly MapNodeId[];
  readonly currentNode: MapNodeId;
}

export interface DungeonState {
  readonly dungeonId: string;
  readonly encounterIndex: number;
  readonly monsterHp: number;
  readonly encounterEntryHp: number;
}

export interface RunStats {
  readonly runStartedAt: number | null;
  readonly correctAnswers: number;
  readonly wrongAnswers: number;
}

export interface GameState {
  readonly screen: Screen;
  readonly player: PlayerState;
  readonly mapState: MapState;
  readonly dungeonState: DungeonState | null;
  readonly stats: RunStats;
  readonly tutorialDismissed: boolean;
  readonly lastTurn: TurnResult | null;
  readonly saveDisabled: boolean;
  readonly pendingNotice: NoticeId | null;
  readonly saveAvailable: boolean;
}

export type Action =
  | { type: 'START_NEW_GAME' }
  | { type: 'CONTINUE_FROM_SAVE'; payload: SavePayload }
  | { type: 'SELECT_MAP_NODE'; nodeId: MapNodeId }
  | { type: 'ENTER_DUNGEON' }
  | { type: 'ENCOUNTER_ENTERED' }
  | { type: 'SUBMIT_ANSWER'; answer: Answer }
  | { type: 'ADVANCE_AFTER_TURN' }
  | { type: 'RETRY_FROM_DEFEAT' }
  | { type: 'RESTART_FROM_VICTORY' }
  | { type: 'RESET_SAVE' }
  | { type: 'DISMISS_TUTORIAL' }
  | { type: 'DISMISS_NOTICE' }
  | { type: 'LOAD_FAILED'; noticeId: NoticeId }
  | { type: 'SET_SAVE_DISABLED' }
  | { type: 'SET_SAVE_AVAILABLE'; payload: SavePayload };

export interface SavePayload {
  version: number;
  player: PlayerState;
  mapState: MapState;
  dungeonState: Omit<DungeonState, 'monsterHp'> | null;
  stats: RunStats;
  tutorialDismissed: boolean;
}

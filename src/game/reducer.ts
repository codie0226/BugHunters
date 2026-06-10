import type { Action, GameState, PlayerState } from './types';
import { ENCOUNTER_MAP } from '../content/encounters';
import { MONSTER_MAP } from '../content/monsters';
import { LOOP_CAVERNS } from '../content/dungeon';
import { resolveTurn } from './damage';
import { applyXp } from './progression';
import { BASE_MAX_HP } from './tuning';

const INITIAL_PLAYER: PlayerState = {
  level: 1,
  xp: 0,
  hp: BASE_MAX_HP,
  maxHp: BASE_MAX_HP,
};

export const INITIAL_STATE: GameState = {
  screen: 'title',
  player: INITIAL_PLAYER,
  mapState: {
    unlocked: ['tutorialTown', 'loopCaverns'],
    cleared: [],
    currentNode: 'tutorialTown',
  },
  dungeonState: null,
  stats: { runStartedAt: null, correctAnswers: 0, wrongAnswers: 0 },
  tutorialDismissed: false,
  lastTurn: null,
  saveDisabled: false,
  pendingNotice: null,
  saveAvailable: false,
};

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_NEW_GAME':
      return {
        ...INITIAL_STATE,
        screen: 'map',
        saveDisabled: state.saveDisabled,
        pendingNotice: state.pendingNotice,
      };

    case 'SET_SAVE_AVAILABLE':
      return { ...state, saveAvailable: true };

    case 'CONTINUE_FROM_SAVE': {
      const p = action.payload;
      const dungeonState = p.dungeonState
        ? {
            ...p.dungeonState,
            // monsterHp is not persisted; restore to full on continue
            monsterHp: getMonsterHpForEncounter(p.dungeonState.encounterIndex),
          }
        : null;
      return {
        ...state,
        screen: 'map',
        player: p.player,
        mapState: p.mapState,
        dungeonState,
        stats: p.stats,
        tutorialDismissed: p.tutorialDismissed,
        lastTurn: null,
        saveAvailable: false,
      };
    }

    case 'SELECT_MAP_NODE':
      return { ...state, mapState: { ...state.mapState, currentNode: action.nodeId } };

    case 'ENTER_DUNGEON': {
      const idx = state.dungeonState?.encounterIndex ?? 0;
      const encId = LOOP_CAVERNS.encounterIds[idx];
      if (!encId) return state;
      const enc = ENCOUNTER_MAP[encId];
      if (!enc) return state;
      const monster = MONSTER_MAP[enc.monsterId];
      if (!monster) return state;
      return {
        ...state,
        screen: 'encounter',
        dungeonState: {
          dungeonId: LOOP_CAVERNS.id,
          encounterIndex: idx,
          monsterHp: monster.maxHp,
          encounterEntryHp: state.player.hp,
        },
        stats: {
          ...state.stats,
          runStartedAt: state.stats.runStartedAt ?? Date.now(),
        },
        lastTurn: null,
      };
    }

    case 'ENCOUNTER_ENTERED': {
      // Records encounterEntryHp so mid-turn refresh restores to this HP
      if (!state.dungeonState) return state;
      return {
        ...state,
        dungeonState: {
          ...state.dungeonState,
          encounterEntryHp: state.player.hp,
        },
      };
    }

    case 'SUBMIT_ANSWER': {
      if (!state.dungeonState) return state;
      const { encounterIndex } = state.dungeonState;
      const encId = LOOP_CAVERNS.encounterIds[encounterIndex];
      if (!encId) return state;
      const enc = ENCOUNTER_MAP[encId];
      if (!enc) return state;
      const monster = MONSTER_MAP[enc.monsterId];
      if (!monster) return state;

      const rawTurn = resolveTurn(
        action.answer,
        state.player.hp,
        state.dungeonState.monsterHp,
        monster,
      );

      const isCorrect = action.answer.correctness !== 'wrong';
      const updatedStats = {
        ...state.stats,
        correctAnswers: isCorrect ? state.stats.correctAnswers + 1 : state.stats.correctAnswers,
        wrongAnswers: !isCorrect ? state.stats.wrongAnswers + 1 : state.stats.wrongAnswers,
      };

      // Apply XP and level-up if monster was defeated
      let updatedPlayer = { ...state.player, hp: rawTurn.playerHp };
      let leveledUp = false;
      let levelsGained = 0;
      if (rawTurn.monsterDefeated) {
        const prog = applyXp(updatedPlayer, rawTurn.xpGained);
        updatedPlayer = prog.player;
        leveledUp = prog.leveledUp;
        levelsGained = prog.levelsGained;
      }

      const turn = { ...rawTurn, leveledUp, levelsGained };

      return {
        ...state,
        player: updatedPlayer,
        dungeonState: {
          ...state.dungeonState,
          monsterHp: rawTurn.monsterHp,
        },
        stats: updatedStats,
        lastTurn: turn,
      };
    }

    case 'ADVANCE_AFTER_TURN': {
      if (!state.lastTurn || !state.dungeonState) return state;
      const { lastTurn, dungeonState } = state;

      if (lastTurn.playerDefeated) {
        return { ...state, screen: 'defeat' };
      }

      if (lastTurn.monsterDefeated) {
        const nextIndex = dungeonState.encounterIndex + 1;
        const isDungeonCleared = nextIndex >= LOOP_CAVERNS.encounterIds.length;

        if (isDungeonCleared) {
          return {
            ...state,
            screen: 'victory',
            mapState: {
              ...state.mapState,
              cleared: addIfMissing(state.mapState.cleared, 'loopCaverns'),
            },
            dungeonState: null,
          };
        }

        // Advance to next encounter
        const nextEncId = LOOP_CAVERNS.encounterIds[nextIndex];
        if (!nextEncId) return state;
        const nextEnc = ENCOUNTER_MAP[nextEncId];
        if (!nextEnc) return state;
        const nextMonster = MONSTER_MAP[nextEnc.monsterId];
        if (!nextMonster) return state;

        return {
          ...state,
          screen: 'encounter',
          dungeonState: {
            ...dungeonState,
            encounterIndex: nextIndex,
            monsterHp: nextMonster.maxHp,
            encounterEntryHp: state.player.hp,
          },
          lastTurn: null,
        };
      }

      // Turn resolved, player alive, monster alive — continue same encounter
      return { ...state, lastTurn: null };
    }

    case 'RETRY_FROM_DEFEAT': {
      if (!state.dungeonState) return state;
      const { encounterIndex } = state.dungeonState;
      const encId = LOOP_CAVERNS.encounterIds[encounterIndex];
      if (!encId) return state;
      const enc = ENCOUNTER_MAP[encId];
      if (!enc) return state;
      const monster = MONSTER_MAP[enc.monsterId];
      if (!monster) return state;

      return {
        ...state,
        screen: 'encounter',
        player: { ...state.player, hp: state.player.maxHp },
        dungeonState: {
          ...state.dungeonState,
          monsterHp: monster.maxHp,
          encounterEntryHp: state.player.maxHp,
        },
        lastTurn: null,
      };
    }

    case 'RESTART_FROM_VICTORY':
      // Keeps level/xp, resets dungeon progress (FR-5.1)
      return {
        ...state,
        screen: 'map',
        dungeonState: null,
        lastTurn: null,
        stats: { runStartedAt: null, correctAnswers: 0, wrongAnswers: 0 },
        player: { ...state.player, hp: state.player.maxHp },
      };

    case 'RESET_SAVE':
      return {
        ...INITIAL_STATE,
        saveDisabled: state.saveDisabled,
      };

    case 'DISMISS_TUTORIAL':
      return { ...state, tutorialDismissed: true };

    case 'DISMISS_NOTICE':
      return { ...state, pendingNotice: null };

    case 'LOAD_FAILED':
      return { ...state, pendingNotice: action.noticeId };

    case 'SET_SAVE_DISABLED':
      return { ...state, saveDisabled: true };

    default:
      return state;
  }
}

function getMonsterHpForEncounter(encounterIndex: number): number {
  const encId = LOOP_CAVERNS.encounterIds[encounterIndex];
  if (!encId) return 0;
  const enc = ENCOUNTER_MAP[encId];
  if (!enc) return 0;
  const monster = MONSTER_MAP[enc.monsterId];
  return monster?.maxHp ?? 0;
}

function addIfMissing<T>(arr: readonly T[], item: T): readonly T[] {
  return arr.includes(item) ? arr : [...arr, item];
}

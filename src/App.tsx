import { createContext, useContext, useEffect, useState } from 'react';
import type { GameState, Action } from './game/types';
import { useGameState } from './hooks/useGameState';
import { TitleScreen } from './components/TitleScreen';
import { WorldMap } from './components/WorldMap';
import { CombatScreen } from './components/CombatScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { DefeatScreen } from './components/DefeatScreen';
import { LevelUpToast } from './components/LevelUpToast';

export interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameContext.Provider');
  return ctx;
}

export default function App() {
  const [state, dispatch] = useGameState();
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Show level-up toast when a turn results in a level-up (AC-6)
  useEffect(() => {
    if (state.lastTurn?.leveledUp) {
      setShowLevelUp(true);
    }
  }, [state.lastTurn]);

  const handleLevelUpDone = () => {
    setShowLevelUp(false);
  };

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <Router state={state} dispatch={dispatch} />
      {showLevelUp && state.lastTurn?.leveledUp && (
        <LevelUpToast level={state.player.level} onDone={handleLevelUpDone} />
      )}
    </GameContext.Provider>
  );
}

interface RouterProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

function Router({ state, dispatch }: RouterProps) {
  switch (state.screen) {
    case 'title':
      return <TitleScreen state={state} dispatch={dispatch} />;
    case 'map':
      return <WorldMap state={state} dispatch={dispatch} />;
    case 'encounter':
      return <CombatScreen state={state} dispatch={dispatch} />;
    case 'victory':
      return <VictoryScreen state={state} dispatch={dispatch} />;
    case 'defeat':
      return <DefeatScreen state={state} dispatch={dispatch} />;
    case 'levelUp':
      // levelUp screen is handled as a toast overlay, not a separate screen
      return <CombatScreen state={state} dispatch={dispatch} />;
  }
}

import { useEffect, useMemo, type ReactNode } from 'react';

import { GameContext } from '@game/context/GameContext';
import { createEngine } from '@game/engine/createEngine';
import { saveState } from '@game/persist/storage';

const storageInterval = 5000;

export interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const engine = useMemo(() => createEngine(), []);

  useEffect(() => {
    engine.start();

    const saveIntervalId = setInterval(() => {
      saveState(engine.getState());
    }, storageInterval);

    return () => {
      clearInterval(saveIntervalId);
      engine.stop();
    };
  }, [engine]);

  const value = useMemo(() => ({ engine }), [engine]);

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

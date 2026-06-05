import { Overlay } from '@components/Overlay';
import { GameProvider } from '@game/context/GameProvider';
import { FactionVisitProvider } from '@game/factions/useFactionVisit';
import { NavigationProvider } from '@navigation/NavigationProvider';
import { GameStageProvider } from '@engine/stage/GameStageProvider';
import { TowerScene } from '@pages/Tower/TowerScene';

import { PageOutlet } from './PageOutlet';

export function App() {
  return (
    <GameProvider>
      <NavigationProvider>
        <FactionVisitProvider>
          <GameStageProvider>
            <TowerScene />
            <div className="pointer-events-none relative min-h-dvh w-full overflow-hidden">
              <div className="relative z-0 min-h-dvh w-full">
                <PageOutlet />
              </div>
              <Overlay />
            </div>
          </GameStageProvider>
        </FactionVisitProvider>
      </NavigationProvider>
    </GameProvider>
  );
}

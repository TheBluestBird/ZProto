import { useState } from 'react';

import { DebugPanel } from '@components/DebugPanel';
import { Overlay } from '@components/Overlay';
import { Scene } from '@components/Scene';
import { GameProvider } from '@game/context/GameProvider';
import { NavigationProvider } from '@navigation/NavigationProvider';

import { PageOutlet } from './PageOutlet';

export function App() {
  const [debugOpen, setDebugOpen] = useState(false);

  return (
    <GameProvider>
      <NavigationProvider>
        <div className="relative min-h-dvh w-full overflow-hidden">
          <Scene />
          <PageOutlet />
          <Overlay onLevelBadgeDoubleClick={() => { setDebugOpen(true); }} />
          <DebugPanel open={debugOpen} onClose={() => { setDebugOpen(false); }} />
        </div>
      </NavigationProvider>
    </GameProvider>
  );
}

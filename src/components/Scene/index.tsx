import { GameStageProvider } from '@engine/stage/GameStageProvider';

import { Sky } from './Sky';
import { Tower } from './Tower';
import { Weather } from './Weather';
import { FactionZeppelin } from './Zeppelin';

/** Bottom app layer: persistent Pixi canvas and game world. */
export function Scene() {
  return (
    <GameStageProvider>
      <Sky />
      <FactionZeppelin />
      <Tower />
      <Weather />
    </GameStageProvider>
  );
}

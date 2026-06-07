import { LevelBadge } from '@components/LevelBadge';
import { ProgressBar } from '@components/ProgressBar';
import { CoinBadge } from '@components/Overlay/CoinBadge';
import { Portrait } from '@components/Portrait';
import { useGameState } from '@game/hooks/useGameState';

import type { CharacterPortraitProps } from './types';

export function CharacterPortrait({
  className,
  onLevelBadgeDoubleClick,
}: CharacterPortraitProps = {}) {
  const name = useGameState((state) => state.player.name);
  const status = useGameState((state) => state.player.status);
  const level = useGameState((state) => state.player.level);
  const levelRatio =
    level.target > 0 ? level.progress / level.target : 0;
  const levelLabel = `${String(level.progress)}/${String(level.target)}`;

  const classes =
    'character-portrait-block text-button-text' + (className ? ' ' + className : '');

  return (
    <div className={classes}>
      <Portrait className="character-portrait shrink-0">
        <div className="absolute bottom-0 right-0 z-2">
          <LevelBadge
            level={level}
            size="small"
            className="level-badge"
            {...(onLevelBadgeDoubleClick ? { onDoubleClick: onLevelBadgeDoubleClick } : {})}
          />
        </div>
      </Portrait>
      <div className="character-portrait-details">
        <div className="player-info">
          <h1 className="player-name m-0">{name}</h1>
          <h3 className="player-status m-0 text-button-text/70">{status || '\u00A0'}</h3>
          <ProgressBar
            value={levelRatio}
            label={levelLabel}
            className="level-progress"
          />
        </div>
        <CoinBadge />
      </div>
    </div>
  );
}

export type { CharacterPortraitProps } from './types';

import type { CSSProperties } from 'react';

import { TOWER_LAYOUT, TOWER_ROOMS, TOWER_SPRITE_SIZE } from '@components/Scene/Tower/rooms';
import { libraryProfessions } from '@game/library/professions';
import type { ProfessionId } from '@game/state/types';

import { definePage } from '../definePage';

import icon from './assets/icon.png';
import { CraftBadge } from './CraftBadge';

import './index.css';

type BadgePlacement = {
  professionId: ProfessionId;
  y: number;
  x?: number;
};

/** Vertical offset of gathering badges above their paired craft room. */
const gatheringYOffset = 8;

const BADGE_PLACEMENTS: BadgePlacement[] = [
  { professionId: 'blacksmithing', ...TOWER_ROOMS.blacksmith.coordinate },
  { professionId: 'carpentry', ...TOWER_ROOMS.carpentry.coordinate },
  { professionId: 'cooking', ...TOWER_ROOMS.kitchen.coordinate },
  {
    professionId: 'forest',
    y: TOWER_ROOMS.blacksmith.coordinate.y - gatheringYOffset,
  },
  {
    professionId: 'mine',
    y: TOWER_ROOMS.kitchen.coordinate.y - gatheringYOffset,
  },
  {
    professionId: 'river',
    y: TOWER_ROOMS.carpentry.coordinate.y - gatheringYOffset,
  },
];

const towerBadgeVars = {
  '--tower-band-top': `${(TOWER_LAYOUT.anchorY - TOWER_LAYOUT.heightFrac / 2) * 100}%`,
  '--tower-center-top': `${TOWER_LAYOUT.anchorY * 100}%`,
  '--tower-center-left': `${TOWER_LAYOUT.anchorX * 100}%`,
  '--tower-height': `${TOWER_LAYOUT.heightFrac * 100}%`,
  '--tower-aspect': TOWER_SPRITE_SIZE.width / TOWER_SPRITE_SIZE.height,
} as CSSProperties;

function isCraftProfession(professionId: ProfessionId) {
  return libraryProfessions[professionId].type === 'craft';
}

function TowerPage() {
  return (
    <div className="pointer-events-none absolute inset-0" style={towerBadgeVars}>
      <div className="craft-badge-layer">
        {BADGE_PLACEMENTS.filter(({ professionId }) => isCraftProfession(professionId)).map(
          ({ professionId, x, y }) => (
            <CraftBadge key={professionId} professionId={professionId} x={x!} y={y} />
          ),
        )}
      </div>
      {BADGE_PLACEMENTS.filter(({ professionId }) => !isCraftProfession(professionId)).map(
        ({ professionId, y }) => (
          <CraftBadge key={professionId} professionId={professionId} y={y} />
        ),
      )}
    </div>
  );
}

export const towerPage = definePage({
  id: "tower",
  path: "/tower",
  title: "Tower",
  icon,
  children: <TowerPage />,
});

import type { RoomId } from '@game/selectors/rooms';

import kitchenEmpty from './rooms/Kitchen/assets/empty.png';
import kitchenIdle from './rooms/Kitchen/assets/idle.png';
import kitchenBusy from './rooms/Kitchen/assets/busy.png';
import carpentryEmpty from './rooms/Carpentry/assets/empty.png';
import carpentryIdle from './rooms/Carpentry/assets/idle.png';
import carpentryBusy from './rooms/Carpentry/assets/busy.png';
import blacksmithEmpty from './rooms/Blacksmith/assets/empty.png';
import blacksmithIdle from './rooms/Blacksmith/assets/idle.png';
import blacksmithBusy from './rooms/Blacksmith/assets/busy.png';

export interface RoomCoordinate {
  x: number;
  y: number;
}

/** Shared tower layout; tower_day.png and room idle sprites. */
export const TOWER_LAYOUT = {
  anchorX: 0.5,
  anchorY: 0.52,
  heightFrac: 0.72,
  roomWidthFrac: 0.5,
} as const;

export const TOWER_SPRITE_SIZE = { width: 959, height: 1347 } as const;
export const ROOM_SPRITE_SIZE = { width: 530, height: 266 } as const;

export const TOWER_ROOMS = {
  kitchen: {
    coordinate: { x: 35, y: 80 },
    assets: { empty: kitchenEmpty, idle: kitchenIdle, busy: kitchenBusy },
  },
  carpentry: {
    coordinate: { x: 35, y: 61 },
    assets: { empty: carpentryEmpty, idle: carpentryIdle, busy: carpentryBusy },
  },
  blacksmith: {
    coordinate: { x: 35, y: 42 },
    assets: { empty: blacksmithEmpty, idle: blacksmithIdle, busy: blacksmithBusy },
  },
} satisfies Record<
  Extract<RoomId, 'kitchen' | 'carpentry' | 'blacksmith'>,
  { coordinate: RoomCoordinate; assets: Record<'empty' | 'idle' | 'busy', string> }
>;

export type TowerRoomKey = keyof typeof TOWER_ROOMS;

export const TOWER_ROOM_KEYS = Object.keys(TOWER_ROOMS) as TowerRoomKey[];

export const TOWER_ROOM_TEXTURE_URLS = TOWER_ROOM_KEYS.flatMap((key) =>
  Object.values(TOWER_ROOMS[key].assets),
);

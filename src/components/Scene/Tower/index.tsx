import { useEffect, useRef } from 'react';
import { Assets, Sprite, Texture } from 'pixi.js';

import { useGameStage } from '@engine/stage/useGameStage';
import { useRoomStates } from '@game/hooks/useRoomStates';
import { useTimeOfDay } from '@game/hooks/useTimeOfDay';
import {
  roomAssetKey,
  type RoomId,
  type RoomVisualState,
} from '@game/selectors/rooms';

import { SCENE_LAYER } from '../shared/layers';
import { ParticleField, particleTexture } from '../shared/ParticleField';
import { roomDustEffect, roomWorkEffect, type RoomKey } from '../shared/particleEffects';
import { usePhaseCrossfade } from '../shared/usePhaseCrossfade';

import towerMorning from './assets/tower_morning.png';
import towerDay from './assets/tower_day.png';
import towerEvening from './assets/tower_evening.png';
import towerNight from './assets/tower_night.png';
import { Flag } from './Flag';
import {
  TOWER_LAYOUT,
  TOWER_ROOM_KEYS,
  TOWER_ROOM_TEXTURE_URLS,
  TOWER_ROOMS,
  type RoomCoordinate,
  type TowerRoomKey,
} from './rooms';

const TOWER_TEXTURES = {
  morning: towerMorning,
  day: towerDay,
  evening: towerEvening,
  night: towerNight,
} as const;

interface RoomSprite {
  sprite: Sprite;
  key: TowerRoomKey;
  coordinate: RoomCoordinate;
}

function applyRoomTextures(
  rooms: RoomSprite[],
  states: Record<RoomId, RoomVisualState>,
) {
  for (const room of rooms) {
    const state = states[room.key];
    const url = TOWER_ROOMS[room.key].assets[roomAssetKey(state)];
    room.sprite.texture = Assets.get<Texture>(url);
  }
}

function fitTower(s: Sprite, cx: number, cy: number, height: number) {
  if (s.texture.height <= 0) return;
  const towerHeight = height * TOWER_LAYOUT.heightFrac;
  s.width = towerHeight * (s.texture.width / s.texture.height);
  s.height = towerHeight;
  s.position.set(cx, cy);
}

export function Tower() {
  const stage = useGameStage();
  const phase = useTimeOfDay();
  const roomStates = useRoomStates();

  const roomStatesRef = useRef(roomStates);

  const roomsRef = useRef<RoomSprite[]>([]);
  const roomFieldsRef = useRef<Partial<Record<RoomKey, ParticleField>>>({});

  const { baseRef: towerRef, nextRef: towerNextRef, layoutRef, cancelTransitionRef } =
    usePhaseCrossfade(
      stage,
      phase,
      TOWER_TEXTURES,
      SCENE_LAYER.tower,
      SCENE_LAYER.towerTransition,
    );

  useEffect(() => {
    roomStatesRef.current = roomStates;
  }, [roomStates]);

  useEffect(() => {
    if (!stage) return;
    const { app, world } = stage;

    let disposed = false;
    const rooms: RoomSprite[] = TOWER_ROOM_KEYS.map((key) => {
      const sprite = new Sprite();
      sprite.anchor.set(0.5);
      sprite.zIndex = SCENE_LAYER.towerRooms;
      sprite.eventMode = 'none';
      world.addChild(sprite);
      return { sprite, key, coordinate: TOWER_ROOMS[key].coordinate };
    });
    roomsRef.current = rooms;

    const tex = particleTexture();
    const roomFields: Partial<Record<RoomKey, ParticleField>> = {};
    for (const key of TOWER_ROOM_KEYS) {
      const field = new ParticleField(tex, roomDustEffect());
      field.addTo(world, SCENE_LAYER.roomEffects);
      roomFields[key] = field;
    }
    roomFieldsRef.current = roomFields;

    const onTick = (ticker: { deltaMS: number }) => {
      const dt = Math.min(ticker.deltaMS / 1000, 0.05);
      for (const key of TOWER_ROOM_KEYS) roomFields[key]?.update(dt);
    };
    app.ticker.add(onTick);

    layoutRef.current = () => {
      const tower = towerRef.current;
      const towerNext = towerNextRef.current;
      if (!tower || !towerNext) return;

      const { width, height } = app.screen;
      const cx = width * TOWER_LAYOUT.anchorX;
      const cy = height * TOWER_LAYOUT.anchorY;

      fitTower(tower, cx, cy, height);
      fitTower(towerNext, cx, cy, height);

      if (tower.texture.height === 0) return;
      const towerWidth = tower.width;
      const towerHeight = tower.height;
      const left = cx - towerWidth / 2;
      const top = cy - towerHeight / 2;
      const roomWidth = towerWidth * TOWER_LAYOUT.roomWidthFrac;

      for (const room of rooms) {
        const roomTex = room.sprite.texture;
        const ratio = roomTex.width > 0 ? roomTex.height / roomTex.width : 1;
        room.sprite.width = roomWidth;
        room.sprite.height = roomWidth * ratio;
        room.sprite.position.set(
          left + (room.coordinate.x / 100) * towerWidth,
          top + (room.coordinate.y / 100) * towerHeight,
        );
        const field = roomFields[room.key];
        if (field) {
          field.bounds = {
            x: room.sprite.x - room.sprite.width / 2,
            y: room.sprite.y - room.sprite.height / 2,
            w: room.sprite.width,
            h: room.sprite.height,
          };
        }
      }
    };

    void Promise.all(TOWER_ROOM_TEXTURE_URLS.map((url) => Assets.load<Texture>(url)))
      .then(() => {
        if (disposed) return;
        applyRoomTextures(rooms, roomStatesRef.current);
        layoutRef.current?.();
      })
      .catch((err: unknown) => {
        console.error('[Tower] room texture load failed', err);
      });

    const onResize = () => {
      layoutRef.current?.();
    };
    app.renderer.on('resize', onResize);
    layoutRef.current();

    return () => {
      disposed = true;
      cancelTransitionRef.current?.();
      cancelTransitionRef.current = null;
      app.renderer.off('resize', onResize);
      app.ticker.remove(onTick);
      for (const key of TOWER_ROOM_KEYS) roomFields[key]?.destroy();
      roomFieldsRef.current = {};
      roomsRef.current = [];
      for (const room of rooms) room.sprite.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    applyRoomTextures(roomsRef.current, roomStates);
    layoutRef.current?.();
    for (const key of TOWER_ROOM_KEYS) {
      const field = roomFieldsRef.current[key];
      if (!field) continue;
      const busy = roomAssetKey(roomStates[key]) === 'busy';
      field.setConfig(busy ? roomWorkEffect(key) : roomDustEffect());
    }
  }, [roomStates, layoutRef]);

  return <Flag />;
}

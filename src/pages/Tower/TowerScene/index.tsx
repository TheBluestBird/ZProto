import { useEffect, useRef } from 'react';
import { Assets, Sprite, Texture } from 'pixi.js';

import { useGameStage } from '@engine/stage/useGameStage';
import { useRoomStates } from '@game/hooks/useRoomStates';
import { factions } from '@game/factions';
import { useFactionVisit } from '@game/factions/useFactionVisit';
import { useNavigation } from '@navigation/useNavigation';
import {
  getProfessionId,
  roomAssetKey,
  type RoomId,
  type RoomVisualState,
} from '@game/selectors/rooms';

import { Zeppelin } from '../Building/Zeppelin';
import { Flag } from '../Building/Flag';

import { softParticleTexture } from './particles/textures';
import { ParticleField } from './particles/ParticleField';
import {
  ambientConfig,
  roomDustConfig,
  roomWorkConfig,
  type RoomKey as FxRoomKey,
} from './particles/behaviors';

import {
  TIME_ASSETS,
  PHASE_TRANSITION_SECONDS,
  getTimeOfDay,
  useTimeOfDay,
} from './timeOfDay';

import kitchenEmpty from '../Building/rooms/Kitchen/assets/empty.png';
import kitchenIdle from '../Building/rooms/Kitchen/assets/idle.png';
import kitchenBusy from '../Building/rooms/Kitchen/assets/busy.png';
import carpentryEmpty from '../Building/rooms/Carpentry/assets/empty.png';
import carpentryIdle from '../Building/rooms/Carpentry/assets/idle.png';
import carpentryBusy from '../Building/rooms/Carpentry/assets/busy.png';
import blacksmithEmpty from '../Building/rooms/Blacksmith/assets/empty.png';
import blacksmithIdle from '../Building/rooms/Blacksmith/assets/idle.png';
import blacksmithBusy from '../Building/rooms/Blacksmith/assets/busy.png';

type RoomCoordinate = { x: number; y: number };

const ROOMS = {
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

type RoomKey = keyof typeof ROOMS;

/** Layout fractions matching the old DOM tower. */
const ANCHOR_X = 0.5;
const ANCHOR_Y = 0.52;
const TOWER_HEIGHT_FRAC = 0.72;
const ROOM_WIDTH_FRAC = 0.5;

/** World z-order. Sky at the back; the zeppelin floats between sky and tower. */
const SKY_Z = -100;
/** Crossfade overlay for the sky, just above the base sky but behind the zeppelin. */
const SKY_NEXT_Z = -99;
export const ZEPPELIN_Z = -50;
const TOWER_Z = 10;
/** Crossfade overlay for the tower, just above the base tower but behind the flag. */
const TOWER_NEXT_Z = 11;
export const FLAG_Z = 20;
const ROOM_Z = 5;
/** Per-room work/dust effects sit just above the room sprites. */
const ROOM_FX_Z = 15;
/** Ambient mood particles float over the whole scene, below the flag. */
const AMBIENT_Z = 18;

type RoomSprite = { sprite: Sprite; key: RoomKey; coordinate: RoomCoordinate };
const ROOM_KEYS = Object.keys(ROOMS) as RoomKey[];
const ROOM_TEXTURE_URLS = ROOM_KEYS.flatMap((key) => Object.values(ROOMS[key].assets));

function applyRoomTextures(
  rooms: RoomSprite[],
  states: Record<RoomId, RoomVisualState>,
) {
  for (const room of rooms) {
    const state = states[room.key];
    const url = ROOMS[room.key].assets[roomAssetKey(state)];
    room.sprite.texture = Assets.get<Texture>(url) ?? Texture.EMPTY;
  }
}

/**
 * The whole Tower scene rendered into the shared Pixi world: sky, zeppelin,
 * tower, flag and the three clickable workshop rooms. Replaces the old DOM
 * `Building` so everything shares one render layer and z-order (zeppelin behind
 * the tower, flag in front).
 */
export function TowerScene() {
  const stage = useGameStage();
  const { navigate } = useNavigation();
  const roomStates = useRoomStates();
  const visit = useFactionVisit();
  const phase = useTimeOfDay();
  const visitZeppelinId = factions[visit.factionId].zeppelinId;

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const roomStatesRef = useRef(roomStates);
  roomStatesRef.current = roomStates;

  const roomsRef = useRef<RoomSprite[]>([]);
  const layoutRef = useRef<(() => void) | null>(null);

  // Sky/tower sprites: a base layer plus an overlay used to crossfade phases.
  const skyRef = useRef<Sprite | null>(null);
  const skyNextRef = useRef<Sprite | null>(null);
  const towerRef = useRef<Sprite | null>(null);
  const towerNextRef = useRef<Sprite | null>(null);
  // Last phase committed to the base sprites; starts at the store's value so the
  // first render doesn't crossfade from nothing.
  const appliedPhaseRef = useRef(getTimeOfDay());
  // Cancels an in-flight crossfade (commits it instantly).
  const cancelTransitionRef = useRef<(() => void) | null>(null);

  // Ambient (scene-wide) and per-room particle effect fields.
  const ambientFieldRef = useRef<ParticleField | null>(null);
  const roomFieldsRef = useRef<Partial<Record<FxRoomKey, ParticleField>>>({});

  // Build the static scene (sky + tower + rooms) once the stage is ready.
  useEffect(() => {
    if (!stage) return;
    const { app, world } = stage;

    let disposed = false;
    // Add sky/tower/rooms directly to the shared world (not a sub-container) so
    // their world zIndices interleave with the zeppelin and flag: sky behind
    // everything, the zeppelin floating between sky and tower, then tower, flag
    // and the clickable rooms in front.
    const sky = new Sprite();
    sky.anchor.set(0.5);
    sky.zIndex = SKY_Z;
    world.addChild(sky);
    skyRef.current = sky;

    const skyNext = new Sprite();
    skyNext.anchor.set(0.5);
    skyNext.zIndex = SKY_NEXT_Z;
    skyNext.alpha = 0;
    world.addChild(skyNext);
    skyNextRef.current = skyNext;

    const tower = new Sprite();
    tower.anchor.set(0.5);
    tower.zIndex = TOWER_Z;
    world.addChild(tower);
    towerRef.current = tower;

    const towerNext = new Sprite();
    towerNext.anchor.set(0.5);
    towerNext.zIndex = TOWER_NEXT_Z;
    towerNext.alpha = 0;
    world.addChild(towerNext);
    towerNextRef.current = towerNext;

    const rooms: RoomSprite[] = ROOM_KEYS.map((key) => {
      const sprite = new Sprite();
      sprite.anchor.set(0.5);
      sprite.zIndex = ROOM_Z;
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      sprite.on('pointertap', () => {
        navigateRef.current('craft', getProfessionId(key));
      });
      world.addChild(sprite);
      return { sprite, key, coordinate: ROOMS[key].coordinate };
    });
    roomsRef.current = rooms;

    // Particle fields share one soft texture. Ambient covers the scene; each
    // room gets its own field (dust when idle, work effect when crafting).
    const tex = softParticleTexture();
    const ambient = new ParticleField(tex, ambientConfig(getTimeOfDay()));
    ambient.addTo(world, AMBIENT_Z);
    ambientFieldRef.current = ambient;

    const roomFields: Partial<Record<FxRoomKey, ParticleField>> = {};
    for (const key of ROOM_KEYS) {
      const field = new ParticleField(tex, roomDustConfig());
      field.addTo(world, ROOM_FX_Z);
      roomFields[key] = field;
    }
    roomFieldsRef.current = roomFields;

    const onTick = (ticker: { deltaMS: number }) => {
      const dt = Math.min(ticker.deltaMS / 1000, 0.05);
      ambient.update(dt);
      for (const key of ROOM_KEYS) roomFields[key]?.update(dt);
    };
    app.ticker.add(onTick);

    const fitSky = (s: Sprite, width: number, height: number) => {
      if (!s.texture || s.texture.height <= 0) return;
      const fitW = height * (s.texture.width / s.texture.height);
      const w = Math.max(fitW, width);
      s.width = w;
      s.height = w * (s.texture.height / s.texture.width);
      s.position.set(width / 2, height / 2);
    };

    const fitTower = (s: Sprite, cx: number, cy: number, height: number) => {
      if (!s.texture || s.texture.height <= 0) return;
      const towerHeight = height * TOWER_HEIGHT_FRAC;
      s.width = towerHeight * (s.texture.width / s.texture.height);
      s.height = towerHeight;
      s.position.set(cx, cy);
    };

    const layout = () => {
      const { width, height } = app.screen;
      const cx = width * ANCHOR_X;
      const cy = height * ANCHOR_Y;

      fitSky(sky, width, height);
      fitSky(skyNext, width, height);
      fitTower(tower, cx, cy, height);
      fitTower(towerNext, cx, cy, height);

      if (!tower.texture || tower.texture.height === 0) return;
      const towerWidth = tower.width;
      const towerHeight = tower.height;
      const left = cx - towerWidth / 2;
      const top = cy - towerHeight / 2;
      const roomWidth = towerWidth * ROOM_WIDTH_FRAC;
      for (const room of rooms) {
        const tex = room.sprite.texture;
        const ratio = tex && tex.width > 0 ? tex.height / tex.width : 1;
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

      ambient.bounds = { x: 0, y: 0, w: width, h: height };
    };
    layoutRef.current = layout;

    // Load the current phase for the base layer plus the room textures.
    const initial = TIME_ASSETS[getTimeOfDay()];
    void Promise.all([
      Assets.load<Texture>(initial.sky),
      Assets.load<Texture>(initial.tower),
      ...ROOM_TEXTURE_URLS.map((url) => Assets.load<Texture>(url)),
    ]).then(([skyTex, towerTex]) => {
      if (disposed) return;
      sky.texture = skyTex;
      tower.texture = towerTex;
      // Ensure first layout uses real room texture ratios, not Texture.EMPTY.
      applyRoomTextures(rooms, roomStatesRef.current);
      layout();
    }).catch((err) => console.error('[TowerScene] texture load failed', err));

    const onResize = () => layout();
    app.renderer.on('resize', onResize);

    return () => {
      disposed = true;
      cancelTransitionRef.current?.();
      cancelTransitionRef.current = null;
      app.renderer.off('resize', onResize);
      app.ticker.remove(onTick);
      ambient.destroy();
      ambientFieldRef.current = null;
      for (const key of ROOM_KEYS) roomFields[key]?.destroy();
      roomFieldsRef.current = {};
      roomsRef.current = [];
      layoutRef.current = null;
      skyRef.current = null;
      skyNextRef.current = null;
      towerRef.current = null;
      towerNextRef.current = null;
      sky.destroy();
      skyNext.destroy();
      tower.destroy();
      towerNext.destroy();
      for (const room of rooms) room.sprite.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Crossfade the sky and tower whenever the time-of-day phase changes.
  useEffect(() => {
    ambientFieldRef.current?.setConfig(ambientConfig(phase));
  }, [phase]);

  useEffect(() => {
    if (!stage) return;
    if (appliedPhaseRef.current === phase) return;
    const sky = skyRef.current;
    const skyNext = skyNextRef.current;
    const tower = towerRef.current;
    const towerNext = towerNextRef.current;
    if (!sky || !skyNext || !tower || !towerNext) return;

    const { app } = stage;
    const assets = TIME_ASSETS[phase];
    let cancelled = false;

    // Commit any previous in-flight transition before starting a new one.
    cancelTransitionRef.current?.();
    cancelTransitionRef.current = null;

    void Promise.all([
      Assets.load<Texture>(assets.sky),
      Assets.load<Texture>(assets.tower),
    ]).then(([skyTex, towerTex]) => {
      if (cancelled) return;

      skyNext.texture = skyTex;
      towerNext.texture = towerTex;
      skyNext.alpha = 0;
      towerNext.alpha = 0;
      layoutRef.current?.();

      const commit = () => {
        sky.texture = skyTex;
        tower.texture = towerTex;
        skyNext.alpha = 0;
        towerNext.alpha = 0;
        appliedPhaseRef.current = phase;
        layoutRef.current?.();
      };

      let elapsed = 0;
      const durationMs = PHASE_TRANSITION_SECONDS * 1000;
      const tick = (ticker: { deltaMS: number }) => {
        elapsed += ticker.deltaMS;
        const t = Math.min(elapsed / durationMs, 1);
        skyNext.alpha = t;
        towerNext.alpha = t;
        if (t >= 1) {
          app.ticker.remove(tick);
          cancelTransitionRef.current = null;
          commit();
        }
      };
      app.ticker.add(tick);

      cancelTransitionRef.current = () => {
        app.ticker.remove(tick);
        commit();
      };
    });

    return () => {
      cancelled = true;
    };
  }, [stage, phase]);

  // Swap room textures whenever the room states change.
  useEffect(() => {
    applyRoomTextures(roomsRef.current, roomStates);
    layoutRef.current?.();
    for (const key of ROOM_KEYS) {
      const field = roomFieldsRef.current[key];
      if (!field) continue;
      const busy = roomAssetKey(roomStates[key]) === 'busy';
      field.setConfig(busy ? roomWorkConfig(key) : roomDustConfig());
    }
  }, [roomStates]);

  return (
    <>
      <Zeppelin
        zeppelinId={visitZeppelinId}
        phase={visit.phase}
        zIndex={ZEPPELIN_Z}
        scale={1.3}
        anchorX={0.66}
        anchorY={0.42}
        offsetX={-50}
        timeScale={0.5}
      />
      <Flag zIndex={FLAG_Z} anchorY={0.18} offsetX={-75} />
    </>
  );
}

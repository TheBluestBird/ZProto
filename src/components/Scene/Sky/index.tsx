import { useEffect } from 'react';
import { Sprite } from 'pixi.js';

import { useGameStage } from '@engine/stage/useGameStage';
import { useTimeOfDay } from '@game/hooks/useTimeOfDay';

import { SCENE_LAYER } from '../shared/layers';
import { usePhaseCrossfade } from '../shared/usePhaseCrossfade';

import skyMorning from './assets/sky_morning.png';
import skyDay from './assets/sky_day.png';
import skyEvening from './assets/sky_evening.png';
import skyNight from './assets/sky_night.png';

const TEXTURES = {
  morning: skyMorning,
  day: skyDay,
  evening: skyEvening,
  night: skyNight,
} as const;

function fitSky(s: Sprite, width: number, height: number) {
  if (s.texture.height <= 0) return;
  const fitW = height * (s.texture.width / s.texture.height);
  const w = Math.max(fitW, width);
  s.width = w;
  s.height = w * (s.texture.height / s.texture.width);
  s.position.set(width / 2, height / 2);
}

export function Sky() {
  const stage = useGameStage();
  const phase = useTimeOfDay();
  const { baseRef, nextRef, layoutRef } = usePhaseCrossfade(
    stage,
    phase,
    TEXTURES,
    SCENE_LAYER.sky,
    SCENE_LAYER.skyTransition,
  );

  useEffect(() => {
    if (!stage) return;
    const { app } = stage;

    layoutRef.current = () => {
      const sky = baseRef.current;
      const skyNext = nextRef.current;
      if (!sky || !skyNext) return;
      const { width, height } = app.screen;
      fitSky(sky, width, height);
      fitSky(skyNext, width, height);
    };
    layoutRef.current();
  }, [stage, baseRef, nextRef, layoutRef]);

  return null;
}

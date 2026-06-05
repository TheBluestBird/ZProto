import { useEffect, useRef } from 'react';

import { useGameStage } from '@engine/stage/useGameStage';
import { useTimeOfDay } from '@game/hooks/useTimeOfDay';

import { SCENE_LAYER } from '../shared/layers';
import { ParticleField, particleTexture } from '../shared/ParticleField';
import { ambientEffect } from '../shared/particleEffects';

/** Scene-wide ambient particles driven by time of day. */
export function Weather() {
  const stage = useGameStage();
  const phase = useTimeOfDay();
  const initialPhaseRef = useRef(phase);
  const fieldRef = useRef<ParticleField | null>(null);

  useEffect(() => {
    if (!stage) return;
    const { app, world } = stage;

    const field = new ParticleField(
      particleTexture(),
      ambientEffect(initialPhaseRef.current),
    );
    field.addTo(world, SCENE_LAYER.weather);
    fieldRef.current = field;

    const onTick = (ticker: { deltaMS: number }) => {
      field.update(Math.min(ticker.deltaMS / 1000, 0.05));
    };
    app.ticker.add(onTick);

    const layout = () => {
      const { width, height } = app.screen;
      field.bounds = { x: 0, y: 0, w: width, h: height };
    };
    layout();
    app.renderer.on('resize', layout);

    return () => {
      app.renderer.off('resize', layout);
      app.ticker.remove(onTick);
      field.destroy();
      fieldRef.current = null;
    };
  }, [stage]);

  useEffect(() => {
    fieldRef.current?.setConfig(ambientEffect(phase));
  }, [phase]);

  return null;
}

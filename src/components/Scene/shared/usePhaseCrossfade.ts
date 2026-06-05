import { useEffect, useRef } from 'react';
import { Assets, Sprite, type Texture } from 'pixi.js';

import type { GameStageValue } from '@engine/stage/GameStageContext';
import {
  PHASE_TRANSITION_SECONDS,
  type TimeOfDay,
} from '@game/ambient/timeOfDay';

type PhaseTextures = Record<TimeOfDay, string>;

export function usePhaseCrossfade(
  stage: GameStageValue | null,
  phase: TimeOfDay,
  textures: PhaseTextures,
  zIndex: number,
  zIndexNext: number,
) {
  const baseRef = useRef<Sprite | null>(null);
  const nextRef = useRef<Sprite | null>(null);
  const layoutRef = useRef<(() => void) | null>(null);
  const appliedPhaseRef = useRef(phase);
  const cancelTransitionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!stage) return;
    const { app, world } = stage;

    let disposed = false;
    const base = new Sprite();
    base.anchor.set(0.5);
    base.zIndex = zIndex;
    world.addChild(base);
    baseRef.current = base;

    const next = new Sprite();
    next.anchor.set(0.5);
    next.zIndex = zIndexNext;
    next.alpha = 0;
    world.addChild(next);
    nextRef.current = next;

    void Assets.load<Texture>(textures[appliedPhaseRef.current])
      .then((tex) => {
        if (disposed) return;
        base.texture = tex;
        layoutRef.current?.();
      })
      .catch((err: unknown) => {
        console.error('[Scene] texture load failed', err);
      });

    const onResize = () => {
      layoutRef.current?.();
    };
    app.renderer.on('resize', onResize);

    return () => {
      disposed = true;
      cancelTransitionRef.current?.();
      cancelTransitionRef.current = null;
      app.renderer.off('resize', onResize);
      layoutRef.current = null;
      baseRef.current = null;
      nextRef.current = null;
      base.destroy();
      next.destroy();
    };
  }, [stage, textures, zIndex, zIndexNext]);

  useEffect(() => {
    if (!stage) return;
    if (appliedPhaseRef.current === phase) return;
    const base = baseRef.current;
    const next = nextRef.current;
    if (!base || !next) return;

    const { app } = stage;
    let cancelled = false;

    cancelTransitionRef.current?.();
    cancelTransitionRef.current = null;

    void Assets.load<Texture>(textures[phase]).then((tex) => {
      if (cancelled) return;

      next.texture = tex;
      next.alpha = 0;
      layoutRef.current?.();

      const commit = () => {
        base.texture = tex;
        next.alpha = 0;
        appliedPhaseRef.current = phase;
        layoutRef.current?.();
      };

      let elapsed = 0;
      const durationMs = PHASE_TRANSITION_SECONDS * 1000;
      const tick = (ticker: { deltaMS: number }) => {
        elapsed += ticker.deltaMS;
        const t = Math.min(elapsed / durationMs, 1);
        next.alpha = t;
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
  }, [stage, phase, textures]);

  return { baseRef, nextRef, layoutRef, cancelTransitionRef };
}

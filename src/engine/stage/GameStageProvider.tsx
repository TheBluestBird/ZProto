import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Application, Container } from 'pixi.js';

import { GameStageContext, type GameStageValue } from './GameStageContext';

// The canvas stays behind DOM UI. Page layers use pointer-events-none by default;
// interactive DOM (tower room hits, HUD, nav) re-enables events on its own nodes.
const CANVAS_CLASS = 'fixed inset-0 z-0 size-full';
const MAX_DPR = 1.5;
const MAX_FPS = 30;

/**
 * Mounts the single, persistent Pixi Application that renders the whole game
 * world. The canvas is a fixed, full-viewport layer that sits *behind* the DOM
 * UI (book windows, navigation, HUD stay on React/DOM). Everything animated —
 * tower, zeppelin, items, characters, effects, Spine — lives in this one
 * context instead of one WebGL context per animation.
 *
 * IMPORTANT: we let Pixi create its *own* canvas (`app.canvas`) and append it to
 * a wrapper div, rather than handing Pixi a shared `<canvas>` ref. Under React
 * 19 StrictMode the init effect mounts twice; if both Applications shared one
 * canvas, destroying the first (unmounted) app would tear down the WebGL context
 * the second app depends on, leaving the stage permanently blank. Giving each
 * Application its own canvas keeps the two instances fully independent.
 */
export function GameStageProvider({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<GameStageValue | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let initialized = false;
    const app = new Application();

    void app
      .init({
        resizeTo: window,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, MAX_DPR),
      })
      .then(() => {
        // Unmounted before init finished (e.g. React StrictMode double-mount).
        if (disposed) {
          app.destroy(true, { children: true });
          return;
        }
        initialized = true;
        app.canvas.className = CANVAS_CLASS;
        container.appendChild(app.canvas);
        const world = new Container();
        world.sortableChildren = true;
        app.stage.addChild(world);
        app.ticker.maxFPS = MAX_FPS;
        setStage({ app, world });
      })
      .catch((err: unknown) => {
        console.error('[GameStage] init failed', err);
      });

    return () => {
      disposed = true;
      setStage(null);
      if (initialized) {
        app.destroy(true, { children: true });
      }
    };
  }, []);

  return (
    <>
      <div ref={containerRef} aria-hidden />
      <GameStageContext.Provider value={stage}>{children}</GameStageContext.Provider>
    </>
  );
}

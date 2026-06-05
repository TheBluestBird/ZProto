import { useEffect, useRef } from 'react';
import type { Application, Container } from 'pixi.js';
import type { Spine } from '@esotericsoftware/spine-pixi-v8';

import { useGameStage } from '@engine/stage/useGameStage';
import { createSpine, loadSpineAsset } from '@engine/spine/loadSpine';
import { zeppelinSpine } from '@engine/spine/spineAssets';
import type { VisitPhase } from '@game/factions/useFactionVisit';

export interface ZeppelinProps {
  /** Which faction's zeppelin to show on arrival (matches `Faction.zeppelinId`). */
  zeppelinId: string;
  /** Current visit phase — drives arrival (docked) and departure (incoming). */
  phase: VisitPhase;
  /** Visual scale of the zeppelin in the world. */
  scale?: number;
  /** Dock anchor as a fraction of the viewport (0..1). */
  anchorX?: number;
  anchorY?: number;
  /** Pixel offset applied after the fractional anchor. */
  offsetX?: number;
  offsetY?: number;
  /** Animation playback speed multiplier (1 = normal). */
  timeScale?: number;
  /** World z-index (relative to sky / tower / flag). */
  zIndex?: number;
}

type Layout = { scale: number; anchorX: number; anchorY: number; offsetX: number; offsetY: number };

function place(app: Application, spine: Spine, layout: Layout) {
  const { scale, anchorX, anchorY, offsetX, offsetY } = layout;
  spine.position.set(
    app.screen.width * anchorX + offsetX,
    app.screen.height * anchorY + offsetY,
  );
  spine.scale.set(scale);
}

export function Zeppelin({
  zeppelinId,
  phase,
  scale = 1,
  anchorX = 0.5,
  anchorY = 0.42,
  offsetX = 0,
  offsetY = 0,
  timeScale = 1,
  zIndex = 0,
}: ZeppelinProps) {
  const stage = useGameStage();
  const spineRef = useRef<Spine | null>(null);
  const spineIdRef = useRef<string | null>(null);
  const prevPhaseRef = useRef<VisitPhase>('incoming');
  const initializedRef = useRef(false);
  const loadTokenRef = useRef(0);
  const departureTokenRef = useRef(0);
  const stageRef = useRef<{ app: Application; world: Container } | null>(null);
  const layoutRef = useRef<Layout>({ scale, anchorX, anchorY, offsetX, offsetY });
  layoutRef.current = { scale, anchorX, anchorY, offsetX, offsetY };

  const destroySpine = (spine: Spine | null) => {
    if (!spine) return;
    spine.autoUpdate = false;
    spine.state.clearTracks();
    spine.parent?.removeChild(spine);
    spine.destroy();
    if (spineRef.current === spine) {
      spineRef.current = null;
      spineIdRef.current = null;
    }
  };

  const destroyCurrentRef = useRef<() => void>(() => {});
  destroyCurrentRef.current = () => {
    destroySpine(spineRef.current);
  };

  useEffect(() => {
    if (!stage) return;
    const { app, world } = stage;
    stageRef.current = { app, world };

    const onResize = () => {
      if (spineRef.current) place(app, spineRef.current, layoutRef.current);
    };
    app.renderer.on('resize', onResize);
    if (spineRef.current) {
      spineRef.current.zIndex = zIndex;
      place(app, spineRef.current, layoutRef.current);
    }

    return () => {
      app.renderer.off('resize', onResize);
      stageRef.current = null;
      departureTokenRef.current += 1;
      initializedRef.current = false;
      destroyCurrentRef.current();
    };
  }, [stage, zIndex, scale, anchorX, anchorY, offsetX, offsetY]);

  useEffect(() => {
    const stageValue = stageRef.current;
    if (!stageValue) return;
    const { app, world } = stageValue;
    const token = ++loadTokenRef.current;
    const prevPhase = prevPhaseRef.current;
    const oldId = spineIdRef.current;
    const isFirstSync = !initializedRef.current;

    void (async () => {
      if (phase === 'docked') {
        departureTokenRef.current += 1;

        if (spineRef.current && spineIdRef.current === zeppelinId) {
          if (prevPhase !== 'docked') {
            const t1 = spineRef.current.state.setAnimation(0, 'start', false);
            t1.timeScale = timeScale;
            const t2 = spineRef.current.state.addAnimation(0, 'idle', true, 0);
            t2.timeScale = timeScale;
          } else {
            const t = spineRef.current.state.setAnimation(0, 'idle', true);
            t.timeScale = timeScale;
          }
          prevPhaseRef.current = phase;
          return;
        }

        const urls = zeppelinSpine[zeppelinId];
        if (!urls) {
          destroyCurrentRef.current();
          prevPhaseRef.current = phase;
          return;
        }

        await loadSpineAsset(zeppelinId, urls);
        if (token !== loadTokenRef.current || !stageRef.current) return;

        destroyCurrentRef.current(); // Remove any departing/old zeppelin before spawning current.
        const spine = createSpine(zeppelinId);
        spine.zIndex = zIndex;
        spine.state.data.setMix('start', 'idle', 0.25);
        spine.state.data.setMix('idle', 'end', 0.25);
        place(app, spine, layoutRef.current);
        world.addChild(spine);
        spineRef.current = spine;
        spineIdRef.current = zeppelinId;

        const isArrival = !isFirstSync && (prevPhase !== 'docked' || oldId !== zeppelinId);
        if (isArrival) {
          const t1 = spine.state.setAnimation(0, 'start', false);
          t1.timeScale = timeScale;
          const t2 = spine.state.addAnimation(0, 'idle', true, 0);
          t2.timeScale = timeScale;
        } else {
          const t = spine.state.setAnimation(0, 'idle', true);
          t.timeScale = timeScale;
        }
      } else if (prevPhase === 'docked') {
        const departing = spineRef.current;
        if (departing) {
          const departureToken = ++departureTokenRef.current;
          const track = departing.state.setAnimation(0, 'end', false);
          track.listener = {
            complete: () => {
              if (departureToken !== departureTokenRef.current) return;
              // Defer destruction outside the current ticker cycle to avoid
              // physicsTranslate crash when destroying mid-internalUpdate.
              requestAnimationFrame(() => {
                if (departureToken !== departureTokenRef.current) return;
                destroySpine(departing);
              });
            },
          };
        } else {
          destroyCurrentRef.current();
        }
      } else {
        destroyCurrentRef.current();
      }

      initializedRef.current = true;
      prevPhaseRef.current = phase;
    })().catch((err) => {
      console.error('[Zeppelin] transition failed', err);
    });
  }, [stage, phase, zeppelinId, zIndex, timeScale]);

  return null;
}

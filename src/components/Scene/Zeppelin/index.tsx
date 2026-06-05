import { useCallback, useEffect, useRef } from 'react';
import type { Application, Container } from 'pixi.js';
import type { Spine } from '@esotericsoftware/spine-pixi-v8';

import { useGameStage } from '@engine/stage/useGameStage';
import { createSpine, destroySpine, loadSpineAsset } from '@engine/spine/loadSpine';
import { useFactionVisit } from '@game/hooks/useFactionVisit';
import { gameLibrary } from '@game/library/gameLibrary';
import type { VisitPhase } from '@game/state/types';

import { SCENE_LAYER } from '../shared/layers';
import { destroySpineAfterFrame } from '../shared/spine';

interface ZeppelinProps {
  /** Which faction's zeppelin to show on arrival (matches `Faction.zeppelinId`). */
  zeppelinId: string;
  /** Current visit phase — drives arrival (docked) and departure (incoming). */
  phase: VisitPhase;
  /** Visual scale of the zeppelin in the world. */
  scale?: number;
  /** Dock anchor as a fraction of the viewport (0..1). */
  anchorX?: number;
  anchorY?: number;
  /** World layer, usually one of `SCENE_LAYER`. */
  zIndex?: number;
}

interface Layout {
  scale: number;
  anchorX: number;
  anchorY: number;
}

function place(app: Application, spine: Spine, layout: Layout) {
  const { scale, anchorX, anchorY } = layout;
  spine.position.set(app.screen.width * anchorX, app.screen.height * anchorY);
  spine.scale.set(scale);
}

function Zeppelin({
  zeppelinId,
  phase,
  scale = 1,
  anchorX = 0.5,
  anchorY = 0.3,
  zIndex = SCENE_LAYER.zeppelin,
}: ZeppelinProps) {
  const stage = useGameStage();
  const spineRef = useRef<Spine | null>(null);
  const spineIdRef = useRef<string | null>(null);
  const prevPhaseRef = useRef<VisitPhase>('incoming');
  const initializedRef = useRef(false);
  const loadTokenRef = useRef(0);
  const departureTokenRef = useRef(0);
  const stageRef = useRef<{ app: Application; world: Container } | null>(null);
  const layoutRef = useRef<Layout>({ scale, anchorX, anchorY });

  const destroyCurrent = useCallback(() => {
    const current = spineRef.current;
    destroySpine(current);
    if (spineRef.current === current) {
      spineRef.current = null;
      spineIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    layoutRef.current = { scale, anchorX, anchorY };
  }, [scale, anchorX, anchorY]);

  useEffect(() => {
    if (!stage) return;
    const { app, world } = stage;
    stageRef.current = { app, world };

    const onResize = () => {
      if (spineRef.current) place(app, spineRef.current, layoutRef.current);
    };
    app.renderer.on('resize', onResize);

    return () => {
      app.renderer.off('resize', onResize);
      stageRef.current = null;
      departureTokenRef.current += 1;
      initializedRef.current = false;
      destroyCurrent();
    };
  }, [stage, destroyCurrent]);

  useEffect(() => {
    const stageValue = stageRef.current;
    const spine = spineRef.current;
    if (!stageValue || !spine) return;
    spine.zIndex = zIndex;
    place(stageValue.app, spine, layoutRef.current);
  }, [zIndex, scale, anchorX, anchorY]);

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
            spineRef.current.state.setAnimation(0, 'start', false);
            spineRef.current.state.addAnimation(0, 'idle', true, 0);
          } else {
            spineRef.current.state.setAnimation(0, 'idle', true);
          }
          prevPhaseRef.current = phase;
          return;
        }

        await loadSpineAsset(zeppelinId);
        if (token !== loadTokenRef.current || !stageRef.current) return;

        destroyCurrent();
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
          spine.state.setAnimation(0, 'start', false);
          spine.state.addAnimation(0, 'idle', true, 0);
        } else {
          spine.state.setAnimation(0, 'idle', true);
        }
      } else if (prevPhase === 'docked') {
        const departing = spineRef.current;
        if (departing) {
          const departureToken = ++departureTokenRef.current;
          const track = departing.state.setAnimation(0, 'end', false);
          track.listener = {
            complete: () => {
              if (departureToken !== departureTokenRef.current) return;
              destroySpineAfterFrame(
                departing,
                () => departureToken === departureTokenRef.current,
                () => {
                  if (spineRef.current !== departing) return;
                  spineRef.current = null;
                  spineIdRef.current = null;
                },
              );
            },
          };
        } else {
          destroyCurrent();
        }
      } else {
        destroyCurrent();
      }

      initializedRef.current = true;
      prevPhaseRef.current = phase;
    })().catch((err: unknown) => {
      console.error('[Zeppelin] transition failed', err);
    });
  }, [stage, phase, zeppelinId, zIndex, destroyCurrent]);

  return null;
}

export function FactionZeppelin() {
  const visit = useFactionVisit();
  const zeppelinId = gameLibrary.factions[visit.factionId].zeppelinId;

  return <Zeppelin zeppelinId={zeppelinId} phase={visit.phase} />;
}

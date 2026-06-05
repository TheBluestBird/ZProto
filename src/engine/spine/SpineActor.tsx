import { useEffect, useRef, useState } from 'react';
import type { Spine } from '@esotericsoftware/spine-pixi-v8';

import { useGameStage } from '@engine/stage/useGameStage';

import { createSpine, destroySpine, loadSpineAsset } from './loadSpine';

export interface SpineActorProps {
  /** Bundle id — folder name under `spine/<id>/` next to the component. */
  assetKey: string;
  x: number;
  y: number;
  scale?: number;
  zIndex?: number;
  animation?: string;
  loop?: boolean;
  onReady?: (spine: Spine) => void;
}

export function SpineActor({
  assetKey,
  x,
  y,
  scale = 1,
  zIndex = 0,
  animation,
  loop = true,
  onReady,
}: SpineActorProps) {
  const stage = useGameStage();
  const spineRef = useRef<Spine | null>(null);
  const [readyVersion, setReadyVersion] = useState(0);

  useEffect(() => {
    if (!stage) return;

    let disposed = false;
    let created: Spine | null = null;

    void loadSpineAsset(assetKey).then(() => {
      if (disposed) return;
      const s = createSpine(assetKey);
      created = s;
      spineRef.current = s;
      stage.world.addChild(s);
      setReadyVersion((version) => version + 1);
      onReady?.(s);
    });

    return () => {
      disposed = true;
      spineRef.current = null;
      destroySpine(created);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, assetKey]);

  useEffect(() => {
    const spine = spineRef.current;
    if (!spine) return;
    spine.position.set(x, y);
    spine.scale.set(scale);
    spine.zIndex = zIndex;
  }, [readyVersion, x, y, scale, zIndex]);

  useEffect(() => {
    const spine = spineRef.current;
    if (!spine || !animation) return;
    spine.state.setAnimation(0, animation, loop);
  }, [readyVersion, animation, loop]);

  return null;
}

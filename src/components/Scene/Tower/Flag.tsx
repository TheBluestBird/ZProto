import { SpineActor } from '@engine/spine/SpineActor';

import { SCENE_LAYER } from '../shared/layers';

export function Flag({
  scale = 1,
  anchorX = 0.5,
  anchorY = 0.18,
  offsetX = -75,
  zIndex = SCENE_LAYER.flag,
}: {
  scale?: number;
  anchorX?: number;
  anchorY?: number;
  offsetX?: number;
  zIndex?: number;
}) {
  const x = typeof window === 'undefined' ? 0 : window.innerWidth * anchorX + offsetX;
  const y = typeof window === 'undefined' ? 0 : window.innerHeight * anchorY;
  return (
    <SpineActor
      assetKey="flag"
      x={x}
      y={y}
      scale={scale}
      zIndex={zIndex}
      animation="idle"
      loop
    />
  );
}

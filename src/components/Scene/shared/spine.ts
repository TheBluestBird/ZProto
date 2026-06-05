import type { Spine } from '@esotericsoftware/spine-pixi-v8';
import { destroySpine } from '@engine/spine/loadSpine';

export function destroySpineAfterFrame(
  spine: Spine | null,
  isCurrent: () => boolean,
  onDestroyed?: () => void,
): void {
  requestAnimationFrame(() => {
    if (!isCurrent()) return;
    destroySpine(spine);
    onDestroyed?.();
  });
}

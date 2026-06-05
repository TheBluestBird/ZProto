import { Assets } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

const registered = new Set<string>();

export async function loadSpineAsset(key: string): Promise<void> {
  const base = `${import.meta.env.BASE_URL}spine/${key}/`;
  const skeletonAlias = `${key}:skeleton`;
  const atlasAlias = `${key}:atlas`;

  if (!registered.has(key)) {
    Assets.add({ alias: skeletonAlias, src: `${base}${key}.json` });
    Assets.add({ alias: atlasAlias, src: `${base}${key}.atlas` });
    registered.add(key);
  }

  await Assets.load([skeletonAlias, atlasAlias]);
}

export function createSpine(key: string): Spine {
  return new Spine({ skeleton: `${key}:skeleton`, atlas: `${key}:atlas` });
}

export function destroySpine(spine: Spine | null): void {
  if (!spine) return;
  spine.autoUpdate = false;
  spine.state.clearTracks();
  spine.parent?.removeChild(spine);
  spine.destroy();
}

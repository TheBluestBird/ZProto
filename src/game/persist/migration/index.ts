import type { GameState } from '@game/state/types';

import type { SaveBlob } from '../type';

import { migrateProfessions } from './01_professions';
import { migrateFactions } from './02_factions';
import { migrateStripAmbient } from './03_strip_ambient';

function isSaveBlob(value: unknown): value is SaveBlob<unknown> {
  return typeof value === 'object' && value !== null && 'state' in value;
}

const migrations = [
  (state: unknown) => state,
  migrateProfessions,
  migrateFactions,
  migrateStripAmbient,
];

export function migrate(blob: unknown): GameState | null {
  if (!isSaveBlob(blob)) {
    return null;
  }

  let version = typeof blob.version === 'number' ? blob.version : 0;
  let state: unknown = blob.state;

  for (const [index, migration] of migrations.entries()) {
    if (version > index) {
      continue;
    }

    try {
      state = migration(state);
      console.log(`Migration ${index} applied`);
    } catch (error: unknown) {
      console.error(`Migration ${index} failed:`, error);
      return null;
    }

    version = index;
  }

  return state as GameState;
}
export const version = migrations.length;

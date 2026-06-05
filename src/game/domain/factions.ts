import type { FactionId } from '@game/state/types';

export const FACTION_IDS: FactionId[] = [
  'artisans',
  'traders',
  'aristocrats',
  'mystics',
];

export function pickRandomFactionId(exclude?: FactionId): FactionId {
  const pool = exclude
    ? FACTION_IDS.filter((id) => id !== exclude)
    : FACTION_IDS;
  return pool[Math.floor(Math.random() * pool.length)] ?? 'artisans';
}

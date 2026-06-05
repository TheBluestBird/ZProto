type LegacyState = {
  ambient?: unknown;
};

export function migrateStripAmbient(state: unknown): unknown {
  if (typeof state !== 'object' || state === null) {
    return state;
  }

  const next = structuredClone(state) as LegacyState;
  delete next.ambient;
  return next;
}

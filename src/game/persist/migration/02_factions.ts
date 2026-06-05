import { FACTION_IDS } from '@game/domain/factions';
import { createInitialState } from '@game/state/initialState';
import type { FactionId, VisitState } from '@game/state/types';
import { legacyDockMs, scheduleVisit } from '@game/visit';

type LegacyVisit = Partial<VisitState> & {
  phase?: string;
  phaseEndsAt?: number;
  secondsLeft?: number;
  factionId?: string;
};

type LegacyState = {
  player?: { reputation?: Record<string, number> };
  visit?: LegacyVisit;
};

function toFactionId(id: unknown): FactionId | undefined {
  if (typeof id !== 'string') return undefined;
  if (id === 'workers') return 'artisans';
  return FACTION_IDS.includes(id as FactionId) ? (id as FactionId) : undefined;
}

function isScheduledVisit(visit: LegacyVisit): visit is VisitState {
  return (
    typeof visit.arrivalTime === 'number' &&
    typeof visit.departureTime === 'number' &&
    visit.departureTime > visit.arrivalTime &&
    toFactionId(visit.factionId) !== undefined
  );
}

function fromLegacyPhase(visit: LegacyVisit, now: number): VisitState {
  const factionId = toFactionId(visit.factionId) ?? 'artisans';
  let phaseEndsAt = visit.phaseEndsAt;

  if (typeof phaseEndsAt !== 'number' && typeof visit.secondsLeft === 'number') {
    phaseEndsAt = now + visit.secondsLeft * 1000;
  }

  if (typeof phaseEndsAt !== 'number') {
    return scheduleVisit(now);
  }

  const dockMs = legacyDockMs();

  if (visit.phase === 'docked') {
    const departureTime = phaseEndsAt;
    return { factionId, arrivalTime: departureTime - dockMs, departureTime };
  }

  const arrivalTime = phaseEndsAt;
  return { factionId, arrivalTime, departureTime: arrivalTime + dockMs };
}

export function migrateFactions(state: unknown): unknown {
  if (typeof state !== 'object' || state === null) {
    return state;
  }

  const next = structuredClone(state) as LegacyState;
  const defaults = createInitialState();
  const now = Date.now();

  if (next.player?.reputation) {
    const raw = { ...defaults.player.reputation, ...next.player.reputation } as Record<string, number>;
    if (typeof raw.workers === 'number') {
      raw.artisans = (raw.artisans ?? 0) + raw.workers;
      delete raw.workers;
    }
    next.player.reputation = raw;
  }

  const visit = next.visit;
  if (visit === undefined) {
    next.visit = scheduleVisit(now);
    return next;
  }

  if (isScheduledVisit(visit)) {
    next.visit = {
      factionId: toFactionId(visit.factionId)!,
      arrivalTime: visit.arrivalTime,
      departureTime: visit.departureTime,
    };
    return next;
  }

  next.visit = fromLegacyPhase(visit, now);
  return next;
}

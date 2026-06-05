import { pickRandomFactionId } from '@game/domain/factions';
import type { GameState, VisitPhase, VisitState } from '@game/state/types';

const WAIT_MIN_MS = 60_000;
const WAIT_MAX_MS = 300_000;
const DOCK_MIN_MS = 30_000;
const DOCK_MAX_MS = 120_000;
export const VISIT_HURRY_MS = 5_000;

function randomMs(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function visitPhase(now: number, visit: VisitState): VisitPhase {
  return now >= visit.arrivalTime && now < visit.departureTime ? 'docked' : 'incoming';
}

export function visitSecondsLeft(now: number, visit: VisitState): number {
  const endsAt =
    visitPhase(now, visit) === 'docked' ? visit.departureTime : visit.arrivalTime;
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export function scheduleVisit(afterTime: number, excludeFactionId?: VisitState['factionId']): VisitState {
  const arrivalTime = afterTime + randomMs(WAIT_MIN_MS, WAIT_MAX_MS);
  return {
    factionId: pickRandomFactionId(excludeFactionId),
    arrivalTime,
    departureTime: arrivalTime + randomMs(DOCK_MIN_MS, DOCK_MAX_MS),
  };
}

export function advanceVisit(state: GameState, now: number): GameState {
  let next = state;

  while (now >= next.visit.departureTime) {
    next = {
      ...next,
      visit: scheduleVisit(next.visit.departureTime, next.visit.factionId),
    };
  }

  return next;
}

export function hurryVisitArrival(state: GameState, now: number): GameState {
  const { visit } = state;

  if (now >= visit.arrivalTime) {
    return state;
  }

  const arrivalTime = now + VISIT_HURRY_MS;
  if (visit.arrivalTime <= arrivalTime) {
    return state;
  }

  const dockDuration = visit.departureTime - visit.arrivalTime;

  return {
    ...state,
    visit: {
      ...visit,
      arrivalTime,
      departureTime: arrivalTime + dockDuration,
    },
  };
}

/** Midpoint dock length for reconstructing legacy phase-based saves. */
export function legacyDockMs(): number {
  return Math.floor((DOCK_MIN_MS + DOCK_MAX_MS) / 2);
}

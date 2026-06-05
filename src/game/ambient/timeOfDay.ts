export const timeOfDayPhases = [
  { id: 'morning', label: 'Morning' },
  { id: 'day', label: 'Day' },
  { id: 'evening', label: 'Evening' },
  { id: 'night', label: 'Night' },
] as const;

export type TimeOfDay = (typeof timeOfDayPhases)[number]['id'];

/** Crossfade duration when time of day changes, in seconds. */
export const PHASE_TRANSITION_SECONDS = 10;

/** Local-time boundaries: 5am morning, 9am day, 6pm evening, 11pm night. */
export function timeOfDayFromDate(date: Date): TimeOfDay {
  const mins = date.getHours() * 60 + date.getMinutes();

  if (mins >= 23 * 60 || mins < 5 * 60) return 'night';
  if (mins < 9 * 60) return 'morning';
  if (mins < 18 * 60) return 'day';
  return 'evening';
}

function nextPhaseBoundaryMs(now: number): number {
  const date = new Date(now);
  const mins = date.getHours() * 60 + date.getMinutes();

  const todayAt = (hour: number) => {
    const next = new Date(date);
    next.setHours(hour, 0, 0, 0);
    return next.getTime();
  };

  if (mins < 5 * 60) return todayAt(5);
  if (mins < 9 * 60) return todayAt(9);
  if (mins < 18 * 60) return todayAt(18);
  if (mins < 23 * 60) return todayAt(23);

  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(5, 0, 0, 0);
  return tomorrow.getTime();
}

let debugPhase: TimeOfDay | null = null;
let debugUntil = 0;

let scheduleTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emitTimeOfDayChange() {
  for (const listener of listeners) {
    listener();
  }
}

function reschedule() {
  if (scheduleTimer !== null) {
    clearTimeout(scheduleTimer);
  }

  if (listeners.size === 0) {
    scheduleTimer = null;
    return;
  }

  const now = Date.now();
  if (debugPhase !== null && now >= debugUntil) {
    debugPhase = null;
  }

  const until =
    debugPhase !== null && now < debugUntil ? debugUntil : nextPhaseBoundaryMs(now);

  scheduleTimer = setTimeout(() => {
    if (debugPhase !== null && Date.now() >= debugUntil) {
      debugPhase = null;
    }
    emitTimeOfDayChange();
    reschedule();
  }, Math.max(500, until - now));
}

/** Debug-only override until the next real phase boundary. */
export function setDebugTimeOfDay(phase: TimeOfDay): void {
  debugPhase = phase;
  debugUntil = nextPhaseBoundaryMs(Date.now());
  emitTimeOfDayChange();
  reschedule();
}

export function resolveTimeOfDay(now = Date.now()): TimeOfDay {
  if (debugPhase !== null && now < debugUntil) {
    return debugPhase;
  }

  debugPhase = null;
  return timeOfDayFromDate(new Date(now));
}

export function subscribeTimeOfDay(listener: () => void): () => void {
  listeners.add(listener);
  listener();

  if (listeners.size === 1) {
    reschedule();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      reschedule();
    }
  };
}

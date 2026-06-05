import { useSyncExternalStore } from 'react';

import skyMorning from './assets/sky_morning.png';
import skyDay from './assets/sky_day.png';
import skyEvening from './assets/sky_evening.png';
import skyNight from './assets/sky_night.png';
import towerMorning from './assets/tower_morning.png';
import towerDay from './assets/tower_day.png';
import towerEvening from './assets/tower_evening.png';
import towerNight from './assets/tower_night.png';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export const TIME_PHASES: TimeOfDay[] = ['morning', 'day', 'evening', 'night'];

/** Crossfade duration when advancing to the next phase, in seconds. */
export const PHASE_TRANSITION_SECONDS = 10;

export const TIME_ASSETS: Record<TimeOfDay, { sky: string; tower: string }> = {
  morning: { sky: skyMorning, tower: towerMorning },
  day: { sky: skyDay, tower: towerDay },
  evening: { sky: skyEvening, tower: towerEvening },
  night: { sky: skyNight, tower: towerNight },
};

const PHASE_LABEL: Record<TimeOfDay, string> = {
  morning: 'Morning',
  day: 'Day',
  evening: 'Evening',
  night: 'Night',
};

export function phaseLabel(phase: TimeOfDay): string {
  return PHASE_LABEL[phase];
}

let current: TimeOfDay = 'day';
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

export function getTimeOfDay(): TimeOfDay {
  return current;
}

/** Advance to the next phase in the morning → day → evening → night cycle. */
export function advanceTimeOfDay(): TimeOfDay {
  const index = TIME_PHASES.indexOf(current);
  current = TIME_PHASES[(index + 1) % TIME_PHASES.length];
  emit();
  return current;
}

export function nextPhase(phase: TimeOfDay): TimeOfDay {
  const index = TIME_PHASES.indexOf(phase);
  return TIME_PHASES[(index + 1) % TIME_PHASES.length];
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useTimeOfDay(): TimeOfDay {
  return useSyncExternalStore(subscribe, getTimeOfDay, getTimeOfDay);
}

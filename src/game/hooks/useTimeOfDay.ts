import { useSyncExternalStore } from 'react';

import {
  resolveTimeOfDay,
  subscribeTimeOfDay,
  type TimeOfDay,
} from '@game/ambient/timeOfDay';

export function useTimeOfDay(): TimeOfDay {
  return useSyncExternalStore(subscribeTimeOfDay, resolveTimeOfDay, resolveTimeOfDay);
}

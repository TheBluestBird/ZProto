import { HurryArrival } from '@game/events/HurryArrival';
import { useGameDispatch } from '@game/hooks/useGameDispatch';
import { useGameState } from '@game/hooks/useGameState';
import type { GameState } from '@game/state/types';
import { visitPhase, visitSecondsLeft } from '@game/visit';

function selectFactionVisit(state: GameState) {
  const now = Date.now();
  const visit = state.visit;
  return {
    factionId: visit.factionId,
    phase: visitPhase(now, visit),
    secondsLeft: visitSecondsLeft(now, visit),
  };
}

export function useFactionVisit() {
  const dispatch = useGameDispatch();
  const view = useGameState(selectFactionVisit);

  return {
    ...view,
    hurryArrival: () => {
      dispatch(new HurryArrival());
    },
  };
}

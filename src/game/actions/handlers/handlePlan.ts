import { startNextTask } from '@game/tasks/simulation';
import type { Plan } from '@game/events/Plan';
import type { GameLibrary } from '@game/library/types';
import type { GameState } from '@game/state/types';

export function handlePlan(state: GameState, event: Plan, library: GameLibrary): GameState {
  if (event.count < 1) {
    return state;
  }

  const skill = library.skills[event.skillId];
  if (skill === undefined) {
    return state;
  }

  const professionId = skill.professionId;
  const profession = state.professions[professionId];
  const id = state.nextQueueId;
  const now = Date.now();

  const withPlan: GameState = {
    ...state,
    nextQueueId: id + 1,
    professions: {
      ...state.professions,
      [professionId]: {
        ...profession,
        taskQueue: [
          ...profession.taskQueue,
          { id, skillId: event.skillId, count: event.count },
        ],
      },
    },
  };

  return startNextTask(withPlan, professionId, now);
}

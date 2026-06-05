import { PROFESSION_IDS } from '@game/domain/professions';
import type { GameLibrary } from '@game/library/types';
import {
  completeCurrentTask,
  startAllNextTasks,
} from '@game/tasks/simulation';
import type { GameState, ProfessionId } from '@game/state/types';
import { advanceVisit } from '@game/visit';

export function applyOfflineProgress(
  state: GameState,
  now: number,
  library: GameLibrary,
): GameState {
  if (state.lastTickAt <= 0) {
    return {
      ...state,
      lastTickAt: now,
    };
  }

  if (now <= state.lastTickAt) {
    return state;
  }

  let next = state;
  let simulatedTime = state.lastTickAt;

  while (simulatedTime < now) {
    next = startAllNextTasks(next, simulatedTime);

    const finishing = findEarliestFinishingTask(next, simulatedTime, now, library);
    if (finishing === null) {
      break;
    }

    const { professionId, finishAt } = finishing;
    next = completeCurrentTask(next, professionId, finishAt, library);
    simulatedTime = finishAt;
  }

  return advanceVisit({ ...next, lastTickAt: now }, now);
}

function findEarliestFinishingTask(
  state: GameState,
  after: number,
  before: number,
  library: GameLibrary,
): { professionId: ProfessionId; finishAt: number } | null {
  let earliest: { professionId: ProfessionId; finishAt: number } | null = null;

  for (const professionId of PROFESSION_IDS) {
    const currentTask = state.professions[professionId].currentTask;
    if (currentTask === null) {
      continue;
    }

    const skillDef = library.skills[currentTask.skillId];
    if (skillDef === undefined) {
      continue;
    }

    const finishAt = currentTask.startedAt + skillDef.duration;
    if (finishAt <= after || finishAt > before) {
      continue;
    }

    if (earliest === null || finishAt < earliest.finishAt) {
      earliest = { professionId, finishAt };
    }
  }

  return earliest;
}

import { handleCancelTask } from '@game/actions/handlers/handleCancelTask';
import { handleLearnSkill } from '@game/actions/handlers/handleLearnSkill';
import { handlePlan } from '@game/actions/handlers/handlePlan';
import { handleSetSkillFavorite } from '@game/actions/handlers/handleSetSkillFavorite';
import { handleUnplan } from '@game/actions/handlers/handleUnplan';
import { CancelTask } from '@game/events/CancelTask';
import { HurryArrival } from '@game/events/HurryArrival';
import { LearnSkill } from '@game/events/LearnSkill';
import { Plan } from '@game/events/Plan';
import { SetSkillFavorite } from '@game/events/SetSkillFavorite';
import { Tick } from '@game/events/Tick';
import { Unplan } from '@game/events/Unplan';
import type { GameEvent } from '@game/events/GameEvent';
import type { GameLibrary } from '@game/library/types';
import { advanceTick } from '@game/tasks/simulation';
import type { GameState } from '@game/state/types';
import { advanceVisit, hurryVisitArrival } from '@game/visit';

export function reduce(
  state: GameState,
  event: GameEvent,
  library: GameLibrary,
): GameState {
  if (event instanceof Plan) {
    return handlePlan(state, event, library);
  }

  if (event instanceof Unplan) {
    return handleUnplan(state, event);
  }

  if (event instanceof CancelTask) {
    return handleCancelTask(state, event);
  }

  if (event instanceof LearnSkill) {
    return handleLearnSkill(state, event, library);
  }

  if (event instanceof SetSkillFavorite) {
    return handleSetSkillFavorite(state, event, library);
  }

  if (event instanceof HurryArrival) {
    return hurryVisitArrival(state, Date.now());
  }

  if (event instanceof Tick) {
    const afterTasks = advanceTick(state, event.now, library);
    return advanceVisit(afterTasks, event.now);
  }

  return state;
}

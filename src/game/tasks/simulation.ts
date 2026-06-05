import { PROFESSION_IDS } from '@game/domain/professions';
import type { GameLibrary } from '@game/library/types';
import { addPlayerExperience } from '@game/player/experience';
import { recordSkillApplication } from '@game/professions/applySkill';
import type { GameState, ProfessionId } from '@game/state/types';

export function startNextTask(
  state: GameState,
  professionId: ProfessionId,
  now: number,
): GameState {
  const profession = state.professions[professionId];

  if (profession.currentTask !== null || profession.taskQueue.length === 0) {
    return state;
  }

  const head = profession.taskQueue[0];
  if (head === undefined) {
    return state;
  }

  return {
    ...state,
    professions: {
      ...state.professions,
      [professionId]: {
        ...profession,
        currentTask: {
          skillId: head.skillId,
          startedAt: now,
        },
      },
    },
  };
}

export function startAllNextTasks(state: GameState, now: number): GameState {
  let next = state;

  for (const professionId of PROFESSION_IDS) {
    next = startNextTask(next, professionId, now);
  }

  return next;
}

export function completeCurrentTask(
  state: GameState,
  professionId: ProfessionId,
  now: number,
  library: GameLibrary,
): GameState {
  const profession = state.professions[professionId];

  if (profession.currentTask === null) {
    return state;
  }

  const skillDef = library.skills[profession.currentTask.skillId];
  if (skillDef === undefined) {
    return updateProfession(state, professionId, {
      ...profession,
      currentTask: null,
    }, now);
  }

  const hasIngredients = skillDef.ingredients.every(
    (ing) => (state.inventory[ing.itemId] ?? 0) >= ing.quantity,
  );

  let inventory = { ...state.inventory };

  if (hasIngredients) {
    for (const ing of skillDef.ingredients) {
      inventory[ing.itemId] = Math.max(0, (inventory[ing.itemId] ?? 0) - ing.quantity);
    }

    for (const prod of skillDef.products) {
      if (Math.random() <= prod.probability) {
        inventory[prod.itemId] = (inventory[prod.itemId] ?? 0) + prod.quantity;
      }
    }
  }

  let next: GameState = { ...state, inventory };

  if (hasIngredients) {
    next = recordSkillApplication(
      next,
      skillDef.id,
      skillDef.professionId,
      skillDef.xp,
    );
    next = addPlayerExperience(next, skillDef.xp);
  }

  const updatedProfession = next.professions[professionId];
  const head = updatedProfession.taskQueue[0];

  if (head === undefined) {
    return updateProfession(next, professionId, {
      ...updatedProfession,
      currentTask: null,
    }, now);
  }

  const newCount = hasIngredients ? head.count - 1 : 0;
  const taskQueue =
    newCount <= 0
      ? updatedProfession.taskQueue.slice(1)
      : [{ ...head, count: newCount }, ...updatedProfession.taskQueue.slice(1)];

  const nextHead = taskQueue[0];
  const currentTask =
    nextHead !== undefined
      ? { skillId: nextHead.skillId, startedAt: now }
      : null;

  return updateProfession(next, professionId, {
    ...updatedProfession,
    taskQueue,
    currentTask,
  }, now);
}

function updateProfession(
  state: GameState,
  professionId: ProfessionId,
  profession: GameState['professions'][ProfessionId],
  now: number,
): GameState {
  return {
    ...state,
    professions: {
      ...state.professions,
      [professionId]: profession,
    },
    lastTickAt: now,
  };
}

function isCurrentTaskComplete(
  state: GameState,
  professionId: ProfessionId,
  now: number,
  library: GameLibrary,
): boolean {
  const currentTask = state.professions[professionId].currentTask;
  if (currentTask === null) {
    return false;
  }

  const skillDef = library.skills[currentTask.skillId];
  if (skillDef === undefined) {
    return false;
  }

  return now - currentTask.startedAt >= skillDef.duration;
}

export function advanceTick(
  state: GameState,
  now: number,
  library: GameLibrary,
): GameState {
  let next: GameState = { ...state, lastTickAt: now };

  next = startAllNextTasks(next, now);

  let changed = true;
  while (changed) {
    changed = false;

    for (const professionId of PROFESSION_IDS) {
      if (isCurrentTaskComplete(next, professionId, now, library)) {
        next = completeCurrentTask(next, professionId, now, library);
        changed = true;
      }
    }
  }

  return next;
}

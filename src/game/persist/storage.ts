import { FACTION_IDS } from '@game/domain/factions';
import { PROFESSION_IDS } from '@game/domain/professions';
import { createEmptyProfession, createInitialState } from '@game/state/initialState';
import type { GameState } from '@game/state/types';

import type { SaveBlob } from './type';
import { migrate, version } from './migration';

const storageKey = 'zproto:game';

function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null)
    return false;

  const state = value as GameState;

  if (
    typeof state.player !== 'object' ||
    state.player === null ||
    typeof state.professions !== 'object' ||
    state.professions === null ||
    typeof state.visit !== 'object' ||
    state.visit === null ||
    typeof state.visit.arrivalTime !== 'number' ||
    typeof state.visit.departureTime !== 'number' ||
    state.visit.departureTime <= state.visit.arrivalTime
  ) {
    return false;
  }

  return PROFESSION_IDS.every((professionId) => {
    const profession = state.professions[professionId];
    return (
      typeof profession === 'object' &&
      profession !== null &&
      Array.isArray(profession.taskQueue) &&
      (profession.currentTask === null || typeof profession.currentTask === 'object')
    );
  });
}

function normalizeLoadedState(state: GameState): GameState {
  const initial = createInitialState();
  let maxQueueId = Math.max(state.nextQueueId, 1);

  for (const professionId of PROFESSION_IDS) {
    for (const task of state.professions[professionId].taskQueue) {
      maxQueueId = Math.max(maxQueueId, task.id + 1);
    }
  }

  const professions = {} as GameState['professions'];

  for (const professionId of PROFESSION_IDS) {
    const loaded = state.professions[professionId];
    const defaults = initial.professions[professionId];

    professions[professionId] = {
      ...createEmptyProfession(),
      ...defaults,
      ...loaded,
      level: loaded.level,
      skillPoints: loaded.skillPoints,
      skills: {
        ...defaults.skills,
        ...loaded.skills,
      },
      taskQueue: loaded.taskQueue,
      currentTask: loaded.currentTask,
    };
  }

  return {
    ...initial,
    ...state,
    player: {
      ...initial.player,
      ...state.player,
      reputation: FACTION_IDS.reduce((reputation, factionId) => {
        reputation[factionId] = state.player.reputation[factionId] ?? 0;
        return reputation;
      }, { ...initial.player.reputation }),
    },
    visit: {
      ...initial.visit,
      ...state.visit,
    },
    inventory: {
      ...initial.inventory,
      ...state.inventory,
    },
    professions,
    nextQueueId: maxQueueId,
  };
}

export function saveState(state: GameState): void {
  localStorage.setItem(
    storageKey,
    JSON.stringify({ state, version } satisfies SaveBlob)
  );
}

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null)
      return null;

    const blob = JSON.parse(raw);
    const state = migrate(blob);
    if (!state || !isGameState(state))
      return null;

    return normalizeLoadedState(state);
  } catch {
    return null;
  }
}

export function clearSavedState(): void {
  localStorage.removeItem(storageKey);
}

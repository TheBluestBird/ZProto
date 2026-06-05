import { FACTION_IDS } from '@game/domain/factions';
import { INITIAL_SKILL_BY_PROFESSION } from '@game/domain/professions';
import { initialLevelProgress } from '@game/progression';
import { scheduleVisit } from '@game/visit';
import type { FactionId, GameState, PlayerProfession, PlayerSkill, ProfessionId } from '@game/state/types';

export function createDefaultPlayerSkill(): PlayerSkill {
  return {
    applications: 0,
    favorite: false,
  };
}

export function createEmptyProfession(): PlayerProfession {
  return {
    level: initialLevelProgress,
    skillPoints: 0,
    skills: {},
    taskQueue: [],
    currentTask: null,
  };
}

function createInitialProfession(professionId: ProfessionId): PlayerProfession {
  const profession = createEmptyProfession();

  profession.skills[INITIAL_SKILL_BY_PROFESSION[professionId]] = createDefaultPlayerSkill();

  return profession;
}

function createInitialReputation(): Record<FactionId, number> {
  return Object.fromEntries(FACTION_IDS.map((id) => [id, 0])) as Record<FactionId, number>;
}

export function createInitialState(now = Date.now()): GameState {
  return {
    player: {
      name: 'Richard Bower',
      status: 'Newcomer',
      level: initialLevelProgress,
      gold: 0,
      reputation: createInitialReputation(),
    },
    visit: scheduleVisit(now),
    inventory: {},
    professions: {
      blacksmithing: createInitialProfession('blacksmithing'),
      cooking: createInitialProfession('cooking'),
      carpentry: createInitialProfession('carpentry'),
      forest: createInitialProfession('forest'),
      mine: createInitialProfession('mine'),
      river: createInitialProfession('river'),
    },
    nextQueueId: 1,
    lastTickAt: 0,
  };
}

import { applyExperience } from '@game/progression';
import type { GameState, ProfessionId } from '@game/state/types';

export function recordSkillApplication(
  state: GameState,
  skillId: string,
  professionId: ProfessionId,
  experienceGained: number,
): GameState {
  const profession = state.professions[professionId];
  const existing = profession.skills[skillId];

  if (existing === undefined) {
    return state;
  }

  return {
    ...state,
    professions: {
      ...state.professions,
      [professionId]: {
        ...profession,
        level: applyExperience(profession.level, experienceGained),
        skills: {
          ...profession.skills,
          [skillId]: {
            ...existing,
            applications: existing.applications + 1,
          },
        },
      },
    },
  };
}

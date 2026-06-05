import type { ProfessionId } from '@game/state/types';

export const PROFESSION_IDS: ProfessionId[] = [
  'blacksmithing',
  'cooking',
  'carpentry',
  'forest',
  'mine',
  'river',
];

type GatheringProfessionId = 'forest' | 'mine' | 'river';

export const GATHERING_PROFESSION_IDS: GatheringProfessionId[] = [
  'forest',
  'mine',
  'river',
];

export const DEFAULT_GATHERING_SKILL_BY_PROFESSION: Record<GatheringProfessionId, string> = {
  forest: 'lumber_1',
  mine: 'mining_1',
  river: 'fishing_1',
};

export const INITIAL_SKILL_BY_PROFESSION: Record<ProfessionId, string> = {
  ...DEFAULT_GATHERING_SKILL_BY_PROFESSION,
  carpentry: 'carpentry_1',
  cooking: 'cooking_1',
  blacksmithing: 'blacksmith_1',
};

export function getDefaultGatheringSkillId(
  professionId: ProfessionId,
): string | undefined {
  if (!(professionId in DEFAULT_GATHERING_SKILL_BY_PROFESSION)) {
    return undefined;
  }
  return DEFAULT_GATHERING_SKILL_BY_PROFESSION[professionId as GatheringProfessionId];
}

const SKILL_PREFIX_TO_PROFESSION: Record<string, ProfessionId> = {
  fishing: 'river',
  lumber: 'forest',
  mining: 'mine',
  cooking: 'cooking',
  carpentry: 'carpentry',
  blacksmith: 'blacksmithing',
};

export function getProfessionIdFromSkillId(skillId: string): ProfessionId | undefined {
  const prefix = skillId.split('_')[0] ?? '';
  return SKILL_PREFIX_TO_PROFESSION[prefix];
}

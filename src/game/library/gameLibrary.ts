import { libraryFactions } from '@game/library/factions';
import { libraryItems } from '@game/library/items';
import { libraryProfessions } from '@game/library/professions';
import { librarySkills } from '@game/library/skills';
import type {
  GameLibrary,
  LibraryItem,
  LibraryProfession,
  LibrarySkill,
} from '@game/library/types';
import type { ProfessionId } from '@game/state/types';

export const gameLibrary: GameLibrary = {
  professions: libraryProfessions,
  skills: librarySkills,
  items: libraryItems,
  factions: libraryFactions,
};

export function getProfession(id: ProfessionId): LibraryProfession {
  return gameLibrary.professions[id];
}

export function getSkill(id: string): LibrarySkill | undefined {
  return gameLibrary.skills[id];
}

export function getItem(id: string): LibraryItem | undefined {
  return gameLibrary.items[id];
}

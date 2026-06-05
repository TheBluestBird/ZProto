import type { FactionId, ProfessionId } from '@game/state/types';

export type ProfessionType = 'gathering' | 'craft';

export type LibraryProfession = {
  id: ProfessionId;
  type: ProfessionType;
  title: string;
  workshop: {
    title: string;
  };
};

export type Ingredient = {
  itemId: string;
  quantity: number;
};

export type Product = {
  itemId: string;
  quantity: number;
  probability: number;
};

export type LibrarySkill = {
  id: string;
  professionId: ProfessionId;
  description: string;
  ingredients: Ingredient[];
  products: Product[];
  /** Task duration in milliseconds. */
  duration: number;
  /** Experience gained per successful application. */
  xp: number;
  icon: string;
};

export type LibraryItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  price?: number;
};

export type FactionGood = {
  itemId: string;
  name: string;
  icon: string;
  quantity: number;
  price: number;
};

export type FactionBlueprint = {
  id: string;
  name: string;
  icon: string;
  reputationRequired: number;
  price: number;
};

export type FactionReward = {
  coins: number;
  reputation: number;
  blueprints: number;
};

export type FactionQuest = {
  id: string;
  itemId: string;
  itemName: string;
  icon: string;
  description: string;
  required: number;
  delivered: number;
  reward: FactionReward;
};

export type MilestoneReward = {
  name: string;
  icon: string;
};

export type FactionMilestone = {
  reputation: number;
  reached: boolean;
  blueprintReward: MilestoneReward;
  decorationReward: MilestoneReward;
};

export type LibraryFaction = {
  id: FactionId;
  name: string;
  mood: string;
  blurb: string;
  lore: string;
  quote: string;
  portrait: string;
  crest: string;
  zeppelinId: string;
  goods: FactionGood[];
  buying: FactionGood[];
  blueprints: FactionBlueprint[];
  quests: FactionQuest[];
  milestones: FactionMilestone[];
};

export type GameLibrary = {
  professions: Record<ProfessionId, LibraryProfession>;
  skills: Record<string, LibrarySkill>;
  items: Record<string, LibraryItem>;
  factions: Record<FactionId, LibraryFaction>;
};

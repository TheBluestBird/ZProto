import type { ProfessionId } from '@game/state/types';

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

export type GameLibrary = {
  professions: Record<ProfessionId, LibraryProfession>;
  skills: Record<string, LibrarySkill>;
  items: Record<string, LibraryItem>;
};

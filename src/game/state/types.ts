import type { LevelProgress } from '@game/progression';

export type { LevelProgress };

export type FactionId = 'traders' | 'aristocrats' | 'mystics' | 'artisans';

export type Player = {
  name: string;
  status: string;
  level: LevelProgress;
  gold: number;
  reputation: Record<FactionId, number>;
};

export type ProfessionId = 'blacksmithing' | 'cooking' | 'carpentry' | 'forest' | 'mine' | 'river';

export type PlayerSkill = {
  applications: number;
  favorite: boolean;
};

export type PlayerProfession = {
  level: LevelProgress;
  skillPoints: number;
  skills: Partial<Record<string, PlayerSkill>>;
  taskQueue: TaskQueue;
  currentTask: CurrentTask | null;
};

export type PlayerProfessions = Record<ProfessionId, PlayerProfession>;

export type QueuedTask = {
  id: number;
  skillId: string;
  count: number;
};

export type TaskQueue = QueuedTask[];

export type CurrentTask = {
  skillId: string;
  startedAt: number;
};

export type Inventory = Record<string, number>;

export type VisitPhase = 'incoming' | 'docked';

export type VisitState = {
  factionId: FactionId;
  /** When the scheduled zeppelin arrives, ms since epoch. */
  arrivalTime: number;
  /** When the docked zeppelin departs, ms since epoch. */
  departureTime: number;
};

export type GameState = {
  player: Player;
  visit: VisitState;
  inventory: Inventory;
  professions: PlayerProfessions;
  nextQueueId: number;
  lastTickAt: number;
};

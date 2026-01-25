export enum DungeonType {
  EXPEDITION = 'EXPEDITION',
  TRANSCENDENCE = 'TRANSCENDENCE',
  AWAKENING = 'AWAKENING', // No revenue, count only
  PET = 'PET', // No revenue, count only
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

export type DungeonDifficulty = 1 | 2 | 3; // Stars for Expedition

export interface DungeonRevenueParams {
  type: DungeonType;
  difficulty?: number; // Star for Expedition, Layer for Transcendence
  baseRevenueOverride?: number; // In case we want to support manual override
}

import { DungeonType } from '@/features/dungeon/types';

export interface DungeonLog {
  id: string;
  characterId: string;
  serverId: string; // New: Link to server
  dungeonType: DungeonType;
  difficulty: number;
  revenue: number;
  timestamp: number;
  isDiminished: boolean;
  diminishingFactor: number; // 1.0, 0.8, 0.6
}

export interface ExpenseLog {
  id: string;
  characterId: string;
  serverId: string;
  amount: number;
  timestamp: number;
  type: 'BUY_ENERGY' | 'CRAFT_ENERGY' | 'MANUAL_ADJUSTMENT';
  note?: string;
}

export interface Character {
  id: string;
  serverId: string; // New: Link to server
  name: string;
  class: string;
  gearScore: number;
  odEnergy: number; // max 800
  overflowEnergy: number; // max 800, New
  totalKinah: number;
  totalConsumption: number; // New
  weeklyEnergyBought: number; // max 7
  weeklyEnergyCrafted: number; // max 7
  weeklyExpeditionCount: number; // max 35, New
  weeklyTranscendenceCount: number; // max 28, New
  weeklyAwakeningCount: number; // max 3
  weeklyPetCount: number; // max 7
  isHidden?: boolean; // New: Hide character from dashboard
}

export interface ServerStats {
  weeklyRuns: number;
  weeklyTranscendenceRuns: number;
  kinahRatio: number; // Global ratio per server
  itemPrices: Record<string, number>; // New: Item prices per server
}

export interface ServerConfig {
  id: string;
  name: string;
  region: string;
  isCustom?: boolean;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-1
}

export interface SettingsSlice {
  sound: SoundSettings;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
}

export interface AccountSlice {
  selectedServer: string | null;
  servers: ServerConfig[]; // New: Dynamic server list
  serverStats: Record<string, ServerStats>; // Map serverId -> stats
  logs: DungeonLog[];
  expenses: ExpenseLog[]; // New
  setSelectedServer: (server: string) => void;
  updateServerName: (serverId: string, name: string) => void; // New
  resetServerName: (serverId: string) => void; // New
  importCleanedData: (cleanedLogs: DungeonLog[], cleanedCharacters: Character[]) => void; // New
  incrementWeeklyRuns: () => void;
  incrementWeeklyTranscendenceRuns: () => void;
  updateServerRatio: (ratio: number) => void;
  updateItemPrice: (itemId: string, price: number) => void; // New
  addLog: (log: DungeonLog) => void;
  addExpense: (expense: ExpenseLog) => void; // New
  resetWeeklyStats: () => void;
}

export interface CharacterSlice {
  characters: Character[];
  addCharacter: (character: Omit<Character, 'id' | 'serverId'>) => void;
  removeCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  incrementCharacterDungeonCount: (id: string, type: DungeonType) => void;
  // New actions
  addCharacterEnergy: (id: string, amount: number) => void;
  consumeCharacterEnergy: (id: string, amount: number) => void;
  craftEnergy: (id: string, cost: number) => void; // +80 energy, increment crafted count, deduct cost
  buyEnergy: (id: string, cost: number) => void; // +40 energy, increment bought count, deduct cost
}

export type GameStore = AccountSlice & CharacterSlice & SettingsSlice;

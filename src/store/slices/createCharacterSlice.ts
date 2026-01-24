import { StateCreator } from 'zustand';
import { GameStore, CharacterSlice } from '../types';
import { DungeonType } from '@/features/dungeon/types';

export const createCharacterSlice: StateCreator<GameStore, [], [], CharacterSlice> = (set) => ({
  characters: [],
  addCharacter: (charData) => set((state) => ({
    characters: [
      ...state.characters,
      {
        ...charData,
        id: crypto.randomUUID(),
        serverId: state.selectedServer || 'unknown', // Assign serverId
        odEnergy: 800, // Default to full energy
        overflowEnergy: 0,
        totalKinah: 0,
        // kinahRatio removed
        weeklyEnergyBought: 0,
        weeklyEnergyCrafted: 0,
        weeklyExpeditionCount: 0,
        weeklyTranscendenceCount: 0,
        weeklyAwakeningCount: 0,
        weeklyPetCount: 0,
      },
    ],
  })),
  removeCharacter: (id) => set((state) => ({
    characters: state.characters.filter((c) => c.id !== id),
  })),
  updateCharacter: (id, updates) => set((state) => ({
    characters: state.characters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
  })),
  incrementCharacterDungeonCount: (id, type) => set((state) => ({
    characters: state.characters.map((c) => {
      if (c.id !== id) return c;
      if (type === DungeonType.EXPEDITION) {
        return { ...c, weeklyExpeditionCount: Math.min(35, (c.weeklyExpeditionCount || 0) + 1) };
      }
      if (type === DungeonType.TRANSCENDENCE) {
        return { ...c, weeklyTranscendenceCount: Math.min(28, (c.weeklyTranscendenceCount || 0) + 1) };
      }
      if (type === DungeonType.AWAKENING) {
        return { ...c, weeklyAwakeningCount: Math.min(3, c.weeklyAwakeningCount + 1) };
      }
      if (type === DungeonType.PET) {
        return { ...c, weeklyPetCount: Math.min(7, c.weeklyPetCount + 1) };
      }
      return c;
    }),
  })),
  addCharacterEnergy: (id, amount) => set((state) => ({
    characters: state.characters.map((c) => 
      c.id === id ? { ...c, odEnergy: Math.min(800, c.odEnergy + amount) } : c
    ),
  })),
  consumeCharacterEnergy: (id, amount) => set((state) => ({
    characters: state.characters.map((c) => 
      c.id === id ? { ...c, odEnergy: Math.max(0, c.odEnergy - amount) } : c
    ),
  })),
  craftEnergy: (id) => set((state) => ({
    characters: state.characters.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        weeklyEnergyCrafted: 7, // Immediately reach limit
        // odEnergy: Math.min(800, c.odEnergy + 80) // Decoupled
      };
    }),
  })),
  buyEnergy: (id) => set((state) => ({
    characters: state.characters.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        weeklyEnergyBought: 7, // Immediately reach limit
        // odEnergy: Math.min(800, c.odEnergy + 40) // Decoupled
      };
    }),
  })),
});

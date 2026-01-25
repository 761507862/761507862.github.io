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
        odEnergy: charData.odEnergy ?? 800, // Default to full energy
        overflowEnergy: charData.overflowEnergy ?? 0,
        totalKinah: charData.totalKinah ?? 0,
        totalConsumption: charData.totalConsumption ?? 0,
        // kinahRatio removed
        weeklyEnergyBought: charData.weeklyEnergyBought ?? 0,
        weeklyEnergyCrafted: charData.weeklyEnergyCrafted ?? 0,
        weeklyExpeditionCount: charData.weeklyExpeditionCount ?? 0,
        weeklyTranscendenceCount: charData.weeklyTranscendenceCount ?? 0,
        weeklyAwakeningCount: charData.weeklyAwakeningCount ?? 0,
        weeklyPetCount: charData.weeklyPetCount ?? 0,
        isHidden: charData.isHidden ?? false
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
  craftEnergy: (id, cost) => set((state) => {
    // We should ideally call addExpense here, but slice reducers are pure.
    // However, we can update the character state directly here.
    // The expense logging will be handled in the component calling this action.
    // Wait, the action `craftEnergy` is what's called.
    // I should modify `craftEnergy` to accept `addExpense` from AccountSlice?
    // No, zustand merge.
    
    // Actually, I can update `totalConsumption` here, but I can't easily add to `expenses` array which is in AccountSlice
    // unless I access the whole state. `state` here IS GameStore which includes AccountSlice.
    // So I can modify `expenses` here!
    
    const char = state.characters.find(c => c.id === id);
    if (!char) return state;

    const newExpense = {
      id: crypto.randomUUID(),
      characterId: id,
      serverId: state.selectedServer || 'unknown',
      amount: cost,
      timestamp: Date.now(),
      type: 'CRAFT_ENERGY' as const,
    };

    return {
      characters: state.characters.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          weeklyEnergyCrafted: 7, // Immediately reach limit
          totalConsumption: (c.totalConsumption || 0) + cost
        };
      }),
      expenses: [newExpense, ...state.expenses]
    };
  }),
  buyEnergy: (id, cost) => set((state) => {
    const char = state.characters.find(c => c.id === id);
    if (!char) return state;

    const newExpense = {
      id: crypto.randomUUID(),
      characterId: id,
      serverId: state.selectedServer || 'unknown',
      amount: cost,
      timestamp: Date.now(),
      type: 'BUY_ENERGY' as const,
    };

    return {
      characters: state.characters.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          weeklyEnergyBought: 7, // Immediately reach limit
          totalConsumption: (c.totalConsumption || 0) + cost
        };
      }),
      expenses: [newExpense, ...state.expenses]
    };
  }),
});

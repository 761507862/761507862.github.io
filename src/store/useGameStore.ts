import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameStore } from './types';
import { createAccountSlice } from './slices/createAccountSlice';
import { createCharacterSlice } from './slices/createCharacterSlice';

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createAccountSlice(...a),
      ...createCharacterSlice(...a),
    }),
    {
      name: 'aion-revenue-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // migration logic if needed in future
        }
        return persistedState as GameStore;
      },
    }
  )
);

import { StateCreator } from 'zustand';
import { SettingsSlice, GameStore } from '../types';

export const createSettingsSlice: StateCreator<GameStore, [], [], SettingsSlice> = (set) => ({
  sound: {
    enabled: true,
    volume: 0.5,
  },
  setSoundEnabled: (enabled) =>
    set((state) => ({
      sound: {
        ...state.sound,
        enabled,
      },
    })),
  setSoundVolume: (volume) =>
    set((state) => ({
      sound: {
        ...state.sound,
        volume,
      },
    })),
});

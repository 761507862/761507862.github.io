import { StateCreator } from 'zustand';
import { GameStore, AccountSlice } from '../types';

const DEFAULT_SERVERS = [
  { id: 'siel', name: 'Siel', region: 'NA' },
  { id: 'israphel', name: 'Israphel', region: 'NA' },
  { id: 'vaizel', name: 'Vaizel', region: 'NA' },
  { id: 'triniel', name: 'Triniel', region: 'NA' },
  { id: 'nezekan', name: 'Nezekan', region: 'NA' },
  { id: 'zikel', name: 'Zikel', region: 'NA' },
];

export const createAccountSlice: StateCreator<GameStore, [], [], AccountSlice> = (set) => ({
  selectedServer: null,
  servers: DEFAULT_SERVERS, // Initialize with defaults
  serverStats: {}, // Initialize empty map
  logs: [],
  expenses: [],
  setSelectedServer: (server) => set({ selectedServer: server }),

  updateServerName: (serverId, name) => set((state) => ({
    servers: state.servers.map(s => s.id === serverId ? { ...s, name } : s)
  })),

  resetServerName: (serverId) => set((state) => {
    const defaultServer = DEFAULT_SERVERS.find(s => s.id === serverId);
    if (defaultServer) {
      return {
        servers: state.servers.map(s => s.id === serverId ? { ...s, name: defaultServer.name } : s)
      };
    }
    return state;
  }),
  
  importCleanedData: (cleanedLogs, cleanedCharacters) => set(() => ({
    logs: cleanedLogs,
    characters: cleanedCharacters,
    expenses: [] // Should ideally import expenses too, but keeping it simple for now
  })),

  incrementWeeklyRuns: () => set((state) => {
    if (!state.selectedServer) return state;
    const currentStats = state.serverStats[state.selectedServer] || { weeklyRuns: 0, weeklyTranscendenceRuns: 0, kinahRatio: 1.0 };
    return {
      serverStats: {
        ...state.serverStats,
        [state.selectedServer]: {
          ...currentStats,
          weeklyRuns: currentStats.weeklyRuns + 1
        }
      }
    };
  }),

  incrementWeeklyTranscendenceRuns: () => set((state) => {
    if (!state.selectedServer) return state;
    const currentStats = state.serverStats[state.selectedServer] || { weeklyRuns: 0, weeklyTranscendenceRuns: 0, kinahRatio: 1.0 };
    return {
      serverStats: {
        ...state.serverStats,
        [state.selectedServer]: {
          ...currentStats,
          weeklyTranscendenceRuns: currentStats.weeklyTranscendenceRuns + 1
        }
      }
    };
  }),

  updateServerRatio: (ratio) => set((state) => {
    if (!state.selectedServer) return state;
    const currentStats = state.serverStats[state.selectedServer] || { weeklyRuns: 0, weeklyTranscendenceRuns: 0, kinahRatio: 1.0 };
    return {
      serverStats: {
        ...state.serverStats,
        [state.selectedServer]: {
          ...currentStats,
          kinahRatio: ratio
        }
      }
    };
  }),

  updateItemPrice: (itemId, price) => set((state) => {
    if (!state.selectedServer) return state;
    const currentStats = state.serverStats[state.selectedServer] || { weeklyRuns: 0, weeklyTranscendenceRuns: 0, kinahRatio: 1.0 };
    const currentPrices = currentStats.itemPrices || {};
    return {
      serverStats: {
        ...state.serverStats,
        [state.selectedServer]: {
          ...currentStats,
          itemPrices: {
            ...currentPrices,
            [itemId]: price
          }
        }
      }
    };
  }),

  addLog: (log) => set((state) => ({ 
    logs: [{...log, serverId: state.selectedServer || 'unknown'}, ...state.logs],
    characters: state.characters.map(c => 
      c.id === log.characterId 
        ? { ...c, totalKinah: (c.totalKinah || 0) + (log.revenue || 0) } 
        : c
    )
  })),

  addExpense: (expense) => set((state) => ({
    expenses: [{...expense, serverId: state.selectedServer || 'unknown'}, ...state.expenses],
    characters: state.characters.map(c => 
      c.id === expense.characterId
        ? { ...c, totalConsumption: (c.totalConsumption || 0) + (expense.amount || 0) }
        : c
    )
  })),

  resetWeeklyStats: () => set((state) => {
    if (!state.selectedServer) return state;
    // Only reset for current server
    const currentStats = state.serverStats[state.selectedServer] || { weeklyRuns: 0, weeklyTranscendenceRuns: 0, kinahRatio: 1.0 };
    
    return { 
      serverStats: {
        ...state.serverStats,
        [state.selectedServer]: {
          ...currentStats,
          weeklyRuns: 0,
          weeklyTranscendenceRuns: 0
        }
      },
      // Filter logs? Or clear only server logs? 
      // "Reset Weekly Stats" usually implies clearing logs too if they are weekly.
      // Let's clear logs for current server only.
      logs: state.logs.filter(log => log.serverId !== state.selectedServer),
      
      // Reset characters on current server
      characters: state.characters.map(c => {
        if (c.serverId !== state.selectedServer) return c;
        return {
          ...c,
          weeklyEnergyBought: 0,
          weeklyEnergyCrafted: 0,
          weeklyAwakeningCount: 0,
          weeklyPetCount: 0,
          weeklyExpeditionCount: 0,
          weeklyTranscendenceCount: 0,
        };
      })
    };
  }),
});

import { describe, it, expect } from 'vitest';
import { RevenueCalculator } from './revenueCalculator';
import { DungeonType } from '../types';

describe('RevenueCalculator', () => {
  describe('calculateBaseRevenue', () => {
    it('should return correct revenue for Expedition', () => {
      expect(RevenueCalculator.calculateBaseRevenue(DungeonType.EXPEDITION, 1)).toBe(600_000);
      expect(RevenueCalculator.calculateBaseRevenue(DungeonType.EXPEDITION, 2)).toBe(800_000);
      expect(RevenueCalculator.calculateBaseRevenue(DungeonType.EXPEDITION, 3)).toBe(10_000_000);
    });

    it('should return correct revenue for Transcendence', () => {
      // Layer 1: 60W
      expect(RevenueCalculator.calculateBaseRevenue(DungeonType.TRANSCENDENCE, 1)).toBe(600_000);
      // Layer 2: 60W + 8W = 68W
      expect(RevenueCalculator.calculateBaseRevenue(DungeonType.TRANSCENDENCE, 2)).toBe(680_000);
      // Layer 10: 60W + 9*8W = 60 + 72 = 132W
      expect(RevenueCalculator.calculateBaseRevenue(DungeonType.TRANSCENDENCE, 10)).toBe(1_320_000);
    });

    it('should return 0 for other types', () => {
      expect(RevenueCalculator.calculateBaseRevenue(DungeonType.AWAKENING, 1)).toBe(0);
      expect(RevenueCalculator.calculateBaseRevenue(DungeonType.PET, 1)).toBe(0);
    });
  });

  describe('getDiminishingMultiplier', () => {
    it('should be 1.0 for N <= 54', () => {
      expect(RevenueCalculator.getDiminishingMultiplier(1)).toBe(1.0);
      expect(RevenueCalculator.getDiminishingMultiplier(54)).toBe(1.0);
    });

    it('should be 0.8 for 54 < N <= 62', () => {
      expect(RevenueCalculator.getDiminishingMultiplier(55)).toBe(0.8);
      expect(RevenueCalculator.getDiminishingMultiplier(62)).toBe(0.8);
    });

    it('should be 0.6 for N > 62', () => {
      expect(RevenueCalculator.getDiminishingMultiplier(63)).toBe(0.6);
      expect(RevenueCalculator.getDiminishingMultiplier(100)).toBe(0.6);
    });
  });

  describe('calculateFinalRevenue', () => {
    it('should apply multiplier correctly', () => {
      const type = DungeonType.EXPEDITION;
      const star = 1; // 600,000
      
      // Run 50 (1.0)
      expect(RevenueCalculator.calculateFinalRevenue(type, star, 50)).toBe(600_000);
      
      // Run 55 (0.8) -> 480,000
      expect(RevenueCalculator.calculateFinalRevenue(type, star, 55)).toBe(480_000);
      
      // Run 63 (0.6) -> 360,000
      expect(RevenueCalculator.calculateFinalRevenue(type, star, 63)).toBe(360_000);
    });
  });
});

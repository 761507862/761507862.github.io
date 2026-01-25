import { DungeonType } from '../types';
import { DIMINISHING_RETURNS } from '@/config/gameConstants';

export class RevenueCalculator {
  private static readonly EXPEDITION_REVENUE = {
    1: 600_000,
    2: 800_000,
    3: 1_000_000,
  };

  private static readonly TRANSCENDENCE_BASE = 600_000;
  private static readonly TRANSCENDENCE_INCREMENT = 80_000;

  /**
   * Calculates the base revenue for a dungeon run before diminishing returns.
   */
  static calculateBaseRevenue(type: DungeonType, difficulty: number): number {
    if (type === DungeonType.EXPEDITION) {
      return this.EXPEDITION_REVENUE[difficulty as 1 | 2 | 3] || 0;
    }

    if (type === DungeonType.TRANSCENDENCE) {
      if (difficulty < 1) return 0;
      return this.TRANSCENDENCE_BASE + (difficulty - 1) * this.TRANSCENDENCE_INCREMENT;
    }

    return 0; // Other types have no direct Kinah revenue
  }

  /**
   * Calculates the diminishing return multiplier based on total weekly runs.
   */
  static getDiminishingMultiplier(currentTotalRuns: number): number {
    if (currentTotalRuns <= DIMINISHING_RETURNS.TIER_1_LIMIT) return DIMINISHING_RETURNS.TIER_1_FACTOR;
    if (currentTotalRuns <= DIMINISHING_RETURNS.TIER_2_LIMIT) return DIMINISHING_RETURNS.TIER_2_FACTOR;
    return DIMINISHING_RETURNS.TIER_3_FACTOR;
  }

  /**
   * Calculates final revenue.
   * @param type Dungeon Type
   * @param difficulty Star or Layer
   * @param currentTotalRuns Total runs including this one
   */
  static calculateFinalRevenue(type: DungeonType, difficulty: number, currentTotalRuns: number): number {
    const base = this.calculateBaseRevenue(type, difficulty);
    const multiplier = this.getDiminishingMultiplier(currentTotalRuns);
    return Math.floor(base * multiplier);
  }
}

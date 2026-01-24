import { DungeonType } from '../types';

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
   * N <= 54: 1.0
   * 54 < N <= 62: 0.8
   * N > 62: 0.6
   */
  static getDiminishingMultiplier(currentTotalRuns: number): number {
    // Note: The rule says "If N <= 54". 
    // Usually this check applies to the *current* run being added. 
    // If I have 54 runs, the 55th run (currentTotalRuns = 55) might be subject to the new tier?
    // User says: "If N <= 54: Actual = Base".
    // "If 54 < N <= 62: Actual = Base * 0.8".
    // So if N (current total runs completed including this one? or before this one?)
    // Usually in games, it's based on the count *before* entering, or the count *of* this run.
    // "current account weekly total runs (N)".
    // Let's assume N is the count *after* completion? Or *current* state when checking?
    // If I have completed 54 runs. My 55th run. N becomes 55.
    // If N=55, it falls into 54 < N <= 62. So 0.8.
    // So the 55th run gets 0.8.
    // This implies N is the count *including the current run*.
    
    if (currentTotalRuns <= 54) return 1.0;
    if (currentTotalRuns <= 62) return 0.8;
    return 0.6;
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

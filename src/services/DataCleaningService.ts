import { DungeonLog, Character } from '@/store/types';

export interface CleaningReport {
  timestamp: number;
  totalLogsScanned: number;
  totalCharactersScanned: number;
  removedDuplicates: number;
  fixedEnergyValues: number;
  fixedTimestamps: number;
  orphanedLogsRemoved: number;
  status: 'success' | 'failed';
  details: string[];
}

export class DataCleaningService {
  static cleanData(
    logs: DungeonLog[], 
    characters: Character[], 
    config: { removeDuplicates: boolean; fixEnergy: boolean } = { removeDuplicates: true, fixEnergy: true }
  ): { cleanedLogs: DungeonLog[]; cleanedCharacters: Character[]; report: CleaningReport } {
    const report: CleaningReport = {
      timestamp: Date.now(),
      totalLogsScanned: logs.length,
      totalCharactersScanned: characters.length,
      removedDuplicates: 0,
      fixedEnergyValues: 0,
      fixedTimestamps: 0,
      orphanedLogsRemoved: 0,
      status: 'success',
      details: [],
    };

    let cleanedLogs = [...logs];
    let cleanedCharacters = [...characters];

    // 1. Remove Duplicate Logs
    if (config.removeDuplicates) {
      const seen = new Set();
      const uniqueLogs: DungeonLog[] = [];
      
      for (const log of cleanedLogs) {
        // Create a unique signature based on core fields
        // Signature: serverId-characterId-dungeonType-timestamp(rounded to minute)-revenue
        // Rounding timestamp to minute helps catch double-submissions
        const timeKey = Math.floor(log.timestamp / 60000); 
        const signature = `${log.serverId}-${log.characterId}-${log.dungeonType}-${timeKey}-${log.revenue}`;
        
        if (seen.has(signature)) {
          report.removedDuplicates++;
        } else {
          seen.add(signature);
          uniqueLogs.push(log);
        }
      }
      cleanedLogs = uniqueLogs;
    }

    // 2. Fix Character Energy Values (Validation)
    if (config.fixEnergy) {
      cleanedCharacters = cleanedCharacters.map(char => {
        let modified = false;
        let newOd = char.odEnergy;
        let newOverflow = char.overflowEnergy;

        if (isNaN(newOd) || newOd < 0) {
          newOd = 0;
          modified = true;
        } else if (newOd > 800) {
          newOd = 800;
          modified = true;
        }

        if (isNaN(newOverflow) || newOverflow < 0) {
          newOverflow = 0;
          modified = true;
        } else if (newOverflow > 800) {
          newOverflow = 800;
          modified = true;
        }

        if (modified) {
          report.fixedEnergyValues++;
          return { ...char, odEnergy: newOd, overflowEnergy: newOverflow };
        }
        return char;
      });
    }

    // 3. Remove Orphaned Logs (Logs referencing non-existent characters)
    const characterIds = new Set(cleanedCharacters.map(c => c.id));
    const validLogs = cleanedLogs.filter(log => {
      if (!characterIds.has(log.characterId)) {
        report.orphanedLogsRemoved++;
        return false;
      }
      return true;
    });
    cleanedLogs = validLogs;

    // 4. Sort Logs by Timestamp (Standardization)
    cleanedLogs.sort((a, b) => b.timestamp - a.timestamp);

    report.details.push(`Processed ${logs.length} logs and ${characters.length} characters.`);
    if (report.removedDuplicates > 0) report.details.push(`Removed ${report.removedDuplicates} duplicate logs.`);
    if (report.fixedEnergyValues > 0) report.details.push(`Fixed ${report.fixedEnergyValues} invalid energy values.`);
    if (report.orphanedLogsRemoved > 0) report.details.push(`Removed ${report.orphanedLogsRemoved} orphaned logs.`);

    return { cleanedLogs, cleanedCharacters, report };
  }
}

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/useGameStore';
import { DungeonType } from '../types';
import { RevenueCalculator } from '../services/revenueCalculator';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input'; // For layer input
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, Coins, Zap, Map, CheckCircle2 } from 'lucide-react';

interface RecordDungeonModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string | null;
}

export const RecordDungeonModal: React.FC<RecordDungeonModalProps> = ({ isOpen, onClose, characterId }) => {
  const { t } = useTranslation();
  const { selectedServer, serverStats, incrementWeeklyRuns, incrementWeeklyTranscendenceRuns, addLog, incrementCharacterDungeonCount, characters, consumeCharacterEnergy } = useGameStore();
  
  const currentStats = (selectedServer && serverStats[selectedServer]) || { weeklyRuns: 0, weeklyTranscendenceRuns: 0, kinahRatio: 1.0 };
  const { weeklyRuns, weeklyTranscendenceRuns } = currentStats;

  const [selectedType, setSelectedType] = useState<DungeonType>(DungeonType.EXPEDITION);
  const [difficulty, setDifficulty] = useState<number>(1); // Star 1-3
  const [layer, setLayer] = useState<number>(1); // Layer 1-10
  
  const character = characters.find(c => c.id === characterId);
  const odEnergy = character?.odEnergy || 0;
  
  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedType(DungeonType.EXPEDITION);
      setDifficulty(1);
      setLayer(1);
    }
  }, [isOpen]);

  const isRevenueDungeon = selectedType === DungeonType.EXPEDITION || selectedType === DungeonType.TRANSCENDENCE;

  // Calculate projected revenue
  const projectedBase = isRevenueDungeon 
    ? RevenueCalculator.calculateBaseRevenue(selectedType, selectedType === DungeonType.EXPEDITION ? difficulty : layer)
    : 0;
    
  // Use correct weekly count for diminishing returns based on type
  const weeklyCount = selectedType === DungeonType.TRANSCENDENCE ? weeklyTranscendenceRuns : weeklyRuns;
  const multiplier = RevenueCalculator.getDiminishingMultiplier(weeklyCount + 1); // +1 because this will be the next run
  
  const projectedRevenue = Math.floor(projectedBase * multiplier);
  
  const handleRecord = () => {
    if (!characterId) return;

    // 1. Deduct Energy (if applicable) & Increment Account Weekly Runs
    if (isRevenueDungeon) {
      consumeCharacterEnergy(characterId, 80);
      if (selectedType === DungeonType.TRANSCENDENCE) {
        incrementWeeklyTranscendenceRuns();
      } else {
        incrementWeeklyRuns();
      }
    }

    // 2. Increment Character Count
    incrementCharacterDungeonCount(characterId, selectedType);

    // 3. Add Log (if revenue)
    if (isRevenueDungeon) {
      addLog({
        id: crypto.randomUUID(),
        characterId,
        serverId: selectedServer || 'unknown',
        dungeonType: selectedType,
        difficulty: selectedType === DungeonType.EXPEDITION ? difficulty : layer,
        revenue: projectedRevenue,
        timestamp: Date.now(),
        isDiminished: multiplier < 1.0,
        diminishingFactor: multiplier,
      });
    }

    onClose();
  };

  const canAfford = !isRevenueDungeon || odEnergy >= 80;

  const dungeonTypes = [
    { type: DungeonType.EXPEDITION, label: t('dungeon.types.EXPEDITION'), icon: Map },
    { type: DungeonType.TRANSCENDENCE, label: t('dungeon.types.TRANSCENDENCE'), icon: Map },
    { type: DungeonType.AWAKENING, label: t('dungeon.types.AWAKENING'), icon: Zap },
    { type: DungeonType.PET, label: t('dungeon.types.PET'), icon: Zap },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('dungeon.recordModal.title', { name: character?.name || 'Unknown' })}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>{t('dungeon.recordModal.cancel')}</Button>
          <Button onClick={handleRecord} disabled={!canAfford}>
            {t('dungeon.recordModal.confirm')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 py-2">
        {/* Type Selection - Tiles */}
        <div className="space-y-2">
           <label className="text-sm font-medium">{t('dungeon.recordModal.type')}</label>
           <div className="grid grid-cols-2 gap-2">
             {dungeonTypes.map((dt) => (
               <div
                 key={dt.type}
                 onClick={() => setSelectedType(dt.type)}
                 className={cn(
                   "cursor-pointer rounded-lg border p-3 flex items-center justify-between transition-all hover:border-primary/50",
                   selectedType === dt.type ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
                 )}
               >
                 <div className="flex items-center gap-2">
                   <dt.icon className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm font-medium">{dt.label}</span>
                 </div>
                 {selectedType === dt.type && <CheckCircle2 className="h-4 w-4 text-primary" />}
               </div>
             ))}
           </div>
        </div>

        {selectedType === DungeonType.EXPEDITION && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('dungeon.recordModal.difficulty')}</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(star => (
                <Button 
                  key={star} 
                  variant={difficulty === star ? 'default' : 'outline'} 
                  onClick={() => setDifficulty(star)}
                  className="flex-1"
                >
                  {t('dungeon.recordModal.star', { count: star })}
                </Button>
              ))}
            </div>
          </div>
        )}

        {selectedType === DungeonType.TRANSCENDENCE && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('dungeon.recordModal.layer')}</label>
            <Input 
              type="number" 
              min={1} 
              max={10} 
              value={layer} 
              onChange={(e) => setLayer(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))} 
            />
          </div>
        )}

        {/* Preview Section */}
        {isRevenueDungeon ? (
          <div className="bg-secondary/20 p-4 rounded-lg space-y-3 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center">
                <Zap className="h-4 w-4 mr-1 text-yellow-500" /> {t('dungeon.recordModal.energyCost')}
              </span>
              <span className={cn("font-bold", !canAfford && "text-destructive")}>
                80
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center">
                <Coins className="h-4 w-4 mr-1 text-yellow-500" /> {t('dungeon.recordModal.revenue')}
              </span>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {projectedRevenue.toLocaleString()} Kinah
                </div>
                {multiplier < 1.0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {t('dungeon.recordModal.diminished', { factor: multiplier })}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
           <div className="bg-secondary/20 p-4 rounded-lg border border-border flex items-center text-sm text-muted-foreground">
             <AlertCircle className="h-4 w-4 mr-2" />
             {t('dungeon.recordModal.noEnergy')}
           </div>
        )}

        {!canAfford && (
          <div className="text-destructive text-sm font-medium text-center">
            {t('dungeon.recordModal.notEnoughEnergy')}
          </div>
        )}
      </div>
    </Dialog>
  );
};

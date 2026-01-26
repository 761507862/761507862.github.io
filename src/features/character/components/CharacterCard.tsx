import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Character } from '@/store/types';
import { useGameStore } from '@/store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Trash2, Shield, Sword, Zap, Check } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { motion } from 'framer-motion';
import { formatKinah } from '@/lib/utils';
import NumberTicker from '@/shared/components/ui/number-ticker';
import { getTodayDateString, isTodayInGameZone } from '@/lib/dateUtils';
import { ENERGY_LIMITS, WEEKLY_LIMITS, CRAFTING_COSTS, ENERGY_BUY_AMOUNT } from '@/config/gameConstants';

interface CharacterCardProps {
  character: Character;
  onRecordDungeon: (characterId: string) => void;
}

const StatItem = ({ 
  label, 
  value, 
  colorClass, 
  animate = false 
}: { 
  label: string; 
  value: number; 
  colorClass: string;
  animate?: boolean;
}) => (
  <div 
    className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 group/stat transition-colors"
  >
    <span className="text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1">
      <span className={`font-mono font-bold ${colorClass}`}>
        {animate ? (
          <NumberTicker value={value} formatter={formatKinah} className={colorClass} maxStep={10000} />
        ) : (
          formatKinah(value)
        )}
      </span>
    </div>
  </div>
);

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onRecordDungeon }) => {
  const { t } = useTranslation();
  const { updateCharacter, removeCharacter, craftEnergy, buyEnergy, selectedServer, serverStats, logs, expenses } = useGameStore();
  const [isEditingGear, setIsEditingGear] = useState(false);
  const [tempGearScore, setTempGearScore] = useState(character.gearScore || 0);
  const [tempOdEnergy, setTempOdEnergy] = useState(character.odEnergy || 0);
  const [tempOverflowEnergy, setTempOverflowEnergy] = useState(character.overflowEnergy || 0);

  // Sync local state when props change
  useEffect(() => {
    setTempOdEnergy(character.odEnergy || 0);
    setTempOverflowEnergy(character.overflowEnergy || 0);
    setTempGearScore(character.gearScore || 0);
  }, [character.odEnergy, character.overflowEnergy, character.gearScore]);

  // Use memoized date string for today
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Optimized filtering for logs and expenses
  const todayRevenue = useMemo(() => {
    return logs
      .filter(l => 
        l.characterId === character.id && 
        l.serverId === character.serverId &&
        isTodayInGameZone(l.timestamp)
      )
      .reduce((sum, l) => sum + (l.revenue || 0), 0);
  }, [logs, character.id, character.serverId, todayStr]);

  const todayConsumption = useMemo(() => {
    return expenses
      .filter(e => 
        e.characterId === character.id && 
        e.serverId === character.serverId &&
        isTodayInGameZone(e.timestamp)
      )
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses, character.id, character.serverId, todayStr]);
  
  const handleBuyEnergy = () => {
    buyEnergy(character.id, ENERGY_BUY_AMOUNT);
  };

  const handleCraftEnergy = () => {
    const prices = selectedServer && serverStats[selectedServer]?.itemPrices 
      ? serverStats[selectedServer].itemPrices 
      : {};
    
    const { aether, high_purity_aether, pure_aether } = prices;

    if (
        aether === undefined || 
        high_purity_aether === undefined || 
        pure_aether === undefined
    ) {
        alert(t('items.missingPrices'));
        return;
    }

    const cost = (
      aether * CRAFTING_COSTS.AETHER_MULTIPLIER + 
      high_purity_aether * CRAFTING_COSTS.HIGH_PURITY_AETHER_MULTIPLIER + 
      pure_aether * CRAFTING_COSTS.PURE_AETHER_MULTIPLIER + 
      CRAFTING_COSTS.ENERGY_CRAFT_BASE_FEE
    ) * CRAFTING_COSTS.CRAFT_BATCH_SIZE;
    
    craftEnergy(character.id, cost);
  };

  const handleGearScoreBlur = () => {
    setIsEditingGear(false);
    updateCharacter(character.id, { gearScore: Number(tempGearScore) });
  };

  const handleOdEnergyBlur = () => {
    const val = Math.min(ENERGY_LIMITS.OD_ENERGY_MAX, Math.max(0, Number(tempOdEnergy)));
    setTempOdEnergy(val);
    updateCharacter(character.id, { odEnergy: val });
  };

  const handleOverflowEnergyBlur = () => {
    const val = Math.min(ENERGY_LIMITS.OVERFLOW_ENERGY_MAX, Math.max(0, Number(tempOverflowEnergy)));
    setTempOverflowEnergy(val);
    updateCharacter(character.id, { overflowEnergy: val });
  };

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
      <Card className="relative overflow-hidden group transition-all duration-300 bg-white dark:bg-slate-900 border-l-4 border-l-primary border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 hover:shadow-lg dark:hover:shadow-primary/5 hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeCharacter(character.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-transparent to-transparent dark:from-primary/10 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20 text-primary-foreground">
               <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{character.name}</CardTitle>
                  <CardDescription className="text-xs font-medium text-primary/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                    {t(`classes.${character.class}`)}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">{t('character.card.gearScore')}</span>
                  {isEditingGear ? (
                    <Input 
                      type="number" 
                      className="h-6 w-20 text-xs text-right" 
                      value={tempGearScore} 
                      onChange={(e) => setTempGearScore(Number(e.target.value))}
                      onBlur={handleGearScoreBlur}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="text-lg font-black font-mono text-slate-700 dark:text-slate-300 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => { setIsEditingGear(true); setTempGearScore(character.gearScore || 0); }}
                    >
                      {character.gearScore || 0}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5 pt-5 text-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          {/* Od Energy Section */}
          <div className="space-y-2">
             <div className="flex justify-between items-center text-xs font-medium">
                <span className="flex items-center text-primary"><Zap className="w-3 h-3 mr-1" /> {t('character.card.odEnergy')}</span>
                <div className="flex items-center gap-1">
                   <Input 
                      type="number" 
                      className="h-6 w-16 text-xs text-right [&::-webkit-inner-spin-button]:appearance-none" 
                      value={tempOdEnergy}
                      onChange={(e) => setTempOdEnergy(Number(e.target.value))}
                      onBlur={handleOdEnergyBlur}
                   />
                   <span className="text-[10px] text-muted-foreground ml-1">Max {ENERGY_LIMITS.OD_ENERGY_MAX}</span>
                </div>
             </div>
             <Progress value={Math.min(100, ((character.odEnergy || 0) / ENERGY_LIMITS.OD_ENERGY_MAX) * 100)} className="h-2" />
          </div>

          {/* Overflow Energy Section */}
          <div className="space-y-2">
             <div className="flex justify-between items-center text-xs font-medium">
                <span className="flex items-center text-orange-500"><Zap className="w-3 h-3 mr-1" /> {t('character.card.overflowEnergy')}</span>
                <div className="flex items-center gap-1">
                   <Input 
                      type="number" 
                      className="h-6 w-16 text-xs text-right [&::-webkit-inner-spin-button]:appearance-none" 
                      value={tempOverflowEnergy}
                      onChange={(e) => setTempOverflowEnergy(Number(e.target.value))}
                      onBlur={handleOverflowEnergyBlur}
                   />
                   <span className="text-[10px] text-muted-foreground ml-1">Max {ENERGY_LIMITS.OVERFLOW_ENERGY_MAX}</span>
                </div>
             </div>
             <Progress value={Math.min(100, ((character.overflowEnergy || 0) / ENERGY_LIMITS.OVERFLOW_ENERGY_MAX) * 100)} className="h-2 [&>div]:bg-orange-500" />
          </div>

          {/* Total Kinah Section */}
          <div className="grid grid-cols-1 gap-2">
            {/* Revenue Group */}
            <div className="space-y-1 bg-green-500/5 p-2 rounded border border-green-500/10">
               <StatItem 
                 label={t('character.card.totalKinah')} 
                 value={character.totalKinah ?? 0} 
                 colorClass="text-green-600 dark:text-green-500"
                 animate={true}
               />
               <StatItem 
                 label={t('character.card.todayRevenue')} 
                 value={todayRevenue} 
                 colorClass="text-green-600/80 dark:text-green-500/80"
                 animate={true}
               />
            </div>

            {/* Consumption Group */}
            <div className="space-y-1 bg-red-500/5 p-2 rounded border border-red-500/10">
               <StatItem 
                 label={t('character.card.totalConsumption')} 
                 value={character.totalConsumption ?? 0} 
                 colorClass="text-red-600 dark:text-red-500"
                 animate={true}
               />
               <StatItem 
                 label={t('character.card.todayConsumption')} 
                 value={todayConsumption} 
                 colorClass="text-red-600/80 dark:text-red-500/80"
                 animate={true}
               />
            </div>
          </div>

          {/* Energy Actions */}
          <div className="space-y-3 pt-2 border-t border-border">
            {/* Bought */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">{t('character.card.energyBought')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{character.weeklyEnergyBought}/{WEEKLY_LIMITS.ENERGY_BOUGHT}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 text-xs" 
                    onClick={handleBuyEnergy} 
                    disabled={character.weeklyEnergyBought >= WEEKLY_LIMITS.ENERGY_BOUGHT}
                  >
                    <Check className="h-3 w-3 mr-1" /> {t('character.card.complete')}
                  </Button>
                </div>
              </div>
              <Progress value={(character.weeklyEnergyBought / WEEKLY_LIMITS.ENERGY_BOUGHT) * 100} className="h-1" />
            </div>

            {/* Crafted */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">{t('character.card.energyCrafted')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{character.weeklyEnergyCrafted}/{WEEKLY_LIMITS.ENERGY_CRAFTED}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 text-xs" 
                    onClick={handleCraftEnergy} 
                    disabled={character.weeklyEnergyCrafted >= WEEKLY_LIMITS.ENERGY_CRAFTED}
                  >
                    <Check className="h-3 w-3 mr-1" /> {t('character.card.complete')}
                  </Button>
                </div>
              </div>
              <Progress value={(character.weeklyEnergyCrafted / WEEKLY_LIMITS.ENERGY_CRAFTED) * 100} className="h-1" />
            </div>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-secondary/50 p-2 rounded flex flex-col items-center">
              <span className="text-muted-foreground mb-1">{t('character.card.expedition')}</span>
              <Badge variant="outline">
                {character.weeklyExpeditionCount || 0}/{WEEKLY_LIMITS.EXPEDITION}
              </Badge>
            </div>
            <div className="bg-secondary/50 p-2 rounded flex flex-col items-center">
              <span className="text-muted-foreground mb-1">{t('character.card.transcendence')}</span>
              <Badge variant="outline">
                {character.weeklyTranscendenceCount || 0}/{WEEKLY_LIMITS.TRANSCENDENCE}
              </Badge>
            </div>
            <div className="bg-secondary/50 p-2 rounded flex flex-col items-center">
              <span className="text-muted-foreground mb-1">{t('character.card.awakening')}</span>
              <Badge variant={character.weeklyAwakeningCount >= WEEKLY_LIMITS.AWAKENING ? "secondary" : "outline"}>
                {character.weeklyAwakeningCount}/{WEEKLY_LIMITS.AWAKENING}
              </Badge>
            </div>
            <div className="bg-secondary/50 p-2 rounded flex flex-col items-center">
              <span className="text-muted-foreground mb-1">{t('character.card.pet')}</span>
              <Badge variant={character.weeklyPetCount >= WEEKLY_LIMITS.PET ? "secondary" : "outline"}>
                {character.weeklyPetCount}/{WEEKLY_LIMITS.PET}
              </Badge>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={() => onRecordDungeon(character.id)}>
            <Sword className="mr-2 h-4 w-4" /> {t('character.card.recordDungeon')}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

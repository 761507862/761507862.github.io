import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Character } from '@/store/types';
import { useGameStore } from '@/store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Trash2, Shield, Sword, Zap, Coins, Check } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { motion } from 'framer-motion';

interface CharacterCardProps {
  character: Character;
  onRecordDungeon: (characterId: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onRecordDungeon }) => {
  const { t } = useTranslation();
  const { updateCharacter, removeCharacter, craftEnergy, buyEnergy } = useGameStore();
  const [isEditingGear, setIsEditingGear] = useState(false);
  const [tempGearScore, setTempGearScore] = useState(character.gearScore || 0);
  const [tempOdEnergy, setTempOdEnergy] = useState(character.odEnergy || 0);
  const [tempOverflowEnergy, setTempOverflowEnergy] = useState(character.overflowEnergy || 0);

  // Sync local state when props change (e.g. from store updates or reset)
  useEffect(() => {
    setTempOdEnergy(character.odEnergy || 0);
    setTempOverflowEnergy(character.overflowEnergy || 0);
    setTempGearScore(character.gearScore || 0);
  }, [character.odEnergy, character.overflowEnergy, character.gearScore]);

  // Format Kinah with W unit
  const formatKinah = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(2).replace(/\.00$/, '')}W`;
    }
    return amount.toLocaleString();
  };

  const handleGearScoreBlur = () => {
    setIsEditingGear(false);
    updateCharacter(character.id, { gearScore: Number(tempGearScore) });
  };

  const handleOdEnergyBlur = () => {
    // Correct to valid range 0-800
    const val = Math.min(800, Math.max(0, Number(tempOdEnergy)));
    setTempOdEnergy(val);
    updateCharacter(character.id, { odEnergy: val });
  };

  const handleOverflowEnergyBlur = () => {
    // Correct to valid range 0-800
    const val = Math.min(800, Math.max(0, Number(tempOverflowEnergy)));
    setTempOverflowEnergy(val);
    updateCharacter(character.id, { overflowEnergy: val });
  };

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
      <Card className="relative overflow-hidden group hover:border-primary/50 transition-colors light:bg-white/70 light:backdrop-blur-sm dark:bg-card">
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeCharacter(character.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
               <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{character.name}</CardTitle>
                  <CardDescription>{t(`classes.${character.class}`)}</CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground mb-1">{t('character.card.gearScore')}</span>
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
                      className="text-sm font-bold cursor-pointer hover:text-primary transition-colors"
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
        
        <CardContent className="space-y-4 text-sm">
          {/* Od Energy Section - Input */}
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
                   <span className="text-[10px] text-muted-foreground ml-1">Max 800</span>
                </div>
             </div>
             <Progress value={Math.min(100, ((character.odEnergy || 0) / 800) * 100)} className="h-2" />
          </div>

          {/* Overflow Energy Section - Input */}
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
                   <span className="text-[10px] text-muted-foreground ml-1">Max 800</span>
                </div>
             </div>
             <Progress value={Math.min(100, ((character.overflowEnergy || 0) / 800) * 100)} className="h-2 bg-orange-100" indicatorClassName="bg-orange-500" />
          </div>

          {/* Total Kinah Section */}
          <div className="space-y-2 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
             <div className="flex justify-between items-center">
                <span className="flex items-center text-xs text-yellow-600 font-medium"><Coins className="w-3 h-3 mr-1" /> {t('character.card.totalKinah')}</span>
                <span className="font-mono font-bold text-yellow-600">{formatKinah(character.totalKinah || 0)}</span>
             </div>
          </div>

          {/* Energy Actions */}
          <div className="space-y-3 pt-2 border-t border-border">
            {/* Bought */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">{t('character.card.energyBought')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{character.weeklyEnergyBought}/7</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 text-xs" 
                    onClick={() => buyEnergy(character.id)} 
                    disabled={character.weeklyEnergyBought >= 7}
                  >
                    <Check className="h-3 w-3 mr-1" /> {t('character.card.complete')}
                  </Button>
                </div>
              </div>
              <Progress value={(character.weeklyEnergyBought / 7) * 100} className="h-1" />
            </div>

            {/* Crafted */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">{t('character.card.energyCrafted')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{character.weeklyEnergyCrafted}/7</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 text-xs" 
                    onClick={() => craftEnergy(character.id)} 
                    disabled={character.weeklyEnergyCrafted >= 7}
                  >
                    <Check className="h-3 w-3 mr-1" /> {t('character.card.complete')}
                  </Button>
                </div>
              </div>
              <Progress value={(character.weeklyEnergyCrafted / 7) * 100} className="h-1" />
            </div>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-secondary/50 p-2 rounded flex flex-col items-center">
              <span className="text-muted-foreground mb-1">{t('character.card.expedition')}</span>
              <Badge variant="outline">
                {character.weeklyExpeditionCount || 0}/35
              </Badge>
            </div>
            <div className="bg-secondary/50 p-2 rounded flex flex-col items-center">
              <span className="text-muted-foreground mb-1">{t('character.card.transcendence')}</span>
              <Badge variant="outline">
                {character.weeklyTranscendenceCount || 0}/28
              </Badge>
            </div>
            <div className="bg-secondary/50 p-2 rounded flex flex-col items-center">
              <span className="text-muted-foreground mb-1">{t('character.card.awakening')}</span>
              <Badge variant={character.weeklyAwakeningCount >= 3 ? "secondary" : "outline"}>
                {character.weeklyAwakeningCount}/3
              </Badge>
            </div>
            <div className="bg-secondary/50 p-2 rounded flex flex-col items-center">
              <span className="text-muted-foreground mb-1">{t('character.card.pet')}</span>
              <Badge variant={character.weeklyPetCount >= 7 ? "secondary" : "outline"}>
                {character.weeklyPetCount}/7
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

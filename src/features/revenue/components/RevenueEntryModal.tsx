import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Shield, ArrowLeft, Coins, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { DungeonType } from '@/features/dungeon/types';

interface RevenueEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevenueEntryModal = ({ isOpen, onClose }: RevenueEntryModalProps) => {
  const { t } = useTranslation();
  const { characters, selectedServer, addLog, addExpense } = useGameStore();
  
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [revenueInput, setRevenueInput] = useState<string>('');
  const [consumptionInput, setConsumptionInput] = useState<string>('');

  const filteredCharacters = characters.filter(c => c.serverId === selectedServer && !c.isHidden);
  const selectedCharacter = characters.find(c => c.id === selectedCharId);

  const handleClose = () => {
    setSelectedCharId(null);
    setRevenueInput('');
    setConsumptionInput('');
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedCharId || !selectedCharacter) return;

    // Treat input as "Wan" (10000 units) if user inputs just number.
    // e.g. input "100" -> 1,000,000
    // e.g. input "1.5" -> 15,000 (if float is allowed? usually games use int for Kinah, let's assume float input * 10000 -> int)
    
    const parseWan = (input: string) => {
        if (!input) return 0;
        const val = parseFloat(input);
        if (isNaN(val)) return 0;
        return Math.round(val * 10000);
    };

    const revenue = parseWan(revenueInput);
    const consumption = parseWan(consumptionInput);

    if (revenue !== 0) {
      addLog({
        id: crypto.randomUUID(),
        characterId: selectedCharacter.id,
        serverId: selectedCharacter.serverId,
        dungeonType: DungeonType.MANUAL_ADJUSTMENT,
        difficulty: 0,
        revenue: revenue,
        timestamp: Date.now(),
        isDiminished: false,
        diminishingFactor: 1,
      });
    }

    if (consumption !== 0) {
      addExpense({
        id: crypto.randomUUID(),
        characterId: selectedCharacter.id,
        serverId: selectedCharacter.serverId,
        amount: consumption,
        timestamp: Date.now(),
        type: 'MANUAL_ADJUSTMENT',
      });
    }

    setRevenueInput('');
    setConsumptionInput('');
    setSelectedCharId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('revenue.entry.title')}</DialogTitle>
          <DialogDescription>
            {selectedCharacter 
              ? t('revenue.entry.subtitle_char', { name: selectedCharacter.name })
              : t('revenue.entry.subtitle_select')}
          </DialogDescription>
        </DialogHeader>

        {selectedCharId && selectedCharacter ? (
          <div className="space-y-6 py-4">
             <Button variant="ghost" onClick={() => setSelectedCharId(null)} className="mb-2 -ml-2 h-8 text-xs text-muted-foreground">
              <ArrowLeft className="mr-2 h-3 w-3" /> {t('common.back')}
            </Button>

            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-md">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-lg">{selectedCharacter.name}</div>
                <div className="text-sm text-muted-foreground">{t(`classes.${selectedCharacter.class}`)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                <label className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Coins className="h-4 w-4" />
                  {t('character.card.todayRevenue')} ({t('common.unit.wan')})
                </label>
                <Input
                  type="number"
                  min="0"
                  value={revenueInput}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < 0) return;
                    setRevenueInput(e.target.value);
                  }}
                  className="text-lg font-mono bg-white/50 dark:bg-black/20 [&::-webkit-inner-spin-button]:appearance-none"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground opacity-80">{t('revenue.entry.tip')}</p>
              </div>

              <div className="space-y-3 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                <label className="text-sm font-medium flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Activity className="h-4 w-4" />
                  {t('character.card.todayConsumption')} ({t('common.unit.wan')})
                </label>
                <Input
                  type="number"
                  min="0"
                  value={consumptionInput}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < 0) return;
                    setConsumptionInput(e.target.value);
                  }}
                  className="text-lg font-mono bg-white/50 dark:bg-black/20 [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 p-6 pt-0">
              <Button variant="outline" onClick={() => setSelectedCharId(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit} className="min-w-[100px]">
                {t('common.save')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-4">
            {filteredCharacters.map((char) => (
              <div 
                key={char.id} 
                className="cursor-pointer group relative overflow-hidden rounded-lg border border-border bg-card p-4 hover:shadow-md transition-all hover:border-primary/50"
                onClick={() => setSelectedCharId(char.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{char.name}</div>
                    <div className="text-xs text-muted-foreground">{t(`classes.${char.class}`)}</div>
                  </div>
                </div>
              </div>
            ))}
            {filteredCharacters.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {t('character.noCharacters')}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

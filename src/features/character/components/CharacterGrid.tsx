import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/useGameStore';
import { CharacterCard } from './CharacterCard';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { motion } from 'framer-motion';

interface CharacterGridProps {
  onRecordDungeon: (characterId: string) => void;
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({ onRecordDungeon }) => {
  const { t } = useTranslation();
  const { characters, addCharacter, selectedServer } = useGameStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharClass, setNewCharClass] = useState('Templar');
  const [newCharGearScore, setNewCharGearScore] = useState<number>(0);

  const serverCharacters = characters.filter(c => c.serverId === selectedServer);

  const handleAddCharacter = () => {
    if (newCharName.trim()) {
      addCharacter({ 
        name: newCharName, 
        class: newCharClass, 
        gearScore: newCharGearScore,
        odEnergy: 800,
        overflowEnergy: 0,
        totalKinah: 0,
        totalConsumption: 0,
        weeklyEnergyBought: 0,
        weeklyEnergyCrafted: 0,
        weeklyExpeditionCount: 0,
        weeklyTranscendenceCount: 0,
        weeklyAwakeningCount: 0,
        weeklyPetCount: 0
      });
      setNewCharName('');
      setNewCharGearScore(0);
      setIsAddModalOpen(false);
    }
  };

  const classes = [
    'Templar', 'Gladiator', 'Assassin', 'Ranger', 'Sorcerer', 'Spiritmaster', 'Cleric', 'Chanter', 'Aethertech', 'Gunner', 'Bard', 'Painter'
  ];

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {serverCharacters.map((char) => (
          <CharacterCard key={char.id} character={char} onRecordDungeon={onRecordDungeon} />
        ))}
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[420px] flex items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors bg-card/50">
          <Button variant="ghost" className="h-full w-full flex flex-col gap-4" onClick={() => setIsAddModalOpen(true)}>
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <span className="text-lg font-medium text-muted-foreground">{t('character.add')}</span>
          </Button>
        </motion.div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('character.addModal.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('character.addModal.name')}</label>
              <Input 
                placeholder={t('character.addModal.namePlaceholder')} 
                value={newCharName} 
                onChange={(e) => setNewCharName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('character.addModal.gearScore')}</label>
              <Input 
                type="number"
                placeholder="0" 
                value={newCharGearScore} 
                onChange={(e) => setNewCharGearScore(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('character.addModal.class')}</label>
              <Select value={newCharClass} onChange={(e) => setNewCharClass(e.target.value)}>
                {classes.map(c => <option key={c} value={c}>{t(`classes.${c}`)}</option>)}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t('character.addModal.cancel')}</Button>
            <Button onClick={handleAddCharacter}>{t('character.addModal.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

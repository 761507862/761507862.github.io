import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/useGameStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ITEMS } from '../constants';
import { DungeonType } from '@/features/dungeon/types';
import { GeneratedIcon } from '@/shared/components/ui/generated-icon';
import { Coins, ShoppingBag, Minus, Plus } from 'lucide-react';
import { formatKinah } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ItemRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ItemRecordModal: React.FC<ItemRecordModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { selectedServer, serverStats, addLog, characters } = useGameStore();
  
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  const prices = (selectedServer && serverStats[selectedServer]?.itemPrices) || {};
  
  const filteredCharacters = characters.filter(c => c.serverId === selectedServer && !c.isHidden);

  const handleClose = () => {
    setSelectedItem(null);
    setQuantity(1);
    setSelectedCharId(null);
    onClose();
  };

  const handleRecord = () => {
    if (!selectedItem || !selectedCharId) return;
    
    const price = prices[selectedItem] || 0;
    const revenue = price * quantity;
    
    if (revenue <= 0) return;

    addLog({
      id: crypto.randomUUID(),
      characterId: selectedCharId,
      serverId: selectedServer || 'unknown',
      dungeonType: DungeonType.MANUAL_ADJUSTMENT,
      difficulty: 0,
      revenue: revenue,
      timestamp: Date.now(),
      isDiminished: false,
      diminishingFactor: 1,
    });

    handleClose();
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const totalPrice = selectedItem ? (prices[selectedItem] || 0) * quantity : 0;

  // List of items known to have long names (> 5 characters)
  const LONG_NAME_ITEMS = ['extraction_stone', 'high_purity_aether'];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl p-6">
        <DialogHeader className="pb-5">
          <DialogTitle className="flex items-center gap-2 text-[30px] font-bold">
            <ShoppingBag className="h-8 w-8 text-primary" />
            {t('items.recordTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-3">
          {/* Left Column: Selections */}
          <div className="space-y-8">
            {/* Character Selection */}
            <div className="space-y-5">
              <label className="text-xl font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                {t('revenue.entry.subtitle_select')}
                {selectedCharId && <span className="text-xl font-normal text-primary">{filteredCharacters.find(c => c.id === selectedCharId)?.name}</span>}
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-2">
                {filteredCharacters.map(char => (
                  <div 
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer flex items-center gap-3 transition-all duration-200",
                      selectedCharId === char.id 
                        ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20" 
                        : "hover:bg-muted/50 hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full transition-colors flex-shrink-0",
                      selectedCharId === char.id ? "bg-primary" : "bg-muted-foreground/30"
                    )} />
                    <span className="truncate font-medium text-xl">{char.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Selection */}
            <div className="space-y-5">
              <label className="text-xl font-semibold text-muted-foreground uppercase tracking-wider">
                {t('items.selectItem')}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {ITEMS.map(item => {
                  const isLongName = LONG_NAME_ITEMS.includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={cn(
                        "aspect-square border rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-200",
                        selectedItem === item.id 
                          ? "border-primary ring-4 ring-primary/20 bg-primary/5 shadow-md" 
                          : "hover:border-primary/50 hover:bg-muted/30"
                      )}
                      title={t(`items.${item.id}`)}
                    >
                      <div className="w-14 h-14 mb-2 transition-transform duration-200 group-hover:scale-110">
                        <GeneratedIcon id={item.id} />
                      </div>
                      <span className={cn(
                        "text-center w-full px-1 opacity-90 leading-tight font-medium line-clamp-1",
                        isLongName ? "text-base" : "text-lg"
                      )}>
                        {t(`items.${item.id}`)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Details & Summary */}
          <div className="space-y-4 flex flex-col h-full">
            <div className={cn(
              "flex-1 bg-muted/30 rounded-xl border border-border/50 p-4 flex flex-col justify-between transition-all duration-300",
              (!selectedItem || !selectedCharId) && "opacity-50 grayscale"
            )}>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[20px] font-medium text-muted-foreground">{t('common.quantity')}</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 rounded-full" 
                        onClick={() => adjustQuantity(-1)}
                        disabled={!selectedItem || quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number" 
                        min="1" 
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 h-10 text-center font-mono font-medium text-[20px]"
                        disabled={!selectedItem}
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 rounded-full" 
                        onClick={() => adjustQuantity(1)}
                        disabled={!selectedItem}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-dashed border-border/50">
                    <span className="text-[20px] text-muted-foreground">{t('items.unitPrice')}</span>
                    <span className="font-mono text-[20px] font-medium">
                      {formatKinah(selectedItem ? (prices[selectedItem] || 0) : 0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[30px] font-bold flex items-center gap-3">
                      <Coins className="h-8 w-8 text-[#CFB53B] dark:text-[#FFD700]" />
                      {t('common.total')}
                    </span>
                    <div className="text-right">
                      <span className="block text-[30px] font-black text-[#CFB53B] dark:text-[#FFD700] font-mono tracking-tight">
                        {formatKinah(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {!selectedItem && (
                <div className="text-center text-[20px] text-muted-foreground mt-4 italic bg-background/50 py-2 rounded-lg">
                  {t('items.selectTip')}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-6 border-t pt-6 mt-3">
          <Button variant="ghost" onClick={handleClose} className="text-xl h-14 px-6 text-muted-foreground hover:text-foreground">
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleRecord} 
            disabled={!selectedItem || !selectedCharId || totalPrice <= 0}
            className="min-w-[200px] h-14 text-xl font-semibold shadow-lg shadow-primary/20"
          >
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

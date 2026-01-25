import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

const ITEMS = [
  { id: 'wrathful_longing', color: 'bg-red-500' },
  { id: 'wrathful_will', color: 'bg-blue-500' },
  { id: 'wrathful_self', color: 'bg-green-500' },
  { id: 'extraction_stone', color: 'bg-purple-500' },
  { id: 'aether', color: 'bg-yellow-400' },
  { id: 'high_purity_aether', color: 'bg-yellow-200' },
  { id: 'pure_aether', color: 'bg-slate-100 border-2' },
];

const ItemIcon = ({ item, name }: { item: typeof ITEMS[0], name: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  return (
    <div 
      className={`w-12 h-12 rounded-lg ${item.color} shadow-md cursor-help relative flex items-center justify-center`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showTooltip && (
        <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-50">
          {name}
        </div>
      )}
    </div>
  );
};

export const ItemRevenue = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedServer, serverStats, updateItemPrice } = useGameStore();
  
  const currentPrices = selectedServer && serverStats[selectedServer]?.itemPrices 
    ? serverStats[selectedServer].itemPrices 
    : {};

  const handlePriceChange = (itemId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    updateItemPrice(itemId, numValue);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t('items.title')}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {t('items.configure')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ITEMS.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ItemIcon item={item} name={t(`items.${item.id}`)} />
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t(`items.${item.id}`)}
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={currentPrices[item.id] || ''}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      className="h-8"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {t('account.kinah')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

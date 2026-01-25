import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AccountDashboard } from './features/account/components/AccountDashboard';
import { CharacterGrid } from './features/character/components/CharacterGrid';
import { RecordDungeonModal } from './features/dungeon/components/RecordDungeonModal';
import { ServerSelection } from './features/server/ServerSelection';
import { DataManagement } from './features/data-management/DataManagement';
import { ItemRevenue } from './features/items/ItemRevenue';
import { Button } from './shared/components/ui/button';
import { useGameStore } from './store/useGameStore';
import { RotateCcw, Server, Database, Coins, Calendar, Banknote } from 'lucide-react';
import { LanguageSwitcher } from './shared/components/LanguageSwitcher';
import { ThemeSwitcher } from './shared/components/ThemeSwitcher';
import { ReloadPrompt } from './shared/components/ReloadPrompt';
import GridPattern from './shared/components/ui/grid-pattern';
import { cn } from './lib/utils';

import { RevenueEntryModal } from './features/revenue/components/RevenueEntryModal';
import { getDisplayDateString } from './lib/dateUtils';

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [dataManagementOpen, setDataManagementOpen] = useState(false);
  const [revenueEntryOpen, setRevenueEntryOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const { resetWeeklyStats, selectedServer, setSelectedServer, servers } = useGameStore();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set initial date
    const updateDate = () => {
      setCurrentDate(getDisplayDateString());
    };

    updateDate();
    
    // Update every minute to catch midnight change
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenRecord = (charId: string) => {
    setSelectedCharacterId(charId);
    setRecordModalOpen(true);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset ALL weekly stats? This cannot be undone.")) {
      resetWeeklyStats();
    }
  };
  
  const currentServerName = servers?.find(s => s.id === selectedServer)?.name || selectedServer;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            {t('app.title')}
          </h1>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
            {/* Date Display */}
            <div className="flex items-center text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md mr-2">
              <Calendar className="mr-2 h-4 w-4" />
              {currentDate}
            </div>

            <Button variant="ghost" size="sm" onClick={() => setSelectedServer('')} className="text-muted-foreground">
              <Server className="mr-2 h-4 w-4" /> {currentServerName}
            </Button>
            <div className="h-4 w-[1px] bg-border mx-1 hidden md:block" />
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setDataManagementOpen(true)} title="Data Management">
              <Database className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" /> {t('app.reset')}
            </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-8">
        <section className="relative">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-4">
               <h2 className="text-xl font-semibold">{t('account.overview')}</h2>
               <Button variant="ghost" size="sm" onClick={() => navigate('/items')} className="text-muted-foreground hover:text-primary gap-2">
                 <Coins className="h-4 w-4" />
                 {t('items.title')}
               </Button>
             </div>
          </div>
          <AccountDashboard />
        </section>

        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">{t('character.title')}</h2>
            <Button variant="ghost" size="sm" onClick={() => setRevenueEntryOpen(true)} className="text-muted-foreground hover:text-primary gap-2">
              <Banknote className="h-4 w-4" />
              {t('revenue.entry.title')}
            </Button>
          </div>
          <CharacterGrid onRecordDungeon={handleOpenRecord} />
        </section>
      </main>
      
      {/* Modals */}
      <RecordDungeonModal 
        isOpen={recordModalOpen} 
        onClose={() => setRecordModalOpen(false)} 
        characterId={selectedCharacterId}
      />
      
      <DataManagement
        isOpen={dataManagementOpen}
        onClose={() => setDataManagementOpen(false)}
      />

      <RevenueEntryModal 
        isOpen={revenueEntryOpen}
        onClose={() => setRevenueEntryOpen(false)}
      />
      
      <ReloadPrompt />
    </div>
  );
}

function App() {
  const { selectedServer } = useGameStore();

  // If no server is selected, show selection screen
  if (!selectedServer) {
    return (
      <>
         <div className="absolute top-4 right-4 flex gap-2 z-50">
           <ThemeSwitcher />
           <LanguageSwitcher />
         </div>
         <ServerSelection />
         <ReloadPrompt />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative overflow-hidden">
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] ",
          "opacity-30"
        )}
      />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/items" element={<ItemRevenue />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

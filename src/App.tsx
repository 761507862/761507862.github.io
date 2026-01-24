import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountDashboard } from './features/account/components/AccountDashboard';
import { CharacterGrid } from './features/character/components/CharacterGrid';
import { RecordDungeonModal } from './features/dungeon/components/RecordDungeonModal';
import { ServerSelection } from './features/server/ServerSelection';
import { DataManagement } from './features/data-management/DataManagement'; // New
import { Button } from './shared/components/ui/button';
import { useGameStore } from './store/useGameStore';
import { RotateCcw, Server, Database } from 'lucide-react'; // Added Database icon
import { LanguageSwitcher } from './shared/components/LanguageSwitcher';
import { ThemeSwitcher } from './shared/components/ThemeSwitcher';
import { ReloadPrompt } from './shared/components/ReloadPrompt';

function App() {
  const { t } = useTranslation();
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [dataManagementOpen, setDataManagementOpen] = useState(false); // New
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const { resetWeeklyStats, selectedServer, setSelectedServer, servers } = useGameStore();

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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              {t('app.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('app.description')}
            </p>
          </div>
          <div className="flex gap-2 items-center">
             <Button variant="ghost" size="sm" onClick={() => setSelectedServer('')} className="text-muted-foreground">
               <Server className="mr-2 h-4 w-4" /> {currentServerName}
             </Button>
             <div className="h-4 w-[1px] bg-border mx-1" />
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
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('account.overview')}</h2>
            <AccountDashboard />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t('character.title')}</h2>
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
        
        <ReloadPrompt />
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/useGameStore';
import { DataCleaningService, CleaningReport } from '@/services/DataCleaningService';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Database, CheckCircle, AlertCircle, FileJson, RefreshCw } from 'lucide-react';

interface DataManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { logs, characters, importCleanedData } = useGameStore();
  const [report, setReport] = useState<CleaningReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCleanData = () => {
    setIsProcessing(true);
    // Simulate processing delay for better UX
    setTimeout(() => {
      const result = DataCleaningService.cleanData(logs, characters);
      setReport(result.report);
      importCleanedData(result.cleanedLogs, result.cleanedCharacters);
      setIsProcessing(false);
    }, 800);
  };

  const handleClose = () => {
    setReport(null);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={t('data.title')}
      footer={
        <Button onClick={handleClose}>{t('data.close')}</Button>
      }
    >
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileJson className="h-4 w-4 text-primary" />
                {t('data.current')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">{t('data.totalLogs')}</p>
              <div className="mt-2 text-2xl font-bold">{characters.length}</div>
              <p className="text-xs text-muted-foreground">{t('data.characters')}</p>
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-center items-center p-4">
             <Button 
               size="lg" 
               className="w-full h-full flex flex-col gap-2" 
               onClick={handleCleanData}
               disabled={isProcessing}
             >
               {isProcessing ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Database className="h-6 w-6" />}
               <span>{isProcessing ? t('data.cleaning') : t('data.startClean')}</span>
             </Button>
          </Card>
        </div>

        {report && (
          <div className="bg-secondary/20 rounded-lg p-4 border border-border animate-in fade-in slide-in-from-bottom-2">
             <div className="flex items-center gap-2 mb-4">
               <CheckCircle className="h-5 w-5 text-green-500" />
               <h3 className="font-semibold">{t('data.complete')}</h3>
             </div>
             
             <div className="space-y-2 text-sm">
               <div className="flex justify-between border-b border-border/50 pb-1">
                 <span className="text-muted-foreground">{t('data.duplicates')}:</span>
                 <span className="font-mono font-medium">{report.removedDuplicates}</span>
               </div>
               <div className="flex justify-between border-b border-border/50 pb-1">
                 <span className="text-muted-foreground">{t('data.invalidFixed')}:</span>
                 <span className="font-mono font-medium">{report.fixedEnergyValues}</span>
               </div>
               <div className="flex justify-between border-b border-border/50 pb-1">
                 <span className="text-muted-foreground">{t('data.orphaned')}:</span>
                 <span className="font-mono font-medium">{report.orphanedLogsRemoved}</span>
               </div>
             </div>

             <div className="mt-4 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1 font-medium">{t('data.log')}:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {report.details.map((detail, idx) => (
                    <li key={idx}>• {detail}</li>
                  ))}
                </ul>
             </div>
          </div>
        )}
        
        {!report && !isProcessing && (
          <div className="text-xs text-muted-foreground flex items-start gap-2 bg-blue-500/5 p-3 rounded border border-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              {t('data.warning')}
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
};

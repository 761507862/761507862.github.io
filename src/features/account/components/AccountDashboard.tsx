import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/useGameStore';
import { RevenueCalculator } from '@/features/dungeon/services/revenueCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Activity, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

export const AccountDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedServer, serverStats, characters, updateServerRatio } = useGameStore();
  
  const currentStats = (selectedServer && serverStats[selectedServer]) || { weeklyRuns: 0, weeklyTranscendenceRuns: 0, kinahRatio: 1.0 };
  const { weeklyRuns, weeklyTranscendenceRuns, kinahRatio } = currentStats;

  // Local state for ratio input
  const [tempRatio, setTempRatio] = useState(kinahRatio);

  useEffect(() => {
    setTempRatio(kinahRatio);
  }, [kinahRatio]);

  const handleRatioBlur = () => {
    if (selectedServer) {
      updateServerRatio(Number(tempRatio));
    }
  };

  const multiplier = RevenueCalculator.getDiminishingMultiplier(weeklyRuns);
  const transcendenceMultiplier = RevenueCalculator.getDiminishingMultiplier(weeklyTranscendenceRuns);
  
  // Calculate Total Kinah across all characters for CURRENT server
  const serverCharacters = characters.filter(c => c.serverId === selectedServer);
  const totalKinah = serverCharacters.reduce((sum, char) => sum + (char.totalKinah || 0), 0);
  
  // Calculate Actual Revenue (Total Kinah / 10000 * Ratio)
  // Use tempRatio for real-time calculation effect
  const actualRevenue = (totalKinah / 10000) * (tempRatio || 0);

  // Helper for DR status
  const getDRStatus = (m: number) => {
    if (m === 1.0) return { text: t('account.status.normal'), color: 'text-green-500' };
    if (m === 0.8) return { text: t('account.status.diminished'), color: 'text-yellow-500' };
    return { text: t('account.status.heavilyDiminished'), color: 'text-red-500' };
  };

  const drStatus = getDRStatus(multiplier);
  const transDrStatus = getDRStatus(transcendenceMultiplier);

  // Format Kinah with W unit helper
  const formatKinah = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(2).replace(/\.00$/, '')}W`;
    }
    return amount.toLocaleString();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Weekly Expedition Runs Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="h-full light:bg-white/70 light:backdrop-blur-sm dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('account.weeklyExpeditionRuns')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyRuns}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('account.revenueStatus')}: <span className={`font-medium ${drStatus.color}`}>{drStatus.text}</span>
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex justify-between mb-1">
                <span>0-54</span>
                <span>100%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>55-62</span>
                <span>80%</span>
              </div>
              <div className="flex justify-between">
                <span>63+</span>
                <span>60%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Transcendence Runs Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <Card className="h-full light:bg-white/70 light:backdrop-blur-sm dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('account.weeklyTranscendenceRuns')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyTranscendenceRuns}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('account.revenueStatus')}: <span className={`font-medium ${transDrStatus.color}`}>{transDrStatus.text}</span>
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex justify-between mb-1">
                <span>0-54</span>
                <span>100%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>55-62</span>
                <span>80%</span>
              </div>
              <div className="flex justify-between">
                <span>63+</span>
                <span>60%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Total Kinah Card - Updated with Actual Revenue */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card className="h-full border-yellow-500/20 bg-gradient-to-br from-card to-yellow-500/5 light:bg-white/70 light:backdrop-blur-sm dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('account.totalKinah')}</CardTitle>
            <Coins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-yellow-600 font-mono">{formatKinah(totalKinah)}</div>
              <p className="text-xs text-muted-foreground">{t('account.kinah')}</p>
            </div>
            
            <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{t('character.card.ratio')}</span>
                <div className="flex items-center gap-1">
                  <Input 
                    type="number" 
                    step="0.01"
                    className="h-6 text-xs text-right [&::-webkit-inner-spin-button]:appearance-none"
                    value={tempRatio}
                    onChange={(e) => setTempRatio(Number(e.target.value))}
                    onBlur={handleRatioBlur}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{t('character.card.actualRevenue')}</span>
                <div className="text-sm font-bold text-green-600 font-mono flex items-center h-6">
                  {actualRevenue.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/useGameStore';
import { RevenueCalculator } from '@/features/dungeon/services/revenueCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import NumberTicker from '@/shared/components/ui/number-ticker';
import { Input } from '@/shared/components/ui/input';
import { Activity, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatKinah } from '@/lib/utils';
import { DIMINISHING_RETURNS } from '@/config/gameConstants';

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
  
  // Calculate Total Kinah and Consumption across all characters for CURRENT server
  const { totalKinah, totalConsumption } = React.useMemo(() => {
    return characters.reduce(
      (acc, char) => {
        if (char.serverId === selectedServer && !char.isHidden) {
          acc.totalKinah += (char.totalKinah || 0);
          acc.totalConsumption += (char.totalConsumption || 0);
        }
        return acc;
      },
      { totalKinah: 0, totalConsumption: 0 }
    );
  }, [characters, selectedServer]);
  
  // Calculate Actual Revenue ((Total Kinah - Total Consumption) / 10000 * Ratio)
  // Use tempRatio for real-time calculation effect
  const actualRevenue = ((totalKinah - totalConsumption) / 10000) * (tempRatio || 0);

  // Helper for DR status
  const getDRStatus = (m: number) => {
    if (m === DIMINISHING_RETURNS.TIER_1_FACTOR) return { text: t('account.status.normal'), color: 'text-green-500' };
    if (m === DIMINISHING_RETURNS.TIER_2_FACTOR) return { text: t('account.status.diminished'), color: 'text-yellow-500' };
    return { text: t('account.status.heavilyDiminished'), color: 'text-red-500' };
  };

  const drStatus = getDRStatus(multiplier);
  const transDrStatus = getDRStatus(transcendenceMultiplier);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Weekly Expedition Runs Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="h-full bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('account.weeklyExpeditionRuns')}</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{weeklyRuns}</div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400 mt-1">
              {t('account.revenueStatus')}: <span className={`font-medium ${drStatus.color}`}>{drStatus.text}</span>
            </p>
            <div className="mt-4 text-xs text-blue-500/70 dark:text-blue-400/60">
              <div className="flex justify-between mb-1">
                <span>0-{DIMINISHING_RETURNS.TIER_1_LIMIT}</span>
                <span>{DIMINISHING_RETURNS.TIER_1_FACTOR * 100}%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>{DIMINISHING_RETURNS.TIER_1_LIMIT + 1}-{DIMINISHING_RETURNS.TIER_2_LIMIT}</span>
                <span>{DIMINISHING_RETURNS.TIER_2_FACTOR * 100}%</span>
              </div>
              <div className="flex justify-between">
                <span>{DIMINISHING_RETURNS.TIER_2_LIMIT + 1}+</span>
                <span>{DIMINISHING_RETURNS.TIER_3_FACTOR * 100}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Transcendence Runs Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <Card className="h-full bg-purple-50/80 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">{t('account.weeklyTranscendenceRuns')}</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{weeklyTranscendenceRuns}</div>
            <p className="text-xs text-purple-600/80 dark:text-purple-400 mt-1">
              {t('account.revenueStatus')}: <span className={`font-medium ${transDrStatus.color}`}>{transDrStatus.text}</span>
            </p>
            <div className="mt-4 text-xs text-purple-500/70 dark:text-purple-400/60">
              <div className="flex justify-between mb-1">
                <span>0-{DIMINISHING_RETURNS.TIER_1_LIMIT}</span>
                <span>{DIMINISHING_RETURNS.TIER_1_FACTOR * 100}%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>{DIMINISHING_RETURNS.TIER_1_LIMIT + 1}-{DIMINISHING_RETURNS.TIER_2_LIMIT}</span>
                <span>{DIMINISHING_RETURNS.TIER_2_FACTOR * 100}%</span>
              </div>
              <div className="flex justify-between">
                <span>{DIMINISHING_RETURNS.TIER_2_LIMIT + 1}+</span>
                <span>{DIMINISHING_RETURNS.TIER_3_FACTOR * 100}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Total Kinah Card - Updated with Actual Revenue */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card className="h-full bg-yellow-50/80 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{t('account.totalKinah')}</CardTitle>
            <Coins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 font-mono">
                <NumberTicker value={totalKinah} formatter={formatKinah} className="text-yellow-700 dark:text-yellow-400" maxStep={10000} />
              </div>
              <p className="text-xs text-yellow-600/80 dark:text-yellow-500/60">{t('account.kinah')}</p>
            </div>
            
            <div className="pt-2 border-t border-yellow-200/50 dark:border-yellow-800/50 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs text-yellow-600/80 dark:text-yellow-500/80">{t('character.card.ratio')}</span>
                <div className="flex items-center gap-1">
                  <Input 
                    type="number" 
                    step="0.01"
                    className="h-6 text-xs text-right bg-white/50 dark:bg-black/20 border-yellow-200 dark:border-yellow-800 focus-visible:ring-yellow-400 [&::-webkit-inner-spin-button]:appearance-none"
                    value={tempRatio}
                    onChange={(e) => setTempRatio(Number(e.target.value))}
                    onBlur={handleRatioBlur}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-yellow-600/80 dark:text-yellow-500/80">{t('character.card.actualRevenue')}</span>
                <div className="text-sm font-bold text-green-600 dark:text-green-400 font-mono flex items-center h-6">
                  {actualRevenue.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Consumption Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card className="h-full bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">{t('character.card.totalConsumption')}</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400 font-mono">
                <NumberTicker value={totalConsumption} formatter={formatKinah} className="text-red-700 dark:text-red-400" maxStep={10000} />
              </div>
              <p className="text-xs text-red-600/80 dark:text-red-500/60">{t('account.kinah')}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

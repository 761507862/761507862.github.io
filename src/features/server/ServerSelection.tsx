import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Server, Globe, Edit2, Check, RotateCcw, X } from 'lucide-react';

export const ServerSelection: React.FC = () => {
  const { t } = useTranslation();
  const { setSelectedServer, servers, updateServerName, resetServerName } = useGameStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const handleSelect = (serverId: string) => {
    if (editingId) return; // Prevent selection while editing
    setSelectedServer(serverId);
  };

  const startEdit = (e: React.MouseEvent, serverId: string, currentName: string) => {
    e.stopPropagation();
    setEditingId(serverId);
    setEditName(currentName);
    setError('');
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
    setError('');
  };

  const saveEdit = (e?: React.MouseEvent | React.KeyboardEvent, serverId?: string) => {
    if (e) e.stopPropagation();
    const id = serverId || editingId;
    if (!id) return;

    // Validation: 2-50 chars, allow letters, numbers, spaces, hyphens, and Chinese characters/punctuation
    if (editName.length < 2 || editName.length > 50) {
      setError('Name must be between 2 and 50 characters');
      return;
    }
    // Updated Regex to include Chinese punctuation and common symbols
    // \u3000-\u303F: CJK Symbols and Punctuation
    // \uFF00-\uFFEF: Halfwidth and Fullwidth Forms
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5\u3000-\u303F\uFF00-\uFFEF\s\-_.]+$/.test(editName)) {
      setError('Invalid characters');
      return;
    }

    updateServerName(id, editName);
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, serverId: string) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      saveEdit(e, serverId);
    } else if (e.key === 'Escape') {
      cancelEdit(e as any);
    }
  };

  const handleReset = (e: React.MouseEvent, serverId: string) => {
    e.stopPropagation();
    if (confirm('Reset server name to default?')) {
      resetServerName(serverId);
    }
  };

  // Ensure servers is initialized (fallback if store update hasn't propagated or persisted data is old)
  const displayServers = servers || [];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-4xl space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('common.server.selectTitle')}</h1>
          <p className="text-muted-foreground">{t('common.server.selectDesc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayServers.map((server) => (
            <motion.div
              key={server.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors group relative overflow-hidden"
                onClick={() => handleSelect(server.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 h-8 relative z-10">
                    {editingId === server.id ? (
                      <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                        <Input 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, server.id)}
                          onClick={(e) => e.stopPropagation()}
                          className={`h-7 text-sm ${error ? 'border-destructive' : ''}`}
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={(e) => saveEdit(e, server.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Server className="h-5 w-5 text-primary" />
                          {server.name}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 relative">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-muted-foreground hover:text-primary" 
                            onClick={(e) => startEdit(e, server.id, server.name)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-muted-foreground hover:text-primary" 
                            onClick={(e) => handleReset(e, server.id)}
                            title="Reset Name"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </CardTitle>
                  <div className="flex flex-col gap-1">
                    <CardDescription className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {server.region}
                    </CardDescription>
                    {editingId === server.id && error && (
                      <span className="text-[10px] text-destructive">{error}</span>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

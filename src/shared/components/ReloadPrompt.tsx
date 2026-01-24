import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/shared/components/ui/button';
import { AlertCircle } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
  // Check for updates every hour
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full bg-card border border-border shadow-lg rounded-lg p-4 flex items-start gap-4 animate-in slide-in-from-bottom-5">
      <div className="bg-primary/10 p-2 rounded-full">
        <AlertCircle className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm">New content available</h3>
        <p className="text-xs text-muted-foreground mt-1">
          A new version of the app is ready. Click reload to update.
        </p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            Reload
          </Button>
          <Button variant="outline" size="sm" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

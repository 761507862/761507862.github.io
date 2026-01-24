import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export const ThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light'; // Default to light if no preference
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleTheme}
      className="px-2"
      title={t(theme === 'light' ? 'common.theme.switchToDark' : 'common.theme.switchToLight')}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
};

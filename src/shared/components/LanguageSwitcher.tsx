import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant={i18n.resolvedLanguage === 'en' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => changeLanguage('en')}
        className="px-2"
      >
        EN
      </Button>
      <Button 
        variant={i18n.resolvedLanguage === 'zh-CN' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => changeLanguage('zh-CN')}
        className="px-2"
      >
        中文
      </Button>
    </div>
  );
};

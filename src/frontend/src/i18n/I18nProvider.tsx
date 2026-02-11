import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { i18n } from './i18n';
import { en } from './languages/en';
import { id } from './languages/id';
import { zhHans } from './languages/zh-Hans';
import { ar } from './languages/ar';
import { saveLanguagePreference, loadLanguagePreference } from './storage';

// Register all available languages
i18n.registerLanguage(en);
i18n.registerLanguage(id);
i18n.registerLanguage(zhHans);
i18n.registerLanguage(ar);

interface I18nContextValue {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  availableLanguages: Array<{ code: string; name: string; nativeName: string }>;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<string>(() => {
    // Load saved preference, validate it, or default to English
    const saved = loadLanguagePreference();
    const validLanguages = ['en', 'id', 'zh-Hans', 'ar'];
    return saved && validLanguages.includes(saved) ? saved : 'en';
  });

  useEffect(() => {
    // Set initial language on mount
    i18n.setLanguage(language);

    // Subscribe to language changes
    const unsubscribe = i18n.subscribe(() => {
      setLanguageState(i18n.getCurrentLanguage());
    });

    return () => {
      unsubscribe();
    };
  }, [language]);

  const setLanguage = (code: string) => {
    i18n.setLanguage(code);
    saveLanguagePreference(code);
  };

  const t = (key: string, fallback?: string) => {
    return i18n.translate(key, fallback);
  };

  const availableLanguages = i18n.getAvailableLanguages().map((lang) => ({
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName,
  }));

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Convenience hook for just the translate function
export function useT() {
  const { t } = useI18n();
  return t;
}

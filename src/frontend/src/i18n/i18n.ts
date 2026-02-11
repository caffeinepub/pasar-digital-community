type TranslationKey = string;
type TranslationDictionary = Record<TranslationKey, string>;

export interface LanguageDefinition {
  code: string;
  name: string;
  nativeName: string;
  translations: TranslationDictionary;
  rtl?: boolean;
}

class I18n {
  private languages: Map<string, LanguageDefinition> = new Map();
  private currentLanguage: string = 'en';
  private fallbackLanguage: string = 'en';
  private listeners: Set<() => void> = new Set();

  registerLanguage(lang: LanguageDefinition) {
    this.languages.set(lang.code, lang);
  }

  setLanguage(code: string) {
    if (this.languages.has(code)) {
      this.currentLanguage = code;
      this.updateDocumentLanguage(code);
      this.notifyListeners();
    } else {
      // If invalid code, fallback to English
      this.currentLanguage = this.fallbackLanguage;
      this.updateDocumentLanguage(this.fallbackLanguage);
      this.notifyListeners();
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getAvailableLanguages(): LanguageDefinition[] {
    return Array.from(this.languages.values());
  }

  translate(key: TranslationKey, fallback?: string): string {
    const currentLang = this.languages.get(this.currentLanguage);
    if (currentLang?.translations[key]) {
      return currentLang.translations[key];
    }

    // Fallback to English
    const fallbackLang = this.languages.get(this.fallbackLanguage);
    if (fallbackLang?.translations[key]) {
      return fallbackLang.translations[key];
    }

    // Return provided fallback or key itself
    return fallback || key;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  private updateDocumentLanguage(code: string) {
    const lang = this.languages.get(code);
    if (lang) {
      document.documentElement.lang = code;
      document.documentElement.dir = lang.rtl ? 'rtl' : 'ltr';
    }
  }
}

export const i18n = new I18n();

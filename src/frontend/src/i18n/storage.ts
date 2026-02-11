const LANGUAGE_STORAGE_KEY = 'app_language';

export function saveLanguagePreference(languageCode: string): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
}

export function loadLanguagePreference(): string | null {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to load language preference:', error);
    return null;
  }
}

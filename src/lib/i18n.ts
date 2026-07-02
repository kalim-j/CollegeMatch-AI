import { useCallback } from 'react';

type Lang = 'en' | 'ta';

const translations: Record<Lang, Record<string, string>> = {
  en: {},
  ta: {},
};

let currentLang: Lang = 'en';

export const setLanguage = (lang: Lang) => {
  currentLang = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('lang', lang);
  }
};

export const t = (key: string): string => {
  return translations[currentLang][key] || translations.en[key] || key;
};

export const loadTranslations = async () => {
  try {
    const [en, ta] = await Promise.all([
      fetch('/locales/en.json').then(r => r.json()),
      fetch('/locales/ta.json').then(r => r.json()),
    ]);
    translations.en = en;
    translations.ta = ta;
    if (typeof localStorage !== 'undefined') {
      currentLang = (localStorage.getItem('lang') as Lang) || 'en';
    }
  } catch (error) {
    console.warn("Translations not loaded yet", error);
  }
};

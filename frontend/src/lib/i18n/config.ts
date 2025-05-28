export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'fr'],
  routing: {
    prefixDefaultLocale: false, // ✅ Changé : pas de préfixe pour l'anglais
  },
};

export type Locale = 'en' | 'fr';
export type DefaultLocale = 'en';

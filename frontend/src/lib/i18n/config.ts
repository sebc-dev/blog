export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'fr'],
  routing: {
    prefixDefaultLocale: true,
  },
};

export type Locale = typeof i18nConfig.locales[number];

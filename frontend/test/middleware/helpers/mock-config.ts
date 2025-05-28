export const defaultMockI18nConfig = {
  locales: ['fr', 'en', 'es'],
  defaultLocale: 'fr',
  routing: {
    prefixDefaultLocale: true
  }
};

export const updateMockConfig = (overrides: any) => {
  Object.assign(defaultMockI18nConfig, overrides);
};

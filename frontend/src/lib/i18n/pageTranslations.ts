/**
 * Configuration des traductions spécifiques pour les pages avec URLs différentes
 */
export const specificPageTranslations: Record<string, Record<string, string>> = {
  // Pages avec URLs différentes
  '/about/': { fr: '/fr/a-propos/' },
  '/fr/a-propos/': { en: '/about/' },

  // Pages avec URLs identiques
  '/contact/': { fr: '/fr/contact/' },
  '/fr/contact/': { en: '/contact/' },

  // Pages de blog
  '/posts/': { fr: '/fr/posts/' },
  '/fr/posts/': { en: '/posts/' },
}; 
import { getCollection, type CollectionEntry } from 'astro:content';
import { i18nConfig } from './config.ts';
import enStrings from './locales/en';
import frStrings from './locales/fr';

export type Strings = typeof enStrings | typeof frStrings;
export type StringKey = keyof Strings;

// Interface pour les locals Astro
interface AstroLocals {
  currentLang: string;
}

/**
 * Un enregistrement qui associe les codes de langue à leurs ressources de chaînes correspondantes.
 */
export const translations: Record<string, typeof enStrings | typeof frStrings> = {
  en: enStrings,
  fr: frStrings,
};

/**
 * Extrait l'identifiant de langue du chemin de l'URL donnée.
 * Version améliorée qui gère correctement les URLs sans préfixe pour la langue par défaut.
 */
export function getLangFromUrl(url: URL): string {
  const cleanPath = url.pathname.replace(/\/+/g, '/').trim();
  const segments = cleanPath.split('/').filter(Boolean);
  const potentialLang = segments[0];

  // Si le premier segment est une langue valide, c'est la langue courante
  if (potentialLang && i18nConfig.locales.includes(potentialLang as never)) {
    return potentialLang;
  }

  // Sinon, c'est la langue par défaut (pas de préfixe)
  return i18nConfig.defaultLocale;
}

/**
 * Récupère la chaîne de traduction pour la clé et la langue données.
 */
export function t(key: StringKey, lang: string): string | undefined {
  const langStrings = translations[lang];
  if (langStrings && typeof langStrings[key] === 'string') {
    return langStrings[key];
  }

  const fallbackStrings = translations[i18nConfig.defaultLocale];
  if (fallbackStrings && typeof fallbackStrings[key] === 'string') {
    console.warn(`Translation key '${key}' not found for lang '${lang}', using fallback.`);
    return fallbackStrings[key];
  }

  console.error(`Translation key '${key}' not found for lang '${lang}' and no fallback available.`);
  return key;
}

/**
 * Fournit une fonction de traduction adaptée pour une langue spécifique.
 */
export function useTranslations(lang: string): (arg0: StringKey) => string {
  return (key: StringKey): string => t(key, lang) ?? key;
}

/**
 * Hook utilitaire pour les composants Astro
 */
export function useI18n(locals: AstroLocals) {
  const { currentLang } = locals;
  const t = useTranslations(currentLang);

  return {
    currentLang,
    t,
    isDefaultLang: currentLang === i18nConfig.defaultLocale,
    otherLangs: i18nConfig.locales.filter(lang => lang !== currentLang)
  };
}

/**
 * Interface pour les liens d'articles traduits
 */
export interface TranslatedArticleLink {
  lang: string;
  slug: string;
  title: string;
}

/**
 * Traductions spécifiques pour les pages avec URLs différentes
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

/**
 * Récupère les liens vers les versions traduites d'un article donné.
 */
export async function getTranslatedArticles(
  currentPost: CollectionEntry<'blog'>
): Promise<TranslatedArticleLink[]> {
  if (!currentPost.data.translationId) {
    return [];
  }

  const allBlogPosts = await getCollection('blog');
  const translations = allBlogPosts.filter(
    (post) =>
      post.data.translationId === currentPost.data.translationId &&
      post.data.lang !== currentPost.data.lang
  );

  return translations.map((post) => ({
    lang: post.data.lang,
    slug: post.slug,
    title: post.data.title,
  }));
}

/**
 * Génère un chemin d'URL traduit - Version améliorée
 */
export function getTranslatedPath(
  localeToSwitchTo: string,
  currentPathname: string,
  currentLocale: string | undefined
): string {
  // Normaliser le chemin avec slash final pour la correspondance
  const currentPathWithSlash = currentPathname.endsWith('/')
    ? currentPathname
    : `${currentPathname}/`;

  // Vérifier les traductions spécifiques de pages
  if (specificPageTranslations[currentPathWithSlash]?.[localeToSwitchTo]) {
    return specificPageTranslations[currentPathWithSlash][localeToSwitchTo];
  }

  const pathSegments = currentPathname.split('/').filter(Boolean);

  // Si on est sur la langue par défaut (pas de préfixe)
  if (currentLocale === i18nConfig.defaultLocale && pathSegments[0] !== currentLocale) {
    if (localeToSwitchTo === i18nConfig.defaultLocale) {
      return currentPathname; // Déjà sur la bonne langue
    }
    // Ajouter le préfixe de langue

    return currentPathname === '/'
      ? `/${localeToSwitchTo}/`
      : `/${localeToSwitchTo}${currentPathname}${currentPathname.endsWith('/') ? '' : '/'}`;
  }

  // Si on a un préfixe de langue dans l'URL
  if (pathSegments[0] === currentLocale) {
    if (localeToSwitchTo === i18nConfig.defaultLocale) {
      // Retirer le préfixe pour la langue par défaut
      const newPath = pathSegments.slice(1).join('/');
      return newPath ? `/${newPath}${currentPathname.endsWith('/') ? '/' : ''}` : '/';
    }


      pathSegments[0] = localeToSwitchTo;
      return `/${pathSegments.join('/')}${currentPathname.endsWith('/') ? '/' : ''}`;
  }

  // Fallback : aller à la racine de la langue cible
  return localeToSwitchTo === i18nConfig.defaultLocale ? '/' : `/${localeToSwitchTo}/`;
}

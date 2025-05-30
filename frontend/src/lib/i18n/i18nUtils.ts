import { getCollection, type CollectionEntry } from 'astro:content';
import { i18nConfig, type Locale } from './config.ts';
import enStrings from './locales/en';
import frStrings from './locales/fr';
import { specificPageTranslations } from './pageTranslations.ts';

export type Strings = typeof enStrings | typeof frStrings;
export type StringKey = keyof Strings;

// Interface pour les locals Astro
interface AstroLocals {
  currentLang: string;
}

/**
 * Type guard pour vérifier si une chaîne est une locale valide
 */
function isValidLocale(lang: string): lang is Locale {
  return i18nConfig.locales.includes(lang as Locale);
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
  if (potentialLang && isValidLocale(potentialLang)) {
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
 * Normalise un chemin en s'assurant qu'il se termine par un slash
 */
function normalizePathWithTrailingSlash(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

/**
 * Gère le passage de la locale par défaut vers une autre locale
 */
function handleDefaultToLocaleSwitch(
  currentPathname: string,
  localeToSwitchTo: string,
  currentLocale: string
): string {
  if (localeToSwitchTo === currentLocale) {
    return currentPathname; // Déjà sur la bonne langue
  }
  
  // Ajouter le préfixe de langue
  const newBasePath = currentPathname === '/' ? '' : currentPathname;
  const newFullPath = `/${localeToSwitchTo}${newBasePath}`;
  return newFullPath.endsWith('/') ? newFullPath : `${newFullPath}/`;
}

/**
 * Gère le passage d'un chemin avec préfixe de locale vers la locale par défaut
 */
function handleLocaleToDefaultSwitch(
  pathSegments: string[],
  currentPathname: string
): string {
  const newPath = pathSegments.slice(1).join('/');
  return newPath ? `/${newPath}${currentPathname.endsWith('/') ? '/' : ''}` : '/';
}

/**
 * Gère le passage entre chemins avec préfixes de locale
 */
function handleLocalePrefixedSwitch(
  pathSegments: string[],
  localeToSwitchTo: string,
  currentPathname: string
): string {
  pathSegments[0] = localeToSwitchTo;
  const newConstructedPath = pathSegments.join('/');

  if (pathSegments.length === 1) {
    // Le chemin était juste un préfixe de langue, ex: /en transformé en /fr
    return `/${newConstructedPath}/`; // Assurer un slash final, ex: /fr/
  }
  
  // Le chemin était plus long, ex: /en/blog transformé en /fr/blog
  return `/${newConstructedPath}${currentPathname.endsWith('/') ? '/' : ''}`;
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
  const currentPathWithSlash = normalizePathWithTrailingSlash(currentPathname);

  // Vérifier les traductions spécifiques de pages
  if (specificPageTranslations[currentPathWithSlash]?.[localeToSwitchTo]) {
    return specificPageTranslations[currentPathWithSlash][localeToSwitchTo];
  }

  const pathSegments = currentPathname.split('/').filter(Boolean);

  // Si on est sur la langue par défaut (pas de préfixe)
  if (currentLocale === i18nConfig.defaultLocale && pathSegments[0] !== currentLocale) {
    return handleDefaultToLocaleSwitch(currentPathname, localeToSwitchTo, currentLocale);
  }

  // Cas: le chemin actuel a un préfixe de langue valide (ex: /en/blog ou /fr/about)
  if (pathSegments.length > 0 && isValidLocale(pathSegments[0]) && pathSegments[0] === currentLocale) {
    // Cas: on veut passer à la langue par défaut (ex: /fr/blog -> /blog)
    if (localeToSwitchTo === i18nConfig.defaultLocale) {
      return handleLocaleToDefaultSwitch(pathSegments, currentPathname);
    }

    // Cas: on veut passer à une autre langue avec préfixe (ex: /en/blog -> /fr/blog)
    return handleLocalePrefixedSwitch([...pathSegments], localeToSwitchTo, currentPathname);
  }

  // Fallback: si aucune des conditions ci-dessus n'est remplie,
  // aller à la racine de la langue cible.
  // Ceci peut arriver si currentLocale est undefined et qu'il n'y a pas de traduction spécifique.
  return localeToSwitchTo === i18nConfig.defaultLocale ? '/' : `/${localeToSwitchTo}/`;
}

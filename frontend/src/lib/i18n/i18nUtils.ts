import { getCollection, type CollectionEntry } from 'astro:content';
import { i18nConfig } from './config.ts';
import enStrings from './locales/en';
import frStrings from './locales/fr';

export type Strings = typeof enStrings | typeof frStrings;
export type StringKey = keyof Strings;

/**
 * Un enregistrement qui associe les codes de langue à leurs ressources de chaînes correspondantes.
 *
 * La variable `translations` est utilisée pour stocker une collection de ressources
 * de chaînes spécifiques à chaque langue, où chaque clé représente un code de langue
 * (par ex. "en" pour anglais, "fr" pour français), et la valeur représente les chaînes
 * pour cette langue.
 *
 * - `en`: Ressources de chaînes en anglais.
 * - `fr`: Ressources de chaînes en français.
 */
export const translations: Record<string, typeof enStrings | typeof frStrings> = {
  en: enStrings,
  fr: frStrings,
};

/**
 * Extrait l'identifiant de langue du chemin de l'URL donnée.
 *
 * @param {URL} url - L'objet URL duquel extraire l'identifiant de langue.
 * @return {string} L'identifiant de langue extrait s'il existe et est valide ; sinon, renvoie une locale par défaut.
 */
export function getLangFromUrl(url: URL): string {
  const cleanPath = url.pathname.replace(/\/+/g, '/').trim();
  const segments = cleanPath.split('/').filter(Boolean);

  const potentialLang = segments[0];

  if (potentialLang && i18nConfig.locales.includes(potentialLang as never)) {
    return potentialLang;
  }

  return i18nConfig.defaultLocale;
}

/**
 * Récupère la chaîne de traduction pour la clé et la langue données. Si la clé n'est pas trouvée
 * dans la langue spécifiée, utilise la locale par défaut. Si la clé n'est pas trouvée
 * dans la locale de secours non plus, la clé elle-même est renvoyée.
 *
 * @param {StringKey} key - La clé pour la chaîne de traduction.
 * @param {string} lang - Le code de langue pour récupérer la traduction.
 * @return {string | undefined} La chaîne traduite, la clé elle-même comme solution de repli, ou undefined si aucune traduction n'est disponible.
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
 *
 * @param {string} lang - Le code de langue à utiliser pour les traductions.
 * @return {function(StringKey): string} Une fonction qui prend une clé de traduction et renvoie la chaîne traduite correspondante. Si aucune traduction n'est trouvée, la clé est renvoyée.
 */
export function useTranslations(lang: string): (arg0: StringKey) => string {
  return (key: StringKey): string => t(key, lang) ?? key;
}

/**
 * Représente le lien vers un article traduit dans une langue spécifique.
 *
 * Cette interface est utilisée pour définir les propriétés associées à une traduction
 * d'article, incluant la langue de la traduction, l'identifiant unique de l'article
 * (ou slug), et son titre traduit.
 *
 * Propriétés :
 * - `lang` : Le code de langue ISO 639-1 représentant la langue de traduction (ex: 'en' pour anglais, 'fr' pour français)
 * - `slug` : Un slug ou identifiant unique pour l'article traduit utilisé dans les URLs
 * - `title` : Le titre de l'article traduit dans la langue respective
 */
export interface TranslatedArticleLink {
  lang: string;
  slug: string;
  title: string;
}

/**
 * Un objet contenant les traductions pour des chemins de pages spécifiques.
 * Chaque clé dans l'objet représente une chaîne de chemin de page, et sa valeur
 * est un objet associant des codes de langue à leurs chemins de pages traduits respectifs.
 *
 * Par exemple :
 * - Un chemin de page en français peut avoir un chemin de traduction équivalent en anglais mappé, et vice versa.
 *
 * Le but de cette structure est de permettre une recherche rapide d'un chemin traduit
 * pour une page spécifique dans une application multilingue.
 */
export const specificPageTranslations: Record<string, Record<string, string>> = {
  '/fr/a-propos/': { en: '/en/about/' },
  '/en/about/': { fr: '/fr/a-propos/' },
};

/**
 * Récupère les liens vers les versions traduites d'un article donné.
 * @param currentPost L'entrée de collection de l'article actuel.
 * @returns Un tableau d'objets TranslatedArticleLink pour chaque traduction disponible.
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
 * Génère un chemin d'URL traduit en fonction de la locale cible, du chemin actuel et de la locale courante.
 *
 * @param {string} localeToSwitchTo - La locale cible vers laquelle traduire le chemin.
 * @param {string} currentPathname - Le chemin d'URL courant.
 * @param {string | undefined} currentLocale - La locale courante utilisée dans le chemin, si applicable.
 * @return {string} Le chemin d'URL traduit pour la locale spécifiée.
 */
export function getTranslatedPath(
  localeToSwitchTo: string,
  currentPathname: string,
  currentLocale: string | undefined
): string {
  const currentPathWithSlash = currentPathname.endsWith('/')
    ? currentPathname
    : `${currentPathname}/`;
  if (specificPageTranslations[currentPathWithSlash]?.[localeToSwitchTo]) {
    return specificPageTranslations[currentPathWithSlash][localeToSwitchTo];
  }

  const pathSegments = currentPathname.split('/').filter(Boolean);
  if (pathSegments[0] === currentLocale) {
    pathSegments[0] = localeToSwitchTo;
    return `/${pathSegments.join('/')}${currentPathname.endsWith('/') ? '/' : ''}`;
  }

  return `/${localeToSwitchTo}/`;
}

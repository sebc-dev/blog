// frontend/src/lib/i18nUtils.ts
import { getCollection, type CollectionEntry } from 'astro:content';

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

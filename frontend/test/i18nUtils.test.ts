import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getLangFromUrl,
  getTranslatedArticles,
  getTranslatedPath,
} from '../src/lib/i18n/i18nUtils.ts';
import { type CollectionEntry, getCollection } from 'astro:content';

vi.mock('astro:content', () => {
  return {
    getCollection: vi.fn(),
  };
});

describe('i18nUtils', () => {
  describe('getTranslatedArticles', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("devrait retourner un tableau vide si le post n'a pas de translationId", async () => {
      const currentPost = {
        data: {
          lang: 'fr',
        },
      } as CollectionEntry<'blog'>;

      const result = await getTranslatedArticles(currentPost);

      expect(result).toEqual([]);
      expect(getCollection).not.toHaveBeenCalled();
    });

    it("devrait retourner un tableau vide si aucune traduction n'est trouvée", async () => {
      const currentPost = {
        data: {
          translationId: 'unique-id-1',
          lang: 'fr',
        },
      } as CollectionEntry<'blog'>;

      vi.mocked(getCollection).mockResolvedValue([
        {
          data: {
            translationId: 'unique-id-1',
            lang: 'fr',
            title: 'Article en français',
          },
          slug: 'article-francais',
        } as CollectionEntry<'blog'>,
      ]);

      const result = await getTranslatedArticles(currentPost);

      expect(result).toEqual([]);
      expect(getCollection).toHaveBeenCalledWith('blog');
    });

    it('devrait retourner un tableau avec une traduction si une seule est trouvée', async () => {
      const currentPost = {
        data: {
          translationId: 'unique-id-2',
          lang: 'fr',
          title: 'Article en français',
        },
        slug: 'article-francais',
      } as CollectionEntry<'blog'>;

      vi.mocked(getCollection).mockResolvedValue([
        currentPost,
        {
          data: {
            translationId: 'unique-id-2',
            lang: 'en',
            title: 'Article in English',
          },
          slug: 'english-article',
        } as CollectionEntry<'blog'>,
      ]);

      const result = await getTranslatedArticles(currentPost);

      expect(result).toEqual([
        {
          lang: 'en',
          slug: 'english-article',
          title: 'Article in English',
        },
      ]);
      expect(getCollection).toHaveBeenCalledWith('blog');
    });

    it('devrait filtrer correctement les articles ayant des translationId différents', async () => {
      const currentPost = {
        data: {
          translationId: 'unique-id-4',
          lang: 'fr',
          title: 'Article en français',
        },
        slug: 'article-francais',
      } as CollectionEntry<'blog'>;

      vi.mocked(getCollection).mockResolvedValue([
        currentPost,
        {
          data: {
            translationId: 'unique-id-4',
            lang: 'en',
            title: 'Article in English',
          },
          slug: 'english-article',
        } as CollectionEntry<'blog'>,
        {
          data: {
            translationId: 'autre-id',
            lang: 'en',
            title: 'Other Article',
          },
          slug: 'other-article',
        } as CollectionEntry<'blog'>,
      ]);

      const result = await getTranslatedArticles(currentPost);

      expect(result).toEqual([
        {
          lang: 'en',
          slug: 'english-article',
          title: 'Article in English',
        },
      ]);
      expect(getCollection).toHaveBeenCalledWith('blog');
    });
  });

  describe('getLangFromUrl', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it('should return the language identifier from the URL path', () => {
      const url = new URL('https://example.com/fr/some-path');
      const result = getLangFromUrl(url);
      expect(result).toBe('fr');
    });

    it('should return the default locale if language identifier is missing in the URL', () => {
      vi.mock('../src/lib/i18n/config', () => ({
        i18nConfig: {
          defaultLocale: 'it',
          locales: ['en', 'fr', 'it'],
          routing: {
            prefixDefaultLocale: true,
          },
        },
      }));
      const url = new URL('https://example.com/some-path');
      const result = getLangFromUrl(url);
      expect(result).toBe('it');
    });

    it('should return the default locale from the environment if defined', () => {
      vi.mock('../src/lib/i18n/config', () => ({
        i18nConfig: {
          defaultLocale: 'es', // Valeur mockée
          locales: ['en', 'fr', 'es'],
          routing: {
            prefixDefaultLocale: true,
          },
        },
      }));
      const url = new URL('https://example.com');
      const result = getLangFromUrl(url);
      expect(result).toBe('es');
    });

    it('should return the language identifier even with additional path segments', () => {
      const url = new URL('https://example.com/en/products/phones');
      const result = getLangFromUrl(url);
      expect(result).toBe('en');
    });

    it('should handle a trailing slash in the URL path', () => {
      const url = new URL('https://example.com/fr/');
      const result = getLangFromUrl(url);
      expect(result).toBe('fr');
    });

    it('should handle an empty path in the URL and return default locale', () => {
      vi.mock('../src/lib/i18n/config', () => ({
        i18nConfig: {
          defaultLocale: 'sw',
          locales: ['en', 'fr', 'sw'],
          routing: {
            prefixDefaultLocale: true,
          },
        },
      }));
      const url = new URL('https://example.com/');
      const result = getLangFromUrl(url);
      expect(result).toBe('en'); // Default locale
    });
  });

  describe('getTranslatedPath', () => {
    it('should return the translated path based on specific translations', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/en/about/';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr/a-propos/');
    });

    it('should replace current locale prefix with the target locale in the path', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/en/blog/';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr/blog/');
    });

    it('should replace current locale prefix and preserve trailing slash behavior', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/en/blog';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr/blog');
    });

    it('should return the default path for the target locale if current locale is not in the path', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/homepage';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr/');
    });

    it('should handle cases where currentLocale is undefined', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/about/';
      const currentLocale = undefined;

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr/');
    });

    it('should handle reverse translation from French to English', () => {
      const localeToSwitchTo = 'en';
      const currentPathname = '/fr/a-propos/';
      const currentLocale = 'fr';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/en/about/');
    });

    it('should handle specific translations with paths that need normalization', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/en/about';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr/a-propos/');
    });

    it('should preserve trailing slash when replacing locale', () => {
      const localeToSwitchTo = 'es';
      const currentPathname = '/fr/products/';
      const currentLocale = 'fr';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/es/products/');
    });

    it('should handle root path with locale', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/en/';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr/');
    });

    it('should handle root path without trailing slash', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/en';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr');
    });

    it('should handle deep nested paths', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/en/products/electronics/phones';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr/products/electronics/phones');
    });

    it('should handle case where specific translation does not exist for target locale', () => {
      const localeToSwitchTo = 'es';
      const currentPathname = '/en/about/';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/es/about/');
    });

    it('should handle empty path', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr/');
    });

    it('should handle path that starts with current locale but has no other segments', () => {
      const localeToSwitchTo = 'fr';
      const currentPathname = '/en';
      const currentLocale = 'en';

      const result = getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale);
      expect(result).toBe('/fr');
    });
  });
});

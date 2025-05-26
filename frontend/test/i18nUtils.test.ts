import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getTranslatedArticles,
  getTranslatedPath,
  t,
  getLangFromUrl,
} from '../src/lib/i18n/i18nUtils.ts';
import { type CollectionEntry, getCollection } from 'astro:content';

vi.mock('astro:content', () => {
  return {
    getCollection: vi.fn(),
  };
});

vi.mock('../src/lib/i18n/locales/en', () => ({
  default: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'article.readMore': 'Read More',
    'footer.copyright': '© 2024 All rights reserved',
    'nav.contact': 'Contact',
  },
}));

vi.mock('../src/lib/i18n/locales/fr', () => ({
  default: {
    'nav.home': 'Accueil',
    'nav.blog': 'Blog',
    'nav.about': 'À propos',
    'article.readMore': 'Lire la suite',
    'footer.copyright': '© 2024 Tous droits réservés',
  },
}));

vi.mock('../src/lib/i18n/config', () => ({
  i18nConfig: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
}));

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
      vi.resetModules();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });
    it('should return the language identifier from the URL path', () => {
      const url = new URL('https://example.com/fr/some-path');
      const result = getLangFromUrl(url);
      expect(result).toBe('fr');
    });

    it('should return the default locale if language identifier is missing in the URL', () => {
      const url = new URL('https://example.com/some-path');
      const result = getLangFromUrl(url);
      expect(result).toBe('en');
    });

    it('should return the default locale from the environment if defined', () => {
      const url = new URL('https://example.com');
      const result = getLangFromUrl(url);
      expect(result).toBe('en');
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
      const url = new URL('https://example.com/');
      const result = getLangFromUrl(url);
      expect(result).toBe('en');
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

  describe('Function t - Translation success cases', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return correct translation when key and language exist', () => {
      const key = 'nav.home';
      const lang = 'fr';
      const expectedTranslation = 'Accueil';

      const result = t(key, lang);

      expect(result).toBe(expectedTranslation);
    });

    it('should return correct translation for English', () => {
      const key = 'article.readMore';
      const lang = 'en';
      const expectedTranslation = 'Read More';

      const result = t(key, lang);

      expect(result).toBe(expectedTranslation);
    });

    it('should return correct translation for multiple different keys', () => {
      expect(t('nav.home', 'en')).toBe('Home');
      expect(t('nav.home', 'fr')).toBe('Accueil');
      expect(t('nav.about', 'en')).toBe('About');
      expect(t('nav.about', 'fr')).toBe('À propos');
      expect(t('footer.copyright', 'fr')).toBe('© 2024 Tous droits réservés');
    });

    it('should return fallback translation and warn when key is missing in specified language', () => {
      const key = 'nav.contact';
      const lang = 'fr';
      const expectedFallback = 'Contact';

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // @ts-expect-error clé de test non comprise dans le fichier de config de base : OK pour le test
      const result = t(key, lang);

      expect(result).toBe(expectedFallback);
      expect(warnSpy).toHaveBeenCalledWith(
        `Translation key '${key}' not found for lang '${lang}', using fallback.`
      );

      warnSpy.mockRestore();
    });

    it('should return key and log error when key is missing in both specified and fallback languages', () => {
      const key = 'nav.unknown'; // Clé absente dans toutes les langues
      const lang = 'fr';

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // @ts-expect-error clé de test non comprise dans le fichier de config de base : OK pour le test
      const result = t(key, lang);

      expect(result).toBe(key);
      expect(errorSpy).toHaveBeenCalledWith(
        `Translation key '${key}' not found for lang '${lang}' and no fallback available.`
      );

      errorSpy.mockRestore();
    });

    it("should return fallback translation when specified language is unknown", () => {
      // Arrange
      const key = "nav.home";
      const lang = "xx";
      const expectedFallback = "Home";

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = t(key, lang);

      expect(result).toBe(expectedFallback);
      expect(warnSpy).toHaveBeenCalledWith(
        `Translation key '${key}' not found for lang '${lang}', using fallback.`
      );

      warnSpy.mockRestore();
    });

    it("should return key and log error when key is empty", () => {
      const key = "";
      const lang = "fr";

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // @ts-expect-error clé de test non comprise dans le fichier de config de base : OK pour le test
      const result = t(key, lang);

      expect(result).toBe(key);
      expect(errorSpy).toHaveBeenCalledWith(
        `Translation key '${key}' not found for lang '${lang}' and no fallback available.`
      );

      errorSpy.mockRestore();
    });

    it("should return fallback translation and warn when language is empty string", () => {
      const key = "nav.home";
      const lang = "";
      const expectedFallback = "Home";

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = t(key, lang);

      expect(result).toBe(expectedFallback);
      expect(warnSpy).toHaveBeenCalledWith(
        `Translation key '${key}' not found for lang '${lang}', using fallback.`
      );

      warnSpy.mockRestore();
    });


  });
});

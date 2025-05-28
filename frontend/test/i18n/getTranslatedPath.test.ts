import { describe, expect, it, vi } from 'vitest';
import { getTranslatedPath } from '../../src/lib/i18n/i18nUtils.ts';

// Mock de la configuration i18n pour ce test
vi.mock('../../src/lib/i18n/config', () => ({
  i18nConfig: {
    defaultLocale: 'en',
    locales: ['en', 'fr'], // Assurez-vous que 'de' n'est pas utilisé si non défini ici
    routing: {
      prefixDefaultLocale: false, // ✅ Changé ici
    },
  },
  // SpecificPageTranslations est directement dans i18nUtils.ts, pas besoin de le mocker ici
  // sauf si on veut le surcharger pour des tests spécifiques, ce qui n'est pas le cas ici.
}));

describe('getTranslatedPath', () => {
  describe('Basic path translation (legacy prefix scenarios and specific pages)', () => {
    it('should replace locale prefix if current path has one (e.g., /en/blog to /fr/blog)', () => {
      const result = getTranslatedPath('fr', '/en/blog/', 'en');
      expect(result).toBe('/fr/blog/');
    });

    it('should handle specific page translations from default unprefixed path', () => {
      // /about/ (en, default, no prefix) -> /fr/a-propos/ (fr, specific)
      const result = getTranslatedPath('fr', '/about/', 'en');
      expect(result).toBe('/fr/a-propos/');
    });

    it('should handle specific page translations from prefixed path to default unprefixed', () => {
      // /fr/a-propos/ (fr, specific) -> /about/ (en, default, no prefix)
      const result = getTranslatedPath('en', '/fr/a-propos/', 'fr');
      expect(result).toBe('/about/');
    });
  });

  describe('Edge cases and general behavior', () => {
    it('should handle root paths when switching from a path that might have a prefix', () => {
      expect(getTranslatedPath('fr', '/en/', 'en')).toBe('/fr/'); // /en/ (lang en) -> /fr/
      expect(getTranslatedPath('fr', '/en', 'en')).toBe('/fr/');  // /en (lang en) -> /fr/ (MODIFIÉ : attend maintenant un slash final)
    });

    it('should handle undefined current locale by using specific translations or fallback to root of target lang', () => {
      // Avec specific translation: /about/ et undefined locale -> /fr/a-propos/
      expect(getTranslatedPath('fr', '/about/', undefined)).toBe('/fr/a-propos/');
      // Sans specific translation: /unknown-path/ et undefined locale -> /fr/
      expect(getTranslatedPath('fr', '/unknown-path/', undefined)).toBe('/fr/');
    });

    it('should handle empty paths by returning root of target lang', () => {
      // '' (lang en) -> /fr/
      const result = getTranslatedPath('fr', '', 'en');
      expect(result).toBe('/fr/');
    });

    it('should preserve deep nested paths when switching from path with prefix', () => {
      // /en/products/electronics/phones (lang en) -> /fr/products/electronics/phones
      const result = getTranslatedPath('fr', '/en/products/electronics/phones', 'en');
      expect(result).toBe('/fr/products/electronics/phones');
    });
  });

  describe('Translations with prefixDefaultLocale: false routing rules', () => {
    it('should add prefix when switching from default locale (no prefix) to another locale', () => {
      expect(getTranslatedPath('fr', '/blog/', 'en')).toBe('/fr/blog/');     // /blog/ (en) -> /fr/blog/
      expect(getTranslatedPath('fr', '/blog', 'en')).toBe('/fr/blog/');       // /blog (en) -> /fr/blog/ (ajoute /)
      expect(getTranslatedPath('fr', '/', 'en')).toBe('/fr/');             // / (en) -> /fr/
    });

    it('should remove prefix when switching from another locale to default locale', () => {
      expect(getTranslatedPath('en', '/fr/blog/', 'fr')).toBe('/blog/');     // /fr/blog/ (fr) -> /blog/ (en)
      expect(getTranslatedPath('en', '/fr/blog', 'fr')).toBe('/blog');       // /fr/blog (fr) -> /blog (en)
      expect(getTranslatedPath('en', '/fr/', 'fr')).toBe('/');             // /fr/ (fr) -> / (en)
    });

    it('should correctly translate paths using specificPageTranslations with prefixDefaultLocale:false', () => {
      // Default (en, no prefix) to Fr (prefix)
      expect(getTranslatedPath('fr', '/contact/', 'en')).toBe('/fr/contact/'); // /contact/ (en) -> /fr/contact/
      expect(getTranslatedPath('fr', '/posts/', 'en')).toBe('/fr/posts/');     // /posts/ (en) -> /fr/posts/

      // Fr (prefix) to Default (en, no prefix)
      expect(getTranslatedPath('en', '/fr/contact/', 'fr')).toBe('/contact/'); // /fr/contact/ (fr) -> /contact/ (en)
      expect(getTranslatedPath('en', '/fr/posts/', 'fr')).toBe('/posts/');     // /fr/posts/ (fr) -> /posts/ (en)
    });

    it('should return current path if already in target default locale (no prefix)', () => {
      expect(getTranslatedPath('en', '/blog/', 'en')).toBe('/blog/');
      expect(getTranslatedPath('en', '/blog', 'en')).toBe('/blog');
      expect(getTranslatedPath('en', '/', 'en')).toBe('/');
    });

    it('should return current path if already in target non-default locale (prefixed)', () => {
      expect(getTranslatedPath('fr', '/fr/blog/', 'fr')).toBe('/fr/blog/');
      expect(getTranslatedPath('fr', '/fr/blog', 'fr')).toBe('/fr/blog');
      expect(getTranslatedPath('fr', '/fr/', 'fr')).toBe('/fr/');
    });

    it('should handle paths with trailing slash consistently', () => {
      // From default (no prefix) to other (adds prefix)
      expect(getTranslatedPath('fr', '/path-one', 'en')).toBe('/fr/path-one/'); // /path-one -> /fr/path-one/
      expect(getTranslatedPath('fr', '/path-two/', 'en')).toBe('/fr/path-two/'); // /path-two/ -> /fr/path-two/

      // From other (prefix) to default (removes prefix)
      expect(getTranslatedPath('en', '/fr/path-three', 'fr')).toBe('/path-three');   // /fr/path-three -> /path-three
      expect(getTranslatedPath('en', '/fr/path-four/', 'fr')).toBe('/path-four/'); // /fr/path-four/ -> /path-four/

      // Between two non-default locales (changes prefix)
      expect(getTranslatedPath('es', '/fr/path-five', 'fr')).toBe('/es/path-five');   // Assumes 'es' is a valid locale for the sake of testing the logic.
      expect(getTranslatedPath('es', '/fr/path-six/', 'fr')).toBe('/es/path-six/'); // This test would need 'es' in i18nConfig.locales for full validity.
                                                                                  // For now, it tests the path manipulation logic.
    });

    it('should correctly handle specific page path with or without trailing slash in input', () => {
      expect(getTranslatedPath('fr', '/about', 'en')).toBe('/fr/a-propos/'); // /about (en) -> /fr/a-propos/
      expect(getTranslatedPath('en', '/fr/a-propos', 'fr')).toBe('/about/');   // /fr/a-propos (fr) -> /about/
    });
  });
});

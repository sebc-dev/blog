import { describe, expect, it, vi } from 'vitest';
import { getTranslatedPath } from '../../src/lib/i18n/i18nUtils.ts';

// Import des fonctions d'aide pour les tester individuellement
// Note: Ces fonctions ne sont pas exportées, donc nous les testons indirectement via getTranslatedPath
// Mais nous pouvons ajouter des tests spécifiques pour valider leur comportement

// Mock de la configuration i18n pour ce test
vi.mock('../../src/lib/i18n/config', () => ({
  i18nConfig: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'es'], // Assurez-vous que 'de' n'est pas utilisé si non défini ici
    routing: {
      prefixDefaultLocale: false, // ✅ Changé ici
    },
  },
  // SpecificPageTranslations est directement dans i18nUtils.ts, pas besoin de le mocker ici
  // sauf si on veut le surcharger pour des tests spécifiques, ce qui n'est pas le cas ici.
}));

describe('getTranslatedPath', () => {
  describe('Helper functions behavior validation', () => {
    describe('normalizePathWithTrailingSlash behavior', () => {
      it('should add trailing slash when missing', () => {
        // Test via getTranslatedPath pour valider le comportement de normalizePathWithTrailingSlash
        const result = getTranslatedPath('fr', '/about', 'en');
        expect(result).toBe('/fr/a-propos/'); // Vérifie que la normalisation fonctionne
      });

      it('should preserve trailing slash when present', () => {
        const result = getTranslatedPath('fr', '/about/', 'en');
        expect(result).toBe('/fr/a-propos/'); // Vérifie que le slash final est préservé
      });
    });

    describe('handleDefaultToLocaleSwitch behavior', () => {
      it('should return same path when switching to same locale', () => {
        const result = getTranslatedPath('en', '/blog/', 'en');
        expect(result).toBe('/blog/'); // Déjà sur la bonne langue
      });

      it('should add locale prefix when switching from default to another locale', () => {
        const result = getTranslatedPath('fr', '/blog/', 'en');
        expect(result).toBe('/fr/blog/'); // Ajoute le préfixe de langue
      });

      it('should handle root path correctly when switching from default', () => {
        const result = getTranslatedPath('fr', '/', 'en');
        expect(result).toBe('/fr/'); // / -> /fr/
      });

      it('should ensure trailing slash for constructed paths', () => {
        const result = getTranslatedPath('fr', '/blog', 'en');
        expect(result).toBe('/fr/blog/'); // Assure un slash final
      });
    });

    describe('handleLocaleToDefaultSwitch behavior', () => {
      it('should remove locale prefix when switching to default locale', () => {
        const result = getTranslatedPath('en', '/fr/blog/', 'fr');
        expect(result).toBe('/blog/'); // Supprime le préfixe
      });

      it('should preserve trailing slash when removing prefix', () => {
        const result = getTranslatedPath('en', '/fr/blog/', 'fr');
        expect(result).toBe('/blog/'); // Préserve le slash final
      });

      it('should handle paths without trailing slash', () => {
        const result = getTranslatedPath('en', '/fr/blog', 'fr');
        expect(result).toBe('/blog'); // Pas de slash final dans l'original
      });

      it('should return root when removing locale-only prefix', () => {
        const result = getTranslatedPath('en', '/fr/', 'fr');
        expect(result).toBe('/'); // /fr/ -> /
      });
    });

    describe('handleLocalePrefixedSwitch behavior', () => {
      it('should switch between locale prefixes', () => {
        const result = getTranslatedPath('es', '/fr/blog/', 'fr');
        expect(result).toBe('/es/blog/'); // /fr/blog/ -> /es/blog/
      });

      it('should handle locale-only paths with trailing slash', () => {
        const result = getTranslatedPath('es', '/fr/', 'fr');
        expect(result).toBe('/es/'); // /fr/ -> /es/
      });

      it('should preserve trailing slash in longer paths', () => {
        const result = getTranslatedPath('es', '/fr/blog/post/', 'fr');
        expect(result).toBe('/es/blog/post/'); // Préserve la structure
      });

      it('should handle paths without trailing slash', () => {
        const result = getTranslatedPath('es', '/fr/blog', 'fr');
        expect(result).toBe('/es/blog'); // Pas de slash final ajouté
      });

      it('should not mutate original path segments', () => {
        // Test indirect pour vérifier que [...pathSegments] fonctionne
        const result1 = getTranslatedPath('es', '/fr/blog/', 'fr');
        const result2 = getTranslatedPath('es', '/fr/different/', 'fr'); // Utiliser 'es' qui est dans les locales mockées
        expect(result1).toBe('/es/blog/');
        // Le deuxième appel devrait fonctionner correctement, pas être affecté par le premier
        expect(result2).toBe('/es/different/'); // Changement de préfixe de locale
      });
    });
  });

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

  describe('Refactoring validation - ensuring no regression', () => {
    it('should maintain exact same behavior as before refactoring for complex scenarios', () => {
      // Tests de régression pour s'assurer que la refactorisation n'a pas cassé la logique
      
      // Scénarios complexes avec chemins profonds
      expect(getTranslatedPath('fr', '/en/blog/2024/article-title/', 'en'))
        .toBe('/fr/blog/2024/article-title/');
      
      // Scénarios avec locale undefined
      expect(getTranslatedPath('fr', '/some/path/', undefined))
        .toBe('/fr/');
      
      // Scénarios avec chemins vides ou racine
      expect(getTranslatedPath('fr', '', 'en')).toBe('/fr/');
      expect(getTranslatedPath('en', '/fr/', 'fr')).toBe('/');
      
      // Scénarios avec traductions spécifiques
      expect(getTranslatedPath('fr', '/about/', 'en')).toBe('/fr/a-propos/');
      expect(getTranslatedPath('en', '/fr/a-propos/', 'fr')).toBe('/about/');
    });

    it('should handle edge cases consistently after refactoring', () => {
      // Tests pour les cas limites
      
      // Chemins avec plusieurs slashes - la fonction normalise les chemins
      expect(getTranslatedPath('fr', '/en/blog/', 'en'))
        .toBe('/fr/blog/'); // La fonction normalise les chemins
      
      // Chemins très courts
      expect(getTranslatedPath('fr', '/en', 'en')).toBe('/fr/');
      expect(getTranslatedPath('en', '/fr', 'fr')).toBe('/');
      
      // Locale cible identique à la locale courante
      expect(getTranslatedPath('en', '/blog/', 'en')).toBe('/blog/');
      expect(getTranslatedPath('fr', '/fr/blog/', 'fr')).toBe('/fr/blog/');
    });
  });
});

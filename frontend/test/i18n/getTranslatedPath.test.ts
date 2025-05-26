import { describe, expect, it, vi } from 'vitest';
import { getTranslatedPath } from '../../src/lib/i18n/i18nUtils.ts';

// Mock uniquement pour ce test
vi.mock('../../src/lib/i18n/config', () => ({
  i18nConfig: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
}));

describe('getTranslatedPath', () => {
  describe('Basic path translation', () => {
    it('should replace locale prefix correctly', () => {
      const result = getTranslatedPath('fr', '/en/blog/', 'en');
      expect(result).toBe('/fr/blog/');
    });

    it('should handle specific translations', () => {
      const result = getTranslatedPath('fr', '/en/about/', 'en');
      expect(result).toBe('/fr/a-propos/');
    });

    it('should handle reverse translation', () => {
      const result = getTranslatedPath('en', '/fr/a-propos/', 'fr');
      expect(result).toBe('/en/about/');
    });
  });

  describe('Edge cases', () => {
    it('should handle root paths', () => {
      expect(getTranslatedPath('fr', '/en/', 'en')).toBe('/fr/');
      expect(getTranslatedPath('fr', '/en', 'en')).toBe('/fr');
    });

    it('should handle undefined current locale', () => {
      const result = getTranslatedPath('fr', '/about/', undefined);
      expect(result).toBe('/fr/');
    });

    it('should handle empty paths', () => {
      const result = getTranslatedPath('fr', '', 'en');
      expect(result).toBe('/fr/');
    });

    it('should preserve deep nested paths', () => {
      const result = getTranslatedPath('fr', '/en/products/electronics/phones', 'en');
      expect(result).toBe('/fr/products/electronics/phones');
    });
  });
});

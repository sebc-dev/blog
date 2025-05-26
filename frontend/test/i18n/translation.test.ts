import { describe, expect, it, beforeEach, vi } from 'vitest';
import { t } from '../../src/lib/i18n';

// Mocks directs pour les tests de traduction
vi.mock('../../src/lib/i18n/locales/en', () => ({
  default: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'article.readMore': 'Read More',
    'footer.copyright': '© 2024 All rights reserved',
    'nav.contact': 'Contact', // Clé présente en anglais
  },
}));

vi.mock('../../src/lib/i18n/locales/fr', () => ({
  default: {
    'nav.home': 'Accueil',
    'nav.blog': 'Blog',
    'nav.about': 'À propos', // Casse correcte
    'article.readMore': 'Lire la suite',
    'footer.copyright': '© 2024 Tous droits réservés',
    // 'nav.contact' n'existe pas en français - pour tester le fallback
  },
}));

vi.mock('../../src/lib/i18n/config', () => ({
  i18nConfig: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
}));

describe('Translation function (t)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should return correct translation for existing keys', () => {
      expect(t('nav.home', 'en')).toBe('Home');
      expect(t('nav.home', 'fr')).toBe('Accueil');
      expect(t('nav.about', 'en')).toBe('About');
      expect(t('nav.about', 'fr')).toBe('À propos');
    });
  });

  describe('Fallback cases', () => {
    it('should return fallback translation and warn when key is missing', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // @ts-expect-error clé de test non comprise dans le fichier de config de base : OK pour le test
      const result = t('nav.contact', 'fr'); // Existe en anglais mais pas en français

      expect(result).toBe('Contact');
      expect(warnSpy).toHaveBeenCalledWith(
        "Translation key 'nav.contact' not found for lang 'fr', using fallback."
      );

      warnSpy.mockRestore();
    });

    it('should return key when no translation exists anywhere', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // @ts-expect-error clé de test non comprise dans le fichier de config de base : OK pour le test
      const result = t('nav.unknown', 'fr'); // N'existe nulle part

      expect(result).toBe('nav.unknown');
      expect(errorSpy).toHaveBeenCalledWith(
        "Translation key 'nav.unknown' not found for lang 'fr' and no fallback available."
      );

      errorSpy.mockRestore();
    });
  });
});

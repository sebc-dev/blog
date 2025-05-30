import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useI18n } from '../../src/lib/i18n/i18nUtils';

// Mock de la configuration i18n
vi.mock('../../src/lib/i18n/config', () => ({
  i18nConfig: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'es'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
}));

// Mock des locales de traduction
vi.mock('../../src/lib/i18n/locales/en', () => ({
  default: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'article.readMore': 'Read More',
    'footer.copyright': '© 2024 All rights reserved',
  },
}));

vi.mock('../../src/lib/i18n/locales/fr', () => ({
  default: {
    'nav.home': 'Accueil',
    'nav.blog': 'Blog',
    'nav.about': 'À propos',
    'article.readMore': 'Lire la suite',
    'footer.copyright': '© 2024 Tous droits réservés',
  },
}));

describe('useI18n', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Avec la langue par défaut (en)', () => {
    it('devrait retourner les bonnes propriétés pour la langue par défaut', () => {
      const mockLocals = { currentLang: 'en' };
      
      const result = useI18n(mockLocals);

      expect(result.currentLang).toBe('en');
      expect(result.isDefaultLang).toBe(true);
      expect(result.otherLangs).toEqual(['fr', 'es']);
      expect(typeof result.t).toBe('function');
    });

    it('devrait fournir une fonction de traduction qui fonctionne correctement', () => {
      const mockLocals = { currentLang: 'en' };
      
      const { t } = useI18n(mockLocals);

      expect(t('nav.home')).toBe('Home');
      expect(t('nav.blog')).toBe('Blog');
      expect(t('nav.about')).toBe('About');
    });
  });

  describe('Avec une langue non-défaut (fr)', () => {
    it('devrait retourner les bonnes propriétés pour le français', () => {
      const mockLocals = { currentLang: 'fr' };
      
      const result = useI18n(mockLocals);

      expect(result.currentLang).toBe('fr');
      expect(result.isDefaultLang).toBe(false);
      expect(result.otherLangs).toEqual(['en', 'es']);
      expect(typeof result.t).toBe('function');
    });

    it('devrait fournir une fonction de traduction pour le français', () => {
      const mockLocals = { currentLang: 'fr' };
      
      const { t } = useI18n(mockLocals);

      expect(t('nav.home')).toBe('Accueil');
      expect(t('nav.blog')).toBe('Blog');
      expect(t('nav.about')).toBe('À propos');
    });
  });

  describe('Avec une langue non-mockée (es)', () => {
    it('devrait retourner les bonnes propriétés pour l\'espagnol', () => {
      const mockLocals = { currentLang: 'es' };
      
      const result = useI18n(mockLocals);

      expect(result.currentLang).toBe('es');
      expect(result.isDefaultLang).toBe(false);
      expect(result.otherLangs).toEqual(['en', 'fr']);
      expect(typeof result.t).toBe('function');
    });

    it('devrait utiliser le fallback en anglais pour les traductions manquantes', () => {
      const mockLocals = { currentLang: 'es' };
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const { t } = useI18n(mockLocals);

      // Comme l'espagnol n'est pas mocké, il devrait utiliser le fallback anglais
      expect(t('nav.home')).toBe('Home');
      expect(warnSpy).toHaveBeenCalledWith(
        "Translation key 'nav.home' not found for lang 'es', using fallback."
      );

      warnSpy.mockRestore();
    });
  });

  describe('Gestion des cas edge', () => {
    it('devrait gérer correctement les locals undefined/null', () => {
      const mockLocals = { currentLang: '' };
      
      const result = useI18n(mockLocals);

      expect(result.currentLang).toBe('');
      expect(result.isDefaultLang).toBe(false);
      expect(result.otherLangs).toEqual(['en', 'fr', 'es']);
    });

    it('devrait filtrer correctement la langue courante des autres langues', () => {
      const mockLocals = { currentLang: 'fr' };
      
      const result = useI18n(mockLocals);

      expect(result.otherLangs).not.toContain('fr');
      expect(result.otherLangs).toHaveLength(2);
    });

    it('devrait retourner toutes les langues comme autres langues si la langue courante n\'existe pas', () => {
      const mockLocals = { currentLang: 'invalid' };
      
      const result = useI18n(mockLocals);

      expect(result.otherLangs).toEqual(['en', 'fr', 'es']);
      expect(result.isDefaultLang).toBe(false);
    });
  });

  describe('Structure de retour', () => {
    it('devrait retourner un objet avec toutes les propriétés attendues', () => {
      const mockLocals = { currentLang: 'en' };
      
      const result = useI18n(mockLocals);

      expect(result).toHaveProperty('currentLang');
      expect(result).toHaveProperty('t');
      expect(result).toHaveProperty('isDefaultLang');
      expect(result).toHaveProperty('otherLangs');
      
      // Vérifier que l'objet a exactement ces 4 propriétés
      expect(Object.keys(result)).toHaveLength(4);
    });

    it('devrait retourner une fonction t qui est une closure de useTranslations', () => {
      const mockLocals = { currentLang: 'en' };
      
      const { t } = useI18n(mockLocals);

      // Vérifier que c'est bien une fonction
      expect(typeof t).toBe('function');
      
      // Vérifier qu'elle accepte un paramètre et retourne une string
      expect(typeof t('nav.home')).toBe('string');
    });
  });
}); 
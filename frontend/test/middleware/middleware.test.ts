import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequest } from '../../src/middleware';
import { createTestContext } from './helpers/test-context';

// Mock de la configuration i18n - défini directement inline
const defaultI18nConfig = {
  locales: ['fr', 'en', 'es'],
  defaultLocale: 'fr',
  routing: {
    prefixDefaultLocale: true
  }
};

let currentI18nConfig = { ...defaultI18nConfig };

vi.mock('../../src/lib/i18n/config.ts', () => ({
  get i18nConfig() {
    return currentI18nConfig;
  }
}));

// Mock de la configuration i18n - défini directement inline
vi.mock('../../src/lib/i18n/config.ts', () => ({
  i18nConfig: {
    locales: ['fr', 'en', 'es'],
    defaultLocale: 'fr',
    routing: {
      prefixDefaultLocale: true
    }
  }
}));

describe('Middleware i18n', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Réinitialiser la config par défaut avant chaque test
    currentI18nConfig = { ...defaultI18nConfig };
  });

  describe('Asset and API exclusion', () => {
    it('should bypass processing for assets', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/assets/style.css'
      });

      // Act
      const result = await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(mocks.redirect).not.toHaveBeenCalled();
      expect(context.locals).toEqual({}); // locals ne doit pas être modifié
      expect(result).toBeDefined(); // next() a été appelé et a retourné une Response
    });

    it('should bypass processing for API routes', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/api/users'
      });

      // Act
      const result = await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(mocks.redirect).not.toHaveBeenCalled();
      expect(context.locals).toEqual({}); // locals ne doit pas être modifié
      expect(result).toBeDefined(); // next() a été appelé et a retourné une Response
    });
  });

  describe('URL locale detection', () => {
    it('should detect valid locale in URL', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/fr/contact'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(mocks.redirect).not.toHaveBeenCalled(); // Pas de redirection car locale déjà présente
      expect(context.locals.currentLang).toBe('fr'); // La locale détectée est stockée
    });

    it('should handle URL without locale', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr/contact', 302); // Redirection vers la locale par défaut
      expect(mocks.next).not.toHaveBeenCalled(); // next() n'est pas appelé car redirection
    });

    it('should handle invalid locale in URL', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/xx/contact'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr/xx/contact', 302); // Redirection en préfixant avec la locale par défaut
      expect(mocks.next).not.toHaveBeenCalled();
    });

    it('should handle root URL', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr', 302); // Redirection vers la racine avec locale
      expect(mocks.next).not.toHaveBeenCalled();
    });
  });

  describe('Cookie preference handling', () => {
    it('should use valid locale from cookie', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact',
        cookies: { preferred_lang: 'en' }
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/en/contact', 302);
      expect(mocks.next).not.toHaveBeenCalled();
    });

    it('should fallback to default locale when cookie has invalid locale', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact',
        cookies: { preferred_lang: 'invalid' }
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr/contact', 302);
      expect(mocks.next).not.toHaveBeenCalled();
    });

    it('should fallback to default locale when no cookie is present', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact'
        // Pas de cookies
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr/contact', 302);
      expect(mocks.next).not.toHaveBeenCalled();
    });
  });

  describe('Accept-Language header parsing', () => {
    it('should use supported locale from Accept-Language header', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact',
        headers: { 'accept-language': 'en,fr;q=0.9' }
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/en/contact', 302);
      expect(mocks.next).not.toHaveBeenCalled();
    });

    it('should fallback to default locale when Accept-Language has unsupported locale', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact',
        headers: { 'accept-language': 'de,it;q=0.9' }
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr/contact', 302);
      expect(mocks.next).not.toHaveBeenCalled();
    });

    it('should handle complex Accept-Language header with qualities and variants', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact',
        headers: { 'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6' }
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/en/contact', 302); // Premier supporté dans la liste
      expect(mocks.next).not.toHaveBeenCalled();
    });

    it('should fallback to default locale when no Accept-Language header', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact'
        // Pas de header Accept-Language
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr/contact', 302);
      expect(mocks.next).not.toHaveBeenCalled();
    });
  });

  describe('Redirection logic', () => {
    it('should redirect from root to default locale', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr', 302);
      expect(mocks.next).not.toHaveBeenCalled();
    });

    it('should redirect from path without locale', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/about/team'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr/about/team', 302);
      expect(mocks.next).not.toHaveBeenCalled();
    });

    it('should not redirect when locale is already present in URL', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/en/about'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(mocks.redirect).not.toHaveBeenCalled();
      expect(context.locals.currentLang).toBe('en');
    });

    it('should not redirect when prefixDefaultLocale is false', async () => {
      // Arrange
      // Modifier la config pour ce test
      currentI18nConfig = {
        ...currentI18nConfig,
        routing: {
          prefixDefaultLocale: false
        }
      };

      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(mocks.redirect).not.toHaveBeenCalled();
      expect(context.locals.currentLang).toBe('fr'); // Langue par défaut stockée
    });

    it('should handle double slashes in redirection', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com//contact//page'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.redirect).toHaveBeenCalledWith('/fr/contact/page', 302); // Doubles slashes normalisés
      expect(mocks.next).not.toHaveBeenCalled();
    });

    it('should prevent redirect loops', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/fr' // URL qui correspondrait déjà au résultat de redirection
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce(); // Pas de redirection car locale valide déjà présente
      expect(mocks.redirect).not.toHaveBeenCalled();
      expect(context.locals.currentLang).toBe('fr');
    });
  });

  describe('Locals storage', () => {
    it('should store currentLang based on URL locale', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/es/productos'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(context.locals.currentLang).toBe('es'); // Locale de l'URL
      expect(mocks.redirect).not.toHaveBeenCalled();
    });

    it('should store currentLang based on preference when no URL locale', async () => {
      // Test avec prefixDefaultLocale = false pour éviter la redirection
      currentI18nConfig = {
        ...currentI18nConfig,
        routing: {
          prefixDefaultLocale: false
        }
      };

      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/contact',
        cookies: { preferred_lang: 'en' }
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(context.locals.currentLang).toBe('en'); // Langue préférée du cookie
      expect(mocks.redirect).not.toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequest } from '../../src/middleware';
import { createTestContext } from './helpers/test-context';

// Mock de la configuration i18n
vi.mock('../../src/lib/i18n/config.ts', () => ({
  i18nConfig: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false
    }
  }
}));

// Mock du module i18n avec une factory function
vi.mock('../../src/lib/i18n', () => {
  const mockLangFromUrl = vi.fn();
  return {
    getLangFromUrl: mockLangFromUrl
  };
});

// Récupérer la référence mockée après le mock
const { getLangFromUrl } = await vi.importMock('../../src/lib/i18n') as { getLangFromUrl: ReturnType<typeof vi.fn> };

describe('Middleware i18n', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Comportement par défaut : retourner 'en' comme langue par défaut
    getLangFromUrl.mockReturnValue('en');
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
      expect(context.locals).toEqual({}); // Locals ne doit pas être modifié
      expect(getLangFromUrl).not.toHaveBeenCalled(); // La fonction ne doit pas être appelée
      expect(result).toBeDefined(); // Next() a été appelé et a retourné une Response
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
      expect(context.locals).toEqual({}); // Locals ne doit pas être modifié
      expect(getLangFromUrl).not.toHaveBeenCalled(); // La fonction ne doit pas être appelée
      expect(result).toBeDefined(); // Next() a été appelé et a retourné une Response
    });

    it('should bypass processing for nested asset paths', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/assets/images/logo.png'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(getLangFromUrl).not.toHaveBeenCalled();
    });

    it('should bypass processing for nested API paths', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/api/v1/users/123'
      });

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(getLangFromUrl).not.toHaveBeenCalled();
    });
  });

  describe('Language detection and storage', () => {
    it('should call getLangFromUrl with correct URL for regular pages', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'https://example.com/fr/contact'
      });
      getLangFromUrl.mockReturnValue('fr');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(getLangFromUrl).toHaveBeenCalledWith(expect.objectContaining({
        pathname: '/fr/contact'
      }));
      expect(context.locals.currentLang).toBe('fr');
    });

    it('should store detected language in locals.currentLang', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'https://example.com/en/about'
      });
      getLangFromUrl.mockReturnValue('en');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(context.locals.currentLang).toBe('en');
    });

    it('should handle URLs without language prefix', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'https://example.com/contact'
      });
      getLangFromUrl.mockReturnValue('en'); // Fonction retourne la langue par défaut

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(getLangFromUrl).toHaveBeenCalledWith(expect.objectContaining({
        pathname: '/contact'
      }));
      expect(context.locals.currentLang).toBe('en');
    });

    it('should handle root URL', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'https://example.com/'
      });
      getLangFromUrl.mockReturnValue('en');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(getLangFromUrl).toHaveBeenCalledWith(expect.objectContaining({
        pathname: '/'
      }));
      expect(context.locals.currentLang).toBe('en');
    });

    it('should handle invalid language codes gracefully', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'https://example.com/xx/invalid'
      });
      getLangFromUrl.mockReturnValue('en'); // Fonction retourne la langue par défaut pour une langue invalide

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(context.locals.currentLang).toBe('en');
    });

    it('should handle complex URL paths', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'https://example.com/fr/blog/2024/01/article-titre'
      });
      getLangFromUrl.mockReturnValue('fr');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(getLangFromUrl).toHaveBeenCalledWith(expect.objectContaining({
        pathname: '/fr/blog/2024/01/article-titre'
      }));
      expect(context.locals.currentLang).toBe('fr');
    });

    it('should handle URLs with query parameters and fragments', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'https://example.com/fr/page?param=value#section'
      });
      getLangFromUrl.mockReturnValue('fr');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(getLangFromUrl).toHaveBeenCalledWith(expect.objectContaining({
        pathname: '/fr/page'
      }));
      expect(context.locals.currentLang).toBe('fr');
    });
  });

  describe('Middleware flow', () => {
    it('should always call next() after processing', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/fr/test'
      });
      getLangFromUrl.mockReturnValue('fr');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
    });

    it('should return the result of next()', async () => {
      // Arrange
      const expectedResponse = new Response('test response');
      const { context, next } = createTestContext({
        url: 'https://example.com/test'
      });
      next.mockReturnValue(Promise.resolve(expectedResponse));

      // Act
      const result = await onRequest(context as any, next);

      // Assert
      expect(result).toBe(expectedResponse);
    });

    it('should not interfere with request processing', async () => {
      // Arrange
      const { context, next, mocks } = createTestContext({
        url: 'https://example.com/fr/contact'
      });
      getLangFromUrl.mockReturnValue('fr');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(mocks.next).toHaveBeenCalledOnce();
      expect(context.locals.currentLang).toBe('fr');
      // Le middleware ne doit pas modifier l'URL ou faire de redirections
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with double slashes', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'https://example.com//fr//contact//'
      });
      getLangFromUrl.mockReturnValue('fr');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(getLangFromUrl).toHaveBeenCalledWith(expect.objectContaining({
        pathname: '//fr//contact//'
      }));
      expect(context.locals.currentLang).toBe('fr');
    });

    it('should handle empty pathname edge case', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'https://example.com'
      });
      getLangFromUrl.mockReturnValue('en');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(context.locals.currentLang).toBe('en');
    });

    it('should handle localhost URLs correctly', async () => {
      // Arrange
      const { context, next } = createTestContext({
        url: 'http://localhost:4321/fr/development'
      });
      getLangFromUrl.mockReturnValue('fr');

      // Act
      await onRequest(context as any, next);

      // Assert
      expect(context.locals.currentLang).toBe('fr');
    });
  });
});

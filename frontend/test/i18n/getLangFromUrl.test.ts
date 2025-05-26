import { describe, expect, it, vi } from 'vitest';
import { getLangFromUrl } from '../../src/lib/i18n/i18nUtils.ts';

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

describe('getLangFromUrl', () => {
  it('should return the language identifier from the URL path', () => {
    const url = new URL('https://example.com/fr/some-path');
    const result = getLangFromUrl(url);
    expect(result).toBe('fr');
  });

  it('should return the default locale if language identifier is missing', () => {
    const url = new URL('https://example.com/some-path');
    const result = getLangFromUrl(url);
    expect(result).toBe('en');
  });

  it('should handle trailing slash in the URL path', () => {
    const url = new URL('https://example.com/fr/');
    const result = getLangFromUrl(url);
    expect(result).toBe('fr');
  });

  it('should handle empty path and return default locale', () => {
    const url = new URL('https://example.com/');
    const result = getLangFromUrl(url);
    expect(result).toBe('en');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { getLangFromUrl } from '../../src/lib/i18n';

// Mock de la configuration i18n
vi.mock('../../src/lib/i18n/config', () => ({
  i18nConfig: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
}));

describe('getLangFromUrl', () => {
  it('devrait retourner la langue française depuis le chemin URL', () => {
    const url = new URL('https://example.com/fr/some-path');
    const result = getLangFromUrl(url);
    expect(result).toBe('fr');
  });

  it('devrait retourner la langue anglaise depuis le chemin URL', () => {
    const url = new URL('https://example.com/en/some-path');
    const result = getLangFromUrl(url);
    expect(result).toBe('en');
  });

  it('devrait retourner la langue par défaut si aucun identifiant de langue valide', () => {
    const url = new URL('https://example.com/some-path');
    const result = getLangFromUrl(url);
    expect(result).toBe('en');
  });

  it('devrait gérer les slashes finaux dans le chemin URL', () => {
    const url = new URL('https://example.com/fr/');
    const result = getLangFromUrl(url);
    expect(result).toBe('fr');
  });

  it('devrait gérer le chemin vide et retourner la langue par défaut', () => {
    const url = new URL('https://example.com/');
    const result = getLangFromUrl(url);
    expect(result).toBe('en');
  });

  it('devrait gérer les slashes multiples dans le chemin', () => {
    const url = new URL('https://example.com///fr///some-path//');
    const result = getLangFromUrl(url);
    expect(result).toBe('fr');
  });

  it('devrait retourner la langue par défaut pour une langue non supportée', () => {
    const url = new URL('https://example.com/es/some-path');
    const result = getLangFromUrl(url);
    expect(result).toBe('en');
  });

  it('devrait gérer les chemins avec des segments complexes', () => {
    const url = new URL('https://example.com/fr/blog/2024/01/article-titre');
    const result = getLangFromUrl(url);
    expect(result).toBe('fr');
  });

  it('devrait retourner la langue par défaut pour les chemins commençant par un segment non-langue', () => {
    const url = new URL('https://example.com/api/v1/data');
    const result = getLangFromUrl(url);
    expect(result).toBe('en');
  });

  it('devrait gérer les chemins avec query parameters et fragments', () => {
    const url = new URL('https://example.com/fr/page?param=value#section');
    const result = getLangFromUrl(url);
    expect(result).toBe('fr');
  });

  it('devrait être insensible aux espaces dans le chemin après trim', () => {
    const url = new URL('https://example.com/fr/some-path  ');
    const result = getLangFromUrl(url);
    expect(result).toBe('fr');
  });

  it('devrait gérer les codes de langue en majuscules (cas non supporté)', () => {
    const url = new URL('https://example.com/FR/some-path');
    const result = getLangFromUrl(url);
    expect(result).toBe('en'); // FR n'est pas dans les locales supportées (en lowercase)
  });
});

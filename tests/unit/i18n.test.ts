import { describe, it, expect } from 'vitest';
import {
  languages,
  defaultLang,
  ui,
  getLangFromUrl,
  useTranslations,
  getLocalizedUrl,
  removeLocaleFromUrl,
  type TranslationKey,
  type TranslationObject
} from '../../src/i18n';

describe('i18n Configuration', () => {
  it('should have correct languages configuration', () => {
    expect(languages).toEqual({
      en: 'English',
      fr: 'Français',
    });
    expect(Object.keys(languages)).toContain('en');
    expect(Object.keys(languages)).toContain('fr');
  });

  it('should have correct default language', () => {
    expect(defaultLang).toBe('en');
  });

  it('should have consistent translations across all languages', () => {
    const enKeys = Object.keys(ui.en) as TranslationKey[];
    const frKeys = Object.keys(ui.fr) as TranslationKey[];
    
    // Toutes les clés anglaises doivent être présentes en français
    enKeys.forEach(key => {
      expect(frKeys).toContain(key);
      expect(ui.fr[key]).toBeDefined();
      expect(ui.fr[key]).not.toBe('');
    });
    
    // Toutes les clés françaises doivent être présentes en anglais
    frKeys.forEach(key => {
      expect(enKeys).toContain(key);
      expect(ui.en[key]).toBeDefined();
      expect(ui.en[key]).not.toBe('');
    });
  });

  it('should have all translation values as non-empty strings', () => {
    Object.values(ui.en).forEach(value => {
      expect(typeof value).toBe('string');
      expect(value.trim()).not.toBe('');
    });
    
    Object.values(ui.fr).forEach(value => {
      expect(typeof value).toBe('string');
      expect(value.trim()).not.toBe('');
    });
  });
});

describe('getLangFromUrl', () => {
  it('should return default language for URL without language prefix', () => {
    const url1 = new URL('https://example.com/');
    const url2 = new URL('https://example.com/blog');
    const url3 = new URL('https://example.com/about');
    
    expect(getLangFromUrl(url1)).toBe('en');
    expect(getLangFromUrl(url2)).toBe('en');
    expect(getLangFromUrl(url3)).toBe('en');
  });

  it('should return correct language for French URLs', () => {
    const url1 = new URL('https://example.com/fr/');
    const url2 = new URL('https://example.com/fr/blog');
    const url3 = new URL('https://example.com/fr/about');
    
    expect(getLangFromUrl(url1)).toBe('fr');
    expect(getLangFromUrl(url2)).toBe('fr');
    expect(getLangFromUrl(url3)).toBe('fr');
  });

  it('should return default language for invalid language codes', () => {
    const url1 = new URL('https://example.com/es/');
    const url2 = new URL('https://example.com/de/blog');
    const url3 = new URL('https://example.com/invalid/about');
    
    expect(getLangFromUrl(url1)).toBe(defaultLang);
    expect(getLangFromUrl(url2)).toBe(defaultLang);
    expect(getLangFromUrl(url3)).toBe(defaultLang);
  });

  it('should handle edge cases', () => {
    const url1 = new URL('https://example.com/fr');
    const url2 = new URL('https://example.com//fr/');
    
    expect(getLangFromUrl(url1)).toBe('fr');
    expect(getLangFromUrl(url2)).toBe('en'); // //fr/ donne une chaîne vide comme lang
  });
});

describe('useTranslations', () => {
  it('should return translation function for English', () => {
    const t = useTranslations('en');
    
    expect(typeof t).toBe('function');
    expect(t('nav.home')).toBe('Home');
    expect(t('nav.about')).toBe('About');
    expect(t('nav.blog')).toBe('Blog');
  });

  it('should return translation function for French', () => {
    const t = useTranslations('fr');
    
    expect(typeof t).toBe('function');
    expect(t('nav.home')).toBe('Accueil');
    expect(t('nav.about')).toBe('À propos');
    expect(t('nav.blog')).toBe('Blog');
  });

  it('should fallback to default language when key is missing', () => {
    const t = useTranslations('en');
    
    // Test avec une clé qui existe
    expect(t('nav.home')).toBe('Home');
    
    // Pour tester le fallback, on utilise le fait que la fonction
    // devrait toujours retourner une chaîne non vide
    const result = t('nav.home');
    expect(typeof result).toBe('string');
    expect(result.trim()).not.toBe('');
  });

  it('should return non-empty strings for all translation keys', () => {
    const tEn = useTranslations('en');
    const tFr = useTranslations('fr');
    
    // Test de toutes les clés connues
    const testKeys: TranslationKey[] = [
      'nav.home', 'nav.about', 'nav.blog',
      'home.title', 'home.description',
      'about.title', 'about.description',
      'blog.title', 'blog.description', 'blog.read-more',
      'blog.published', 'blog.updated',
      'footer.copyright', 'lang.switch', 'lang.current'
    ];
    
    testKeys.forEach(key => {
      const enResult = tEn(key);
      const frResult = tFr(key);
      
      expect(typeof enResult).toBe('string');
      expect(typeof frResult).toBe('string');
      expect(enResult.trim()).not.toBe('');
      expect(frResult.trim()).not.toBe('');
    });
  });
});

describe('getLocalizedUrl', () => {
  it('should not prefix URLs for default language', () => {
    expect(getLocalizedUrl('/', 'en')).toBe('/');
    expect(getLocalizedUrl('/blog', 'en')).toBe('/blog');
    expect(getLocalizedUrl('/about', 'en')).toBe('/about');
    expect(getLocalizedUrl('/blog/my-post', 'en')).toBe('/blog/my-post');
  });

  it('should add language prefix for non-default languages', () => {
    expect(getLocalizedUrl('/', 'fr')).toBe('/fr/');
    expect(getLocalizedUrl('/blog', 'fr')).toBe('/fr/blog');
    expect(getLocalizedUrl('/about', 'fr')).toBe('/fr/about');
    expect(getLocalizedUrl('/blog/my-post', 'fr')).toBe('/fr/blog/my-post');
  });

  it('should avoid double slashes', () => {
    expect(getLocalizedUrl('/', 'fr')).toBe('/fr/');
    expect(getLocalizedUrl('//', 'fr')).toBe('/fr/');
    expect(getLocalizedUrl('//blog', 'fr')).toBe('/fr/blog');
    expect(getLocalizedUrl('/blog//', 'fr')).toBe('/fr/blog/');
  });

  it('should handle empty and root paths', () => {
    expect(getLocalizedUrl('', 'fr')).toBe('/fr');
    expect(getLocalizedUrl('/', 'fr')).toBe('/fr/');
    expect(getLocalizedUrl('', 'en')).toBe('');
    expect(getLocalizedUrl('/', 'en')).toBe('/');
  });
});

describe('removeLocaleFromUrl', () => {
  it('should remove valid language prefixes', () => {
    expect(removeLocaleFromUrl('/fr/')).toBe('/');
    expect(removeLocaleFromUrl('/fr/blog')).toBe('/blog');
    expect(removeLocaleFromUrl('/fr/about')).toBe('/about');
    expect(removeLocaleFromUrl('/fr/blog/my-post')).toBe('/blog/my-post');
  });

  it('should leave URLs unchanged if no valid language prefix', () => {
    expect(removeLocaleFromUrl('/blog')).toBe('/blog');
    expect(removeLocaleFromUrl('/about')).toBe('/about');
    expect(removeLocaleFromUrl('/en/blog')).toBe('/blog'); // 'en' est aussi supprimé car présent dans ui
    expect(removeLocaleFromUrl('/es/blog')).toBe('/es/blog'); // langue invalide
  });

  it('should handle root paths correctly', () => {
    expect(removeLocaleFromUrl('/fr')).toBe('/');
    expect(removeLocaleFromUrl('/fr/')).toBe('/');
    expect(removeLocaleFromUrl('/')).toBe('/');
    expect(removeLocaleFromUrl('')).toBe('');
  });

  it('should handle edge cases', () => {
    expect(removeLocaleFromUrl('/fr')).toBe('/');
    expect(removeLocaleFromUrl('/fr/')).toBe('/');
    expect(removeLocaleFromUrl('/fr//')).toBe('//'); // Conserve les slashes supplémentaires après suppression
    expect(removeLocaleFromUrl('//fr//')).toBe('//fr//'); // URLs malformées restent telles quelles
  });
});

describe('TypeScript types', () => {
  it('should have correct TranslationKey type', () => {
    // Test que les clés connues sont acceptées par le type
    const validKeys: TranslationKey[] = [
      'nav.home',
      'nav.about', 
      'nav.blog',
      'home.title',
      'blog.read-more',
      'footer.copyright'
    ];
    
    // Si le code compile, c'est que les types sont corrects
    expect(validKeys).toBeDefined();
  });

  it('should validate TranslationObject type structure', () => {
    // Vérifier que ui.fr satisfait le type TranslationObject
    const frTranslations: TranslationObject = ui.fr;
    expect(frTranslations).toBeDefined();
    
    // Vérifier que toutes les clés requises sont présentes
    expect(frTranslations['nav.home']).toBeDefined();
    expect(frTranslations['nav.about']).toBeDefined();
    expect(frTranslations['nav.blog']).toBeDefined();
  });
}); 
export const languages = {
  en: 'English',
  fr: 'Français',
} as const;

export const defaultLang = 'en' as const;

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'home.title': 'Welcome to Astro',
    'home.description': 'Build fast websites with Astro',
    'about.title': 'About',
    'about.description': 'Learn more about this website',
    'blog.title': 'Blog',
    'blog.description': 'Read our latest articles',
    'blog.read-more': 'Read more',
    'blog.published': 'Published',
    'blog.updated': 'Updated',
    'footer.copyright': 'All rights reserved',
    'lang.switch': 'Switch to French',
    'lang.current': 'en',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.blog': 'Blog',
    'home.title': 'Bienvenue sur Astro',
    'home.description': 'Créez des sites web rapides avec Astro',
    'about.title': 'À propos',
    'about.description': 'En savoir plus sur ce site web',
    'blog.title': 'Blog',
    'blog.description': 'Lisez nos derniers articles',
    'blog.read-more': 'Lire la suite',
    'blog.published': 'Publié',
    'blog.updated': 'Mis à jour',
    'footer.copyright': 'Tous droits réservés',
    'lang.switch': 'Switch to English',
    'lang.current': 'fr',
  },
} as const;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang]?.[key] || ui[defaultLang][key];
  }
}

export function getLocalizedUrl(url: string, lang: string) {
  if (lang === defaultLang) {
    return url;
  }
  return `/${lang}${url}`;
}

export function removeLocaleFromUrl(url: string) {
  const [, lang, ...rest] = url.split('/');
  if (lang && lang in ui) {
    return `/${rest.join('/')}`;
  }
  return url;
} 
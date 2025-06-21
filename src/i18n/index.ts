export const languages = {
  en: "English",
  fr: "Français",
} as const;

export const defaultLang = "en" as const;

// Define the base translation object structure
const enTranslations = {
  "nav.home": "Home",
  "nav.about": "About",
  "nav.blog": "Blog",
  "home.title": "Welcome to Astro",
  "home.description": "Build fast websites with Astro",
  "about.title": "About",
  "about.description": "Learn more about this website",
  "blog.title": "Blog",
  "blog.description": "Read our latest articles",
  "blog.read-more": "Read more",
  "blog.published": "Published",
  "blog.updated": "Updated",
  "footer.copyright": "All rights reserved",
  "lang.switch": "Switch to French",
  "lang.current": "en",
} as const;

// Type alias for translation keys
export type TranslationKey = keyof typeof enTranslations;

// Type for translation objects that must have all the same keys as English
export type TranslationObject = Record<TranslationKey, string>;

export const ui = {
  en: enTranslations,
  fr: {
    "nav.home": "Accueil",
    "nav.about": "À propos",
    "nav.blog": "Blog",
    "home.title": "Bienvenue sur Astro",
    "home.description": "Créez des sites web rapides avec Astro",
    "about.title": "À propos",
    "about.description": "En savoir plus sur ce site web",
    "blog.title": "Blog",
    "blog.description": "Lisez nos derniers articles",
    "blog.read-more": "Lire la suite",
    "blog.published": "Publié",
    "blog.updated": "Mis à jour",
    "footer.copyright": "Tous droits réservés",
    "lang.switch": "Switch to English",
    "lang.current": "fr",
  } satisfies TranslationObject,
} as const;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (lang && lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations<L extends keyof typeof ui>(lang: L) {
  return function t(key: keyof (typeof ui)[L]): string {
    return (ui[lang]?.[key] ||
      ui[defaultLang][key as keyof (typeof ui)[typeof defaultLang]]) as string;
  };
}

export function getLocalizedUrl(url: string, lang: string) {
  if (lang === defaultLang) {
    return url;
  }
  const localizedUrl = `/${lang}${url}`;
  return localizedUrl.replace(/\/{2,}/g, "/");
}

export function removeLocaleFromUrl(url: string) {
  const [, lang, ...rest] = url.split("/");
  if (lang && lang in ui) {
    const path = rest.join("/");
    return path ? `/${path}` : "/";
  }
  return url;
}

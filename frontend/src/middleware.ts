import { defineMiddleware } from 'astro:middleware';
import { i18nConfig } from './lib/i18n/config.ts';

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, request, redirect, locals } = context;
  const url = new URL(request.url);

  // Éviter le traitement pour les assets ou les fichiers API
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/api/')) {
    return next();
  }

  const pathSegments = url.pathname.split('/').filter(Boolean);
  // Correction erreur ligne 15 : vérifier le premier segment, pas le tableau entier
  const currentUrlLocale = pathSegments.length > 0 && i18nConfig.locales.includes(pathSegments[0]) ? pathSegments[0] : null;

  let preferredLang = cookies.get('preferred_lang')?.value;

  if (!preferredLang) {
    const acceptLanguageHeader = request.headers.get('accept-language');
    if (acceptLanguageHeader) {
      // Correction erreur ligne 22 : traiter chaque langue individuellement
      const langs = acceptLanguageHeader
        .split(',')
        .map(lang => lang.split(';')[0].toLowerCase().split('-')[0]) // Prendre seulement la première partie
        .filter(lang => typeof lang === 'string'); // S'assurer que c'est une chaîne

      preferredLang = langs.find(lang => i18nConfig.locales.includes(lang));
    }
  }

  // Utiliser la langue par défaut si aucune préférence n'est trouvée ou supportée
  preferredLang = preferredLang && i18nConfig.locales.includes(preferredLang) ? preferredLang : i18nConfig.defaultLocale;

  // Logique de redirection RÉVISÉE (voir AC3)
  // On redirige seulement si prefixDefaultLocale est activé ET qu'il n'y a pas de locale valide dans l'URL actuelle.
  // On NE redirige PAS si une locale valide est déjà dans l'URL (respect du choix explicite de l'utilisateur).
  if (
    i18nConfig.routing.prefixDefaultLocale &&
    !currentUrlLocale // Aucune locale valide dans l'URL (ex: /, /contact, ou /langue-invalide/contact)
  ) {
    let newPathname;
    // Si le chemin est la racine, ou commence par un segment qui n'est pas une locale valide,
    // on construit le nouveau chemin en préfixant avec la langue préférée.
    const basePath = url.pathname === '/' ? '' : url.pathname; // Pour la racine, basePath est vide, sinon c'est le chemin complet.
    newPathname = `/${preferredLang}${basePath}`;

    // Normaliser les doubles slashs (ex: /fr//path -> /fr/path) et s'assurer que la racine est juste /lang/
    newPathname = newPathname.replace(/\/\//g, '/');
    if (newPathname !== `/${preferredLang}` && newPathname.endsWith('/')) {
      newPathname = newPathname.slice(0, -1); // Éviter slash final sauf si c'est /<lang>/
    }

    if (basePath === '' && newPathname === `/${preferredLang}/`) {
      newPathname = `/${preferredLang}`;
    }

    if (newPathname !== url.pathname) { // S'assurer qu'on ne redirige pas vers la même URL
      const destinationUrl = new URL(newPathname, url.origin);
      // Prévention de boucle simple : vérifier que l'URL de destination finale est différente
      if (destinationUrl.href !== url.href) {
        return redirect(newPathname, 302); // 302 Found (temporaire) ou 307
      }
    }
  }

  // Stocker la langue pour usage dans les pages/layouts via locals.
  // Si currentUrlLocale est défini, c'est la langue de la page. Sinon, c'est la langue préférée.
  // Correction erreur ligne 65 : s'assurer que preferredLang est une chaîne
  locals.currentLang = currentUrlLocale || preferredLang || i18nConfig.defaultLocale;
  // N'oubliez pas de déclarer `currentLang` dans `src/env.d.ts` pour App.Locals

  return next();
});

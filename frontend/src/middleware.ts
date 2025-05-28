import { defineMiddleware } from 'astro:middleware';
import { getLangFromUrl } from './lib/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals } = context;
  const url = new URL(request.url);

  // Éviter le traitement pour les assets ou les fichiers API
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/api/')) {
    return next();
  }

  // Utiliser la fonction existante pour déterminer la langue
  locals.currentLang = getLangFromUrl(url);

  return next();
});

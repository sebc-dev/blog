import { defineMiddleware } from 'astro:middleware';
import { getLangFromUrl } from './lib/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals } = context;
  const url = new URL(request.url);

  // Éviter le traitement pour les assets, fichiers API et ressources statiques
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.startsWith('/api/') ||
      url.pathname === '/favicon.ico' ||
      url.pathname === '/robots.txt' ||
      /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/i.test(url.pathname)) {
    return next();
  }

  // Utiliser la fonction existante pour déterminer la langue
  locals.currentLang = getLangFromUrl(url);

  return next();
});

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { i18nConfig } from './src/lib/i18n/config.ts';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: process.env.SITE_URL || 'https://votresite.com', // ✅ Utilise la variable d'environnement SITE_URL
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: true, // Important pour Docker sur certains systèmes
        interval: 100, // Intervalle de polling réduit
      },
    },
  },
  integrations: [mdx()],
  i18n: i18nConfig
});

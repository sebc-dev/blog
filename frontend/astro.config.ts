import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
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
});

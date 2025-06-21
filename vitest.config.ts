import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';
import { resolve } from 'path';

export default defineConfig(
  getViteConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['./tests/**/*.{test,spec}.{js,ts}'],
      exclude: ['node_modules', 'dist', '.astro'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'dist/',
          '.astro/',
          'tests/',
          'cypress/',
          '**/*.config.*',
          '**/*.d.ts'
        ]
      },
      // Timeout étendu pour les tests de build
      testTimeout: 30000,
      hookTimeout: 30000
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@tests': resolve(__dirname, './tests'),
        // Alias pour les imports Astro
        'astro:content': resolve(__dirname, './tests/mocks/astro-content.ts'),
        'astro:assets': resolve(__dirname, './tests/mocks/astro-assets.ts')
      }
    }
  })
); 
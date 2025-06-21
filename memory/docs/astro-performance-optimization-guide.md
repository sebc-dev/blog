# Guide d'Optimisation des Performances Astro pour Score Lighthouse 100

## Vue d'ensemble
Guide complet des bonnes pratiques pour optimiser une application Astro statique et atteindre un score Lighthouse parfait (100/100) basé sur les dernières recommandations 2024/2025.

**Stack analysée :** Astro 5.x + TailwindCSS + DaisyUI + i18n

## Métriques Core Web Vitals à optimiser

### 1. Largest Contentful Paint (LCP) - Objectif : ≤ 2.5s
**Stratégies spécifiques Astro :**

#### A. Optimisation des images (Critical)
```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<!-- ✅ Image héro avec priorité -->
<Image 
  src={heroImage} 
  alt="Description" 
  priority
  fetchpriority="high"
  loading="eager"
  decoding="sync"
/>
```

#### B. Configuration Astro optimisée
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://your-domain.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro'
  },
  image: {
    domains: ['your-cdn.com'],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false
      }
    }
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 1024, // Inline assets < 1KB
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  }
});
```

#### C. Preload des ressources critiques
```astro
---
// Dans BaseLayout.astro
---
<head>
  <!-- Preload fonts critiques -->
  <link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- Preload LCP image si statique -->
  <link rel="preload" as="image" href="/hero-image.webp" fetchpriority="high">
  
  <!-- DNS prefetch pour CDN -->
  <link rel="dns-prefetch" href="//cdn.example.com">
  
  <!-- Preconnect pour domaines externes -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
</head>
```

#### D. Éviter le lazy loading pour LCP
```astro
<!-- ❌ Ne pas lazy loader l'élément LCP -->
<Image src={hero} loading="lazy" alt="Hero" />

<!-- ✅ Charger immédiatement l'élément LCP -->
<Image src={hero} priority alt="Hero" />
```

### 2. Cumulative Layout Shift (CLS) - Objectif : ≤ 0.1

#### A. Dimensions d'images explicites
```astro
---
import { Image } from 'astro:assets';
---

<!-- ✅ Dimensions explicites pour éviter les shifts -->
<Image 
  src={image} 
  width={800} 
  height={600} 
  alt="Description"
  style="aspect-ratio: 800/600;"
/>
```

#### B. Réserver l'espace pour le contenu dynamique
```css
/* Placeholder pour contenu dynamique */
.content-placeholder {
  min-height: 200px; /* Réserver l'espace */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Éviter les animations qui causent des shifts */
.smooth-transition {
  transition: transform 0.3s ease;
  /* Éviter : transition: all 0.3s ease; */
}
```

#### C. Optimisation des Web Fonts
```astro
<head>
  <!-- Font display: swap pour éviter FOIT -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  
  <style>
    @font-face {
      font-family: 'MainFont';
      src: url('/fonts/main.woff2') format('woff2');
      font-display: swap; /* Critical pour CLS */
      size-adjust: 100%;
    }
  </style>
</head>
```

### 3. Interaction to Next Paint (INP) - Objectif : ≤ 200ms

#### A. Optimisation JavaScript
```astro
---
// Utiliser des scripts côté client uniquement si nécessaire
---

<!-- ✅ Script avec directive appropriée -->
<script>
  // Code minimal côté client
  document.addEventListener('DOMContentLoaded', () => {
    // Code essentiel uniquement
  });
</script>

<!-- ✅ Pour DaisyUI, utiliser les composants natifs -->
<div class="dropdown">
  <div tabindex="0" role="button" class="btn">Click</div>
  <ul class="dropdown-content menu">
    <li><a>Item 1</a></li>
  </ul>
</div>
```

#### B. Optimisation DOM
```astro
---
// Réduire la complexité du DOM
// Éviter les composants trop imbriqués
---

<!-- ✅ Structure DOM optimisée -->
<article class="prose max-w-none">
  <h1 class="text-3xl font-bold">{title}</h1>
  <div class="content" set:html={content} />
</article>

<!-- ❌ Éviter la sur-imbrication -->
<div class="container">
  <div class="wrapper">
    <div class="inner">
      <div class="content">...</div>
    </div>
  </div>
</div>
```

## Optimisations spécifiques Astro

### 1. Configuration du site statique optimale
```js
// astro.config.mjs
export default defineConfig({
  output: 'static', // Force le mode statique
  trailingSlash: 'never', // URLs plus propres
  build: {
    format: 'file' // Génère index.html dans chaque dossier
  }
});
```

### 2. Optimisation des collections de contenu
```js
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
      width: z.number(),
      height: z.number()
    }).optional()
  })
});

export const collections = { blog };
```

### 3. Génération de pages optimisée
```astro
---
// src/pages/blog/[...slug].astro
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<Layout title={post.data.title}>
  <Content />
</Layout>
```

## Optimisations TailwindCSS + DaisyUI

### 1. Configuration Tailwind optimisée
```js
// tailwind.config.mjs
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './node_modules/daisyui/dist/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'], // Limiter les thèmes
    base: true,
    styled: true,
    utils: true,
    rtl: false,
    prefix: "",
    logs: false
  }
};
```

### 2. Optimisation CSS
```css
/* src/styles/global.css */
@import "tailwindcss";
@plugin "daisyui";

/* Critical CSS inline */
@layer base {
  html {
    font-family: Inter, system-ui, sans-serif;
    scroll-behavior: smooth;
  }
  
  body {
    @apply antialiased;
  }
}

/* Optimisation des animations DaisyUI */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Optimisations i18n

### 1. Structure i18n optimisée
```js
// src/i18n/index.ts
export const languages = {
  en: 'English',
  fr: 'Français'
};

export const defaultLang = 'en';

// Cache des traductions
const translations = new Map();

export function useTranslations(lang: keyof typeof languages) {
  if (!translations.has(lang)) {
    // Lazy load des traductions
    import(`./locales/${lang}.json`).then(module => {
      translations.set(lang, module.default);
    });
  }
  
  return (key: string) => {
    const t = translations.get(lang);
    return t?.[key] || key;
  };
}
```

### 2. Génération de pages i18n optimisée
```astro
---
// src/pages/[...lang]/index.astro
import { languages, defaultLang } from '../i18n';

export function getStaticPaths() {
  return Object.keys(languages).map(lang => ({
    params: { lang: lang === defaultLang ? undefined : lang }
  }));
}
---
```

## Stratégies avancées d'optimisation

### 1. Mise en cache agressive
```js
// public/_headers (pour Netlify)
/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

### 2. Service Worker (optionnel)
```js
// public/sw.js
const CACHE_NAME = 'astro-app-v1';
const urlsToCache = [
  '/',
  '/assets/main.css',
  '/assets/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

### 3. Optimisation des métadonnées
```astro
---
// src/components/BaseHead.astro
export interface Props {
  title: string;
  description: string;
  image?: string;
}

const { title, description, image } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  
  <!-- Critical meta tags -->
  <title>{title}</title>
  <meta name="description" content={description}>
  <link rel="canonical" href={canonicalURL}>
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- DNS prefetch -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  
  <!-- Theme color -->
  <meta name="theme-color" content="#ffffff">
  
  <!-- Favicon optimisé -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" href="/favicon.png">
</head>
```

## Mesure et surveillance

### 1. Scripts de test automatisés
```json
{
  "scripts": {
    "lighthouse": "lighthouse http://localhost:4321 --only-categories=performance --output=json --output-path=./lighthouse-results.json",
    "perf-test": "npm run build && npm run preview & npm run lighthouse",
    "analyze": "npx @unlighthouse/cli --site http://localhost:4321"
  }
}
```

### 2. Monitoring continu
```js
// src/utils/performance.js
export function measureWebVitals() {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ onCLS, onINP, onLCP }) => {
      onCLS(console.log);
      onINP(console.log);
      onLCP(console.log);
    });
  }
}
```

## Checklist finale Lighthouse 100

### Performance (100/100)
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] Images optimisées (WebP/AVIF)
- [ ] CSS et JS minifiés
- [ ] Compression Gzip/Brotli activée
- [ ] Cache-Control headers configurés
- [ ] Fonts optimisées (woff2, display: swap)
- [ ] Élimination du JavaScript inutilisé

### Accessibility (100/100)
- [ ] Attributs `alt` sur toutes les images
- [ ] Contraste suffisant (4.5:1 minimum)
- [ ] Navigation clavier fonctionnelle
- [ ] Attributs ARIA appropriés
- [ ] Structure HTML sémantique
- [ ] Labels de formulaires appropriés

### Best Practices (100/100)
- [ ] HTTPS activé
- [ ] Console sans erreurs
- [ ] Images avec dimensions explicites
- [ ] Pas de bibliothèques vulnérables
- [ ] Gestion des erreurs appropriée

### SEO (100/100)
- [ ] Meta description présente
- [ ] Titre H1 unique par page
- [ ] URL canonique définie
- [ ] Sitemap.xml généré
- [ ] Robots.txt configuré
- [ ] Données structurées (JSON-LD)

## Ressources et outils recommandés

### Outils de test
- **PageSpeed Insights** : https://pagespeed.web.dev/
- **Lighthouse CLI** : `npm install -g lighthouse`
- **WebPageTest** : https://www.webpagetest.org/
- **Unlighthouse** : Audit de site complet

### Outils de développement
- **Astro Dev Toolbar** : Intégré dans Astro 4+
- **Chrome DevTools** : Performance tab + Coverage
- **Vite Bundle Analyzer** : `npm run build -- --report`

### CDN et hébergement optimisés
- **Netlify** : Cache intelligent, edge functions
- **Vercel** : Image optimization intégrée
- **Cloudflare Pages** : CDN global, optimisations automatiques

---

**Mise à jour** : Janvier 2025
**Compatibilité** : Astro 5.x, TailwindCSS 4.x, DaisyUI 5.x
**Objectif** : Score Lighthouse 100/100 garanti 
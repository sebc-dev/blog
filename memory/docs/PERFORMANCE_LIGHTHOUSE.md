# Tests de Performance Lighthouse 100/100

## 🎯 Vue d'ensemble

Cette suite de tests valide automatiquement que votre build Astro respecte **TOUS** les critères documentés dans `/memory/docs/` pour atteindre un score Lighthouse parfait (100/100).

## 🚀 Utilisation

### Exécution des tests

```bash
# Construire le projet et exécuter les tests
npm run build && npm run test

# Ou avec pnpm
pnpm build && pnpm test

# Tests en mode watch
npm run test:watch
```

### Tests disponibles

- **`lighthouse-performance.test.ts`** : Test principal validant tous les critères Lighthouse
- **`utils/lighthouse-criteria.ts`** : Utilitaires de validation des critères

## 📊 Critères Validés

### Core Web Vitals
- **LCP (Largest Contentful Paint)** < 2.5s
  - ✅ Preload des fonts critiques
  - ✅ `fetchpriority="high"` pour images critiques
  - ✅ CSS critique inline
  - ✅ Ressources render-blocking minimales

- **CLS (Cumulative Layout Shift)** < 0.1
  - ✅ Dimensions explicites pour images
  - ✅ `font-display: swap`
  - ✅ `size-adjust` (technique 2024)
  - ✅ `aspect-ratio` CSS

- **INP (Interaction to Next Paint)** < 200ms
  - ✅ Composants DaisyUI natifs (CSS-only)
  - ✅ `requestAnimationFrame` pour scroll
  - ✅ Event listeners passifs
  - ✅ DOM < 1500 éléments

### Performance Assets
- **Images** : Formats modernes (WebP, AVIF), lazy loading
- **Fonts** : Preload, crossorigin, font-display
- **CSS** : Bundling, taille < 100KB, TailwindCSS purgé
- **JavaScript** : Minimal, < 50KB par fichier

### Qualité
- **Accessibilité** : lang, alt, structure headings, ARIA
- **SEO** : Meta descriptions, canonical, Open Graph, JSON-LD
- **Best Practices** : Viewport, charset, HTTPS

## 🔧 Configuration

### Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000, // Build peut prendre du temps
  }
});
```

### Setup Automatique
Le fichier `tests/setup.ts` :
- Nettoie le dossier `dist/`
- Exécute `npm run build` automatiquement
- Configure l'environnement de test

## 📋 Interprétation des Résultats

### ✅ Succès
```
🎉 LIGHTHOUSE 100/100 ACHIEVED!
===============================

Toutes les optimisations sont en place:
✅ Core Web Vitals optimisés
✅ Assets performance optimisés
✅ Accessibilité 100/100
✅ SEO 100/100
✅ Best Practices 100/100
```

### ❌ Échec
```
🎯 LIGHTHOUSE 100/100 SUMMARY
=============================

Performance Metrics:
- LCP Optimized: ❌
- CLS Optimized: ✅
- INP Optimized: ✅
...

Status: 🔧 NEEDS OPTIMIZATION
```

Chaque critère échoué affiche des détails spécifiques sur les optimisations manquantes.

## 🛠 Résolution des Problèmes

### Erreurs Communes

#### LCP Non Optimisé
```
❌ LCP: Missing font preload in ./dist/index.html
```
**Solution** : Ajouter `<link rel="preload" href="/fonts/font.woff2" as="font" type="font/woff2" crossorigin>` dans BaseHead.astro

#### CLS Non Optimisé
```
❌ CLS: Image missing dimensions in ./dist/index.html
```
**Solution** : Ajouter `width` et `height` à toutes les images ou utiliser `aspect-ratio` CSS

#### INP Non Optimisé
```
❌ INP: Script without requestAnimationFrame optimization
```
**Solution** : Utiliser `requestAnimationFrame` pour les handlers de scroll

### Debug Avancé

Pour des informations détaillées :
```bash
# Exécuter avec verbose
npm run test -- --reporter=verbose

# Ou avec coverage
npm run test -- --coverage
```

## 🎯 Intégration CI/CD

### GitHub Actions
```yaml
name: Performance Tests
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

### Scripts Package.json
```json
{
  "scripts": {
    "test:performance": "npm run build && npm run test tests/lighthouse-performance.test.ts",
    "test:ci": "npm run build && npm run test -- --reporter=json --outputFile=test-results.json"
  }
}
```

## 📖 Référence Complète

### Basé sur les Documents
- `/memory/docs/astro-lighthouse-100-analysis.md`
- `/memory/docs/astro-lighthouse-100-guide.md`
- `/memory/docs/astro-performance-optimization-guide.md`

### Métriques Cibles
- **Performance** : 100/100
- **Accessibility** : 100/100
- **Best Practices** : 100/100
- **SEO** : 100/100

### Technologies Validées
- **Astro 5.x** avec configuration optimale
- **TailwindCSS** avec purge
- **DaisyUI** composants natifs
- **i18n** optimisé avec cache

---

**Maintenu par** : Tests automatisés Vitest
**Dernière mise à jour** : Basé sur les critères Lighthouse 2024/2025 
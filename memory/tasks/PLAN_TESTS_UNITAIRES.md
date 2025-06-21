# Plan de Tests Unitaires - Blog Astro Template

Ce document liste tous les tests unitaires à créer pour garantir la qualité et la robustesse du
projet Astro Blog Template.

## 📋 Vue d'ensemble

- **Total de fichiers à tester**: 15 fichiers principaux
- **Framework de test**: Vitest + Astro Testing Library
- **Coverage cible**: 90%+
- **Types de tests**: Unitaires, Intégration, Accessibilité, Performance

## ✅ État d'avancement

- **Phase 1 - Fondations**: ✅ **COMPLÉTÉE** (27 tests passent)
- **Phase 2 - Composants de Base**: 🔄 En cours
- **Phase 3 - Composants Complexes**: ⏳ En attente
- **Phase 4 - Layouts et Pages**: ⏳ En attente
- **Phase 5 - Performance et Qualité**: ⏳ En attente

**Total tests implémentés**: 27/150+ estimés

---

## 🔧 Utilitaires et Configuration

### 1. `src/consts.ts`

**Fichier**: `tests/unit/consts.test.ts` - ❌ **EXCLU** (par demande utilisateur)

- [x] ~~Vérifier que `SITE_TITLE` est défini et non vide~~
- [x] ~~Vérifier que `SITE_DESCRIPTION` est défini et non vide~~
- [x] ~~Vérifier que les constantes sont des chaînes de caractères~~
- [x] ~~Tester l'immutabilité des constantes~~

### 2. `src/types.d.ts`

**Fichier**: `tests/unit/types.test.ts`

- [ ] Valider l'interface `BlogFrontmatter`
- [ ] Tester les types des propriétés (title, description, pubDate, etc.)
- [ ] Vérifier les propriétés optionnelles (updatedDate, heroImage, tags)
- [ ] Tester l'interface `CollectionEntry<T>`
- [ ] Valider les déclarations de modules d'images

### 3. `src/content.config.ts`

**Fichier**: `tests/unit/content-config.test.ts` - ✅ **COMPLÉTÉ** (5 tests)

- [x] Vérifier la configuration de la collection blog
- [x] Tester que les collections sont correctement exportées
- [x] Vérifier la structure des collections
- [x] Tester la validité de la configuration Astro
- [x] Vérifier que seules les collections attendues sont présentes

---

## 🌐 Internationalisation

### 4. `src/i18n/index.ts`

**Fichier**: `tests/unit/i18n.test.ts` - ✅ **COMPLÉTÉ** (22 tests)

#### Fonctions utilitaires

- [x] `getLangFromUrl()`:
  - [x] Retourne 'en' pour URL sans langue
  - [x] Retourne 'fr' pour URL avec /fr/
  - [x] Retourne defaultLang pour langue invalide
  - [x] Gestion des cas limites
- [x] `useTranslations()`:
  - [x] Retourne fonction de traduction valide
  - [x] Fallback vers langue par défaut si clé manquante
  - [x] Retourne chaîne non vide pour toutes les clés
- [x] `getLocalizedUrl()`:
  - [x] Ne préfixe pas pour langue par défaut
  - [x] Ajoute préfixe pour autres langues
  - [x] Évite les doubles slashes
  - [x] Gestion des chemins vides et racine
- [x] `removeLocaleFromUrl()`:
  - [x] Supprime préfixe de langue valide
  - [x] Laisse URL inchangée si pas de préfixe
  - [x] Gestion des cas limites

#### Configuration

- [x] Vérifier que `languages` contient 'en' et 'fr'
- [x] Vérifier que `defaultLang` est 'en'
- [x] Vérifier cohérence des traductions (toutes les clés présentes dans toutes les langues)
- [x] Valider les types `TranslationKey` et `TranslationObject`

---

## 🧩 Composants Astro

### 5. `src/components/BaseHead.astro`

**Fichier**: `tests/unit/components/BaseHead.test.ts`

- [ ] Props obligatoires (title, description) sont rendues
- [ ] Image par défaut utilisée si image non fournie
- [ ] Meta tags générés correctement
- [ ] URL canonique construite correctement
- [ ] Préchargement des fonts configuré
- [ ] Font-display: swap configuré pour CLS
- [ ] Meta Open Graph générés
- [ ] RSS feed lié correctement
- [ ] Generator meta tag présent

### 6. `src/components/Header.astro`

**Fichier**: `tests/unit/components/Header.test.ts`

- [ ] Titre du site affiché correctement
- [ ] Navigation multilingue fonctionne
- [ ] Liens internes localisés selon la langue
- [ ] LanguagePicker intégré
- [ ] Liens sociaux rendus avec bonnes URLs
- [ ] Accessibilité des liens sociaux (sr-only)
- [ ] Responsive design (masquage liens sociaux mobile)
- [ ] Structure HTML valide

### 7. `src/components/Footer.astro`

**Fichier**: `tests/unit/components/Footer.test.ts`

- [ ] Année courante affichée dynamiquement
- [ ] Copyright message affiché
- [ ] Liens sociaux rendus correctement
- [ ] Icons SVG valides et accessibles
- [ ] Hover states fonctionnels
- [ ] Structure HTML valide

### 8. `src/components/HeaderLink.astro`

**Fichier**: `tests/unit/components/HeaderLink.test.ts`

- [ ] Props href transmise correctement
- [ ] Classe CSS personnalisée appliquée
- [ ] État actif détecté correctement (pathname matching)
- [ ] Sous-chemins gérés correctement
- [ ] Slot content rendu
- [ ] Styles actif/inactif appliqués
- [ ] Accessibilité du lien

### 9. `src/components/LanguagePicker.astro`

**Fichier**: `tests/unit/components/LanguagePicker.test.ts`

- [ ] Toutes les langues disponibles affichées
- [ ] Langue active marquée visuellement
- [ ] URLs localisées générées correctement
- [ ] Chemin actuel préservé lors du changement
- [ ] Accessibilité (aria-label)
- [ ] Hover states fonctionnels
- [ ] Structure HTML valide

### 10. `src/components/FormattedDate.astro`

**Fichier**: `tests/unit/components/FormattedDate.test.ts`

- [ ] Date formatée correctement (locale en-us)
- [ ] Attribut datetime ISO généré
- [ ] Gestion des différents formats de date
- [ ] Élément `<time>` valide
- [ ] Props date obligatoire

---

## 📄 Layouts

### 11. `src/layouts/Layout.astro`

**Fichier**: `tests/unit/layouts/Layout.test.ts`

- [ ] Props title et description transmises à BaseHead
- [ ] Langue détectée depuis URL
- [ ] Structure HTML5 valide
- [ ] Header et Footer intégrés
- [ ] Slot main rendu correctement
- [ ] Attribut lang du HTML correct

### 12. `src/layouts/BlogPost.astro`

**Fichier**: `tests/unit/layouts/BlogPost.test.ts`

- [ ] Métadonnées du post affichées (title, dates)
- [ ] Image hero affichée si fournie
- [ ] Date de publication formatée
- [ ] Date de mise à jour conditionnelle
- [ ] Structure de l'article valide
- [ ] Styles CSS appliqués
- [ ] Responsive design (max-width, padding)

---

## 🧪 Tests et Utilitaires

### 13. `tests/utils/lighthouse-criteria.ts`

**Fichier**: `tests/unit/utils/lighthouse-criteria.test.ts`

#### Classe LighthouseCriteriaValidator

- [ ] Constructor initialise distPath correctement
- [ ] `validateAllCriteria()` retourne objet PerformanceCriteria complet
- [ ] `validateLCP()`: vérifie optimisations LCP
- [ ] `validateCLS()`: vérifie optimisations CLS
- [ ] `validateINP()`: vérifie optimisations interactions
- [ ] `validateAssets()`: vérifie taille et optimisation assets
- [ ] `validateImages()`: vérifie formats et tailles images
- [ ] `validateFonts()`: vérifie préchargement et display swap
- [ ] `validateCSS()`: vérifie inline critique et compression
- [ ] `validateJS()`: vérifie minification et chunking
- [ ] `validateAccessibility()`: vérifie conformité WCAG
- [ ] `validateSEO()`: vérifie métadonnées et structure
- [ ] `validateBestPractices()`: vérifie sécurité et bonnes pratiques

#### Méthodes utilitaires

- [ ] `getHTMLFiles()`: retourne tous les fichiers .html
- [ ] `getCSSFiles()`: retourne tous les fichiers .css
- [ ] `getJSFiles()`: retourne tous les fichiers .js
- [ ] `getFilesByExtension()`: scan récursif correct
- [ ] Gestion des erreurs de fichiers manquants

### 14. `tests/lighthouse-performance.test.ts`

**Fichier**: Tests déjà existants à compléter

- [ ] Tests d'intégration avec build réel
- [ ] Validation scores Lighthouse > 90
- [ ] Tests Core Web Vitals
- [ ] Tests accessibilité automatisés
- [ ] Tests SEO automatisés

### 15. `tests/setup.ts`

**Fichier**: `tests/unit/setup.test.ts`

- [ ] Matchers personnalisés fonctionnent
- [ ] `toBeOptimizedForLighthouse()` valide
- [ ] `toHaveValidCoreWebVitals()` valide
- [ ] `toBeAccessible()` valide
- [ ] `toHaveSEOOptimizations()` valide

---

## 🚀 Tests d'Intégration et E2E

### Pages (tests d'intégration)

**Fichier**: `tests/integration/pages.test.ts`

- [ ] Page d'accueil se charge correctement
- [ ] Page blog liste les articles
- [ ] Page about se charge
- [ ] Pages localisées (fr/) fonctionnent
- [ ] RSS feed généré correctement
- [ ] Pages dynamiques blog/[...slug] fonctionnent
- [ ] Navigation entre pages fonctionne
- [ ] Changement de langue preserve le contexte

---

## 🛠 Configuration des Tests

### Configuration Vitest - ✅ **MISE EN PLACE**

**Fichier**: `vitest.config.ts` - ✅ **CONFIGURÉ**

```typescript
import { defineConfig } from "vitest/config";
import { getViteConfig } from "astro/config";

export default defineConfig(
  getViteConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./tests/setup.ts"],
      coverage: {
        reporter: ["text", "json", "html"],
        exclude: ["node_modules/", "dist/", "tests/", "**/*.d.ts"],
        thresholds: {
          global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@tests": resolve(__dirname, "./tests"),
        "astro:content": resolve(__dirname, "./tests/mocks/astro-content.ts"),
        "astro:assets": resolve(__dirname, "./tests/mocks/astro-assets.ts"),
      },
    },
  })
);
```

### Mocks Astro - ✅ **CRÉÉS**

#### `tests/mocks/astro-content.ts` - ✅ **CONFIGURÉ**

- Mock de `defineCollection`, `getCollection`, `render`
- Mock de `glob` loader
- Support des types `CollectionEntry<T>`
- Export de `z` pour les schémas Zod

#### `tests/mocks/astro-assets.ts` - ✅ **CONFIGURÉ**

- Mock du composant `Image`
- Mock de l'interface `ImageMetadata`
- Mock de `getImage` pour les transformations d'images
- Support des fonctions `image()` pour les schémas

### Dépendances de test - ✅ **INSTALLÉES**

```json
{
  "devDependencies": {
    "@testing-library/dom": "~10.4.0",
    "@testing-library/jest-dom": "~6.6.3",
    "@vitest/coverage-v8": "~3.2.4",
    "@vitest/ui": "~3.2.4",
    "jsdom": "~26.1.0",
    "vitest": "~3.2.4",
    "zod": "3.25.67"
  }
}
```

### Setup Global - ✅ **CONFIGURÉ**

**Fichier**: `tests/setup.ts` - ✅ **OPTIMISÉ**

- Build conditionnel (uniquement pour tests de performance)
- Matchers personnalisés pour Lighthouse
- Nettoyage automatique après tests

---

## 📊 Priorités de Développement

### Phase 1 - Fondations (Critique) - ✅ **COMPLÉTÉE**

1. ~~`src/consts.ts`~~ - ❌ **EXCLU** (par demande utilisateur)
2. `src/i18n/index.ts` - ✅ **COMPLÉTÉ** (22 tests)
3. `src/content.config.ts` - ✅ **COMPLÉTÉ** (5 tests)

### Phase 2 - Composants de Base - 🔄 **EN COURS**

4. `src/components/FormattedDate.astro` - ⏳ Simple
5. `src/components/HeaderLink.astro` - ⏳ Navigation
6. `src/components/LanguagePicker.astro` - ⏳ i18n

### Phase 3 - Composants Complexes

7. `src/components/BaseHead.astro` - SEO critique
8. `src/components/Header.astro` - Navigation principale
9. `src/components/Footer.astro` - Structure

### Phase 4 - Layouts et Pages

10. `src/layouts/Layout.astro` - Layout principal
11. `src/layouts/BlogPost.astro` - Articles
12. Tests d'intégration pages

### Phase 5 - Performance et Qualité

13. `tests/utils/lighthouse-criteria.ts` - Performance
14. Tests E2E complets
15. Optimisation coverage

---

## 🎯 Objectifs de Qualité

- **Coverage**: 90%+ sur tous les modules
- **Performance**: Lighthouse 100/100
- **Accessibilité**: WCAG AA compliance
- **SEO**: Meta tags et structure optimaux
- **i18n**: Support complet français/anglais
- **Maintenance**: Tests robustes et rapides

---

## 🎖️ Accomplissements Techniques

### ✅ Phase 1 Réussie (27 tests)

- **Infrastructure de test** complètement configurée pour Astro
- **Mocks avancés** pour `astro:content` et `astro:assets`
- **Tests i18n complets** avec gestion des cas limites
- **Configuration Vitest** optimisée avec `getViteConfig`
- **Setup conditionnel** pour éviter les builds inutiles

### 🔧 Outils Mis en Place

- **Alias de résolution** pour les imports Astro
- **Types TypeScript** pour les mocks
- **Coverage reporting** avec seuils de 90%
- **Test isolation** avec environnement jsdom

## 🚀 Prochaines Étapes

### Immédiat (Phase 2)

1. **FormattedDate.astro** - Composant simple pour valider l'approche
2. **HeaderLink.astro** - Test des props et logique conditionnelle
3. **LanguagePicker.astro** - Intégration avec i18n

### Défis Techniques Anticipés

- **Rendu des composants Astro** dans l'environnement de test
- **Simulation des props Astro** (Astro.props, Astro.url)
- **Test des slots** et du contenu dynamique
- **Validation du HTML généré** par les composants

---

_Ce plan sera mis à jour au fur et à mesure de l'implémentation des tests._

**Dernière mise à jour**: Phase 1 complétée - 27 tests passent ✅

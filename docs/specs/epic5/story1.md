# Story 5.S01: Générer les balises hreflang pour les versions linguistiques

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Admin/DevFE, je veux que le site génère automatiquement les balises `link rel="alternate" hreflang="x"` correctes pour toutes les pages ayant des versions linguistiques, afin d'indiquer aux moteurs de recherche les URL alternatives pour chaque langue, améliorant le ciblage linguistique et évitant les problèmes de contenu dupliqué.

**Context:** Cette story est essentielle pour le SEO international du blog. Elle permet aux moteurs de recherche de comprendre la relation entre les différentes versions linguistiques d'une même page. Elle s'appuie sur la configuration i18n d'Astro.

## Detailed Requirements

Implémenter la génération automatique des balises `link rel="alternate" hreflang="x"` dans le `<head>` de toutes les pages pertinentes du site. Cela inclut les liens vers toutes les autres versions linguistiques disponibles pour une page donnée, ainsi qu'un lien `hreflang="x-default"`.

## Acceptance Criteria (ACs)

- AC1: Les balises `<link rel="alternate" hreflang="[code-langue]" href="[url-absolue-version-linguistique]">` sont générées dans le `<head>` de chaque page ayant des traductions.
- AC2: Chaque page inclut une balise `hreflang` pour elle-même (auto-référencement).
- AC3: Les URLs utilisées dans les attributs `href` sont absolues (commençant par `https://...`). `Astro.site` doit être correctement configuré et utilisé.
- AC4: Une balise `<link rel="alternate" hreflang="x-default" href="[url-absolue-version-par-defaut]">` est générée, pointant vers la version anglaise (`en`) par défaut du contenu.
- AC5: La logique de génération des balises `hreflang` est implémentée dans les layouts Astro appropriés (ex: layout de base, layout d'article) pour couvrir toutes les pages.
- AC6: Les codes de langue utilisés (ex: "fr", "en") sont conformes aux standards (ISO 639-1).
- AC7: Pour les pages d'articles, la logique identifie correctement les slugs traduits correspondants pour construire les URLs alternatives.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/src/layouts/BaseLayout.astro` (ou un composant Head partagé).
    - `frontend/src/layouts/ArticleLayout.astro` (ou le layout spécifique des articles, pour la logique de traduction des articles).
    - `astro.config.mjs` (pour s'assurer que `site` et la configuration `i18n` sont corrects).
  - Potentially Files to Create:
    - Un composant Astro dédié à la génération des balises SEO du head si la logique devient complexe (ex: `frontend/src/components/seo/HeadTags.astro`).
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_
  - _(Hint: Voir `docs/bilinguisme/gestion-contenu.md` Section 7.2 et `docs/seo/strategie-seo.md` Section 2)_

- **Key Technologies:**
  - Astro, API i18n d'Astro, HTML.
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Utilisation de `Astro.url`, `Astro.site`.
  - Accès aux informations de traduction des pages/articles (peut dépendre de la manière dont les collections de contenu sont structurées et liées pour les traductions). Astro i18n routing peut fournir des helpers.

- **UI/UX Notes:** Non applicable directement (impacte le SEO et l'expérience utilisateur via les moteurs de recherche).

- **Data Structures:**
  - Accès aux métadonnées des pages (langue actuelle, URLs des traductions disponibles).

- **Environment Variables:**
  - `PUBLIC_SITE_URL` (utilisé pour configurer `Astro.site` dans `astro.config.mjs`).
  - _(Hint: Voir `docs/setup/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - Le code Astro doit être propre et suivre les bonnes pratiques.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Vérifier/Configurer `Astro.site` dans `astro.config.mjs` avec l'URL de production.
- [ ] Dans le layout de base (ou composant Head), implémenter la logique pour récupérer les URLs des versions traduites de la page actuelle.
- [ ] Générer dynamiquement les balises `<link rel="alternate" hreflang="..." href="...">` pour chaque traduction, y compris l'auto-référencement.
- [ ] Implémenter la génération de la balise `hreflang="x-default"` pointant vers la version anglaise.
- [ ] S'assurer que la logique fonctionne pour les pages d'accueil, les pages de listing, les pages statiques (ex: "À propos"), et les pages d'articles.
- [ ] Pour les articles, s'assurer que les slugs traduits sont correctement utilisés pour former les URLs alternatives.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Build-time Validation:**
  - Après `npm run build`, inspecter le code HTML généré pour plusieurs pages types (accueil FR/EN, article FR/EN) :
    - Vérifier la présence et l'exactitude des balises `hreflang` et de leurs attributs `href`.
    - Vérifier la présence et l'exactitude de la balise `x-default`.
- **Manual/CLI Verification:**
  - Utiliser des outils en ligne de validation de balises `hreflang` sur les pages générées (après déploiement sur un environnement de test ou en local avec `npm run preview`).
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft
# Story 5.S02: Générer la balise link rel="canonical"

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Admin/DevFE, je veux que chaque page génère une balise `link rel="canonical"` pointant vers elle-même, afin de spécifier l'URL préférée pour chaque page linguistique et éviter les problèmes de contenu dupliqué dus à des paramètres d'URL ou des variations mineures.

**Context:** Cette story contribue à la propreté du SEO en indiquant clairement aux moteurs de recherche quelle est l'URL "officielle" d'une page, même si elle est accessible via plusieurs URLs (ce qui est moins probable avec Astro pour les pages principales, mais reste une bonne pratique).

## Detailed Requirements

Implémenter la génération automatique d'une balise `link rel="canonical"` dans le `<head>` de chaque page du site. L'URL canonique doit être l'URL absolue de la page actuelle.

## Acceptance Criteria (ACs)

- AC1: Une balise `<link rel="canonical" href="[url-absolue-page-actuelle]">` est générée dans le `<head>` de chaque page du site.
- AC2: L'URL utilisée dans l'attribut `href` est absolue (commençant par `https://...`).
- AC3: La logique utilise `Astro.site` et `Astro.url.pathname` (ou des équivalents Astro) pour construire l'URL canonique de manière fiable.
- AC4: La balise canonique est correcte pour les pages dans toutes les langues configurées.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/src/layouts/BaseLayout.astro` (ou un composant Head partagé).
    - `astro.config.mjs` (pour s'assurer que `site` est correctement configuré).
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_
  - _(Hint: Voir `docs/bilinguisme/gestion-contenu.md` Section 7.3 et `docs/seo/strategie-seo.md` Section 2)_

- **Key Technologies:**
  - Astro, HTML.
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Utilisation de `Astro.url.pathname` et `Astro.site`.

- **UI/UX Notes:** Non applicable directement (impacte le SEO).

- **Data Structures:** Pas de structure de données spécifique pour cette story.

- **Environment Variables:**
  - `PUBLIC_SITE_URL` (utilisé pour configurer `Astro.site` dans `astro.config.mjs`).
  - _(Hint: Voir `docs/setup/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - Code Astro simple et direct pour cette fonctionnalité.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Vérifier/Configurer `Astro.site` dans `astro.config.mjs`.
- [ ] Dans le layout de base (ou composant Head), ajouter la balise `<link rel="canonical">`.
- [ ] Construire dynamiquement l'attribut `href` en combinant `Astro.site` et `Astro.url.pathname`.
- [ ] S'assurer que les URLs générées sont correctes, notamment en ce qui concerne les slashs de fin (Astro gère généralement bien cela avec `trailingSlash: 'ignore'` ou `'never'`).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Build-time Validation:**
  - Après `npm run build`, inspecter le code HTML généré pour plusieurs pages types (accueil FR/EN, article FR/EN, etc.) :
    - Vérifier la présence et l'exactitude de la balise `canonical` et de son attribut `href`.
- **Manual/CLI Verification:**
  - Utiliser les outils de développement du navigateur pour inspecter le `<head>` des pages en local (`npm run preview`) ou sur un environnement de test.
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft
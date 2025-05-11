# Story 2.11: Génération des Balises `canonical`

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Admin/DevFE, je veux que chaque page génère une balise `link rel="canonical"` pointant vers elle-même afin de spécifier l'URL préférée pour chaque page linguistique et éviter les problèmes de contenu dupliqué dus à des paramètres d'URL ou des variations mineures.

**Context:** Cette story de l'Epic 2 complète la configuration SEO de base pour le bilinguisme. La balise canonique est essentielle pour indiquer aux moteurs de recherche quelle est la version "officielle" d'une page donnée dans une langue spécifique.

## Detailed Requirements

Modifier le `BaseLayout.astro` pour inclure une balise `<link rel="canonical" href="...">` dans le `<head>`. L'URL `href` doit être l'URL absolue de la page actuelle.

## Acceptance Criteria (ACs)

- AC1: Le fichier `frontend/src/layouts/BaseLayout.astro` est modifié.
- AC2: Une balise `<link rel="canonical" href="URL_ABSOLUE_PAGE_ACTUELLE">` est générée dans le `<head>` de chaque page.
- AC3: L'URL dans l'attribut `href` est absolue, auto-référencée (pointe vers la page actuelle elle-même), et inclut le préfixe de langue.
- AC4: La documentation dans `docs/bilinguisme/gestion-contenu.md` (Section 7.3) et `docs/seo/strategie-seo.md` (Section 2) est mise à jour.

## Technical Implementation Context

**Guidance:** Utiliser `Astro.url` et `Astro.site` pour construire l'URL canonique.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/src/layouts/BaseLayout.astro`
  - Files to Reference:
    - `frontend/astro.config.mjs` (pour `Astro.site`)
    - `docs/bilinguisme/gestion-contenu.md`
    - `docs/seo/strategie-seo.md`

- **Key Technologies:**
  - Astro (API `Astro.url`, `Astro.site`)
  - HTML (balise `<link>`)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Invisible à l'utilisateur, impacte le SEO.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - `PUBLIC_SITE_URL` (utilisé par `Astro.site`).

- **Coding Standards Notes:**
  - S'assurer que l'URL est correctement construite.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Ouvrir le fichier `frontend/src/layouts/BaseLayout.astro`.
- [ ] Dans la section `<head>`, ajouter la logique pour générer la balise canonique :
    ```astro
    ---
    // Dans BaseLayout.astro
    // ... autres imports et props ...
    const siteUrl = new URL(Astro.site || 'http://localhost:4321'); // Fallback pour dev
    const canonicalURL = new URL(Astro.url.pathname, siteUrl).href;
    ---

    {/* Dans le <head> du BaseLayout.astro */}
    <link rel="canonical" href={canonicalURL} />
    {/* ... autres balises meta et link ... */}
    ```
- [ ] Tester sur différentes pages (accueil, article, etc.) et dans les deux langues pour s'assurer que l'URL canonique est correcte (auto-référencée, absolue, avec préfixe de langue).
- [ ] Mettre à jour la documentation pertinente.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Browser Source Inspection:**
  - Charger plusieurs pages différentes du site (accueil, page d'article, etc.) dans chaque langue.
  - Inspecter le code source de chaque page et vérifier la présence et l'exactitude de la balise `<link rel="canonical" href="...">`.
  - S'assurer que l'URL est absolue, qu'elle correspond à l'URL de la page actuellement consultée, et qu'elle inclut le préfixe de langue.
- _(Hint: Voir `docs/strategie-tests.md`, `docs/bilinguisme/gestion-contenu.md`, `docs/seo/strategie-seo.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
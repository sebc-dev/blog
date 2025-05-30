# Story 5.S04: Utiliser des sous-répertoires par langue pour les URLs

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Admin/DevFE, je veux que la structure d'URL utilise des sous-répertoires par langue (ex: `/fr/`, `/en/`) y compris pour la langue par défaut, afin d'avoir une structure d'URL claire pour les utilisateurs et les moteurs de recherche, optimisée pour le SEO international.

**Context:** Cette story établit une structure d'URL internationalisée, ce qui est une recommandation SEO clé pour les sites multilingues. Elle s'appuie sur les capacités de routage i18n d'Astro.

## Detailed Requirements

Configurer le routage i18n d'Astro pour que toutes les URLs, y compris celles de la langue par défaut (anglais), soient préfixées par leur code de langue respectif (par exemple, `/en/my-article/` au lieu de `/my-article/` pour l'anglais si c'est la langue par défaut).

## Acceptance Criteria (ACs)

- AC1: La configuration i18n dans `astro.config.mjs` est mise à jour pour forcer le préfixage de la langue par défaut dans les URLs. L'option `routing: { prefixDefaultLocale: true }` (ou son équivalent sémantique) est utilisée.
- AC2: Toutes les pages du site, y compris la page d'accueil et les articles dans la langue par défaut (anglais), sont accessibles via une URL contenant le préfixe linguistique (ex: `/en/`, `/en/blog/my-post`).
- AC3: Les liens internes générés par Astro (ex: via des composants `<a href="...">` pointant vers des pages locales ou des helpers de lien Astro) respectent cette structure d'URL préfixée.
- AC4: La navigation entre les pages et les langues fonctionne correctement avec cette nouvelle structure d'URL.
- AC5: Les sitemaps (voir E5-S03) et les balises `hreflang` (voir E5-S01) et `canonical` (voir E5-S02) reflètent correctement cette structure d'URL préfixée.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Modify:
    - `astro.config.mjs` (principalement pour la configuration i18n et routing).
  - Files to Review (pour s'assurer que la génération de liens est correcte) :
    - Tous les layouts et composants qui génèrent des liens internes.
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_
  - _(Hint: Voir `docs/bilinguisme/gestion-contenu.md` Section 7.1 et `docs/seo/strategie-seo.md` Section 2)_

- **Key Technologies:**
  - Astro (configuration i18n, routage).
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:** Non applicable.

- **UI/UX Notes:** Impacte la manière dont les utilisateurs voient et partagent les URLs. Une structure cohérente est préférable.

- **Data Structures:** Pas de structure de données spécifique pour cette story.

- **Environment Variables:** Non applicable directement.

- **Coding Standards Notes:**
  - S'assurer que la configuration Astro est claire.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Modifier `astro.config.mjs` pour ajouter l'option `routing: { prefixDefaultLocale: true }` (ou l'équivalent selon la version d'Astro) à la configuration `i18n`.
- [ ] Tester la génération des URLs en local (`npm run dev`) pour vérifier que toutes les pages (y compris celles de la langue par défaut) ont le préfixe linguistique.
- [ ] Vérifier les liens internes à travers le site pour s'assurer qu'ils pointent vers les nouvelles URLs préfixées.
- [ ] Effectuer un build (`npm run build`) et vérifier que les URLs dans les fichiers générés (HTML, sitemap) sont correctes.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Build-time Validation & Manual Navigation:**
  - Après `npm run build` et en utilisant `npm run preview` (ou sur un environnement de test) :
    - Naviguer sur le site dans toutes les langues et vérifier que les URLs dans la barre d'adresse du navigateur incluent toujours le préfixe de langue.
    - Inspecter les liens internes pour s'assurer qu'ils utilisent la structure préfixée.
    - Vérifier que les URLs dans le sitemap généré (E5-S03) et les balises `hreflang` (E5-S01) et `canonical` (E5-S02) sont cohérentes avec cette structure.
- **E2E Tests (Cypress):**
  - Mettre à jour les tests E2E existants pour s'attendre aux nouvelles structures d'URL.
  - Ajouter des tests spécifiques pour vérifier la navigation entre les pages en s'assurant que les préfixes linguistiques sont maintenus.
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft
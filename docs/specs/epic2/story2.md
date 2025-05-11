# Story 2.2: Champ `translationId` et `slug` Localisé dans Frontmatter

**Status:** Draft

## Goal & Context

**User Story E2-S02:** En tant que Rédacteur/Admin, je veux utiliser un champ `translationId` commun dans le frontmatter des articles MDX traduits afin de permettre de lier techniquement les différentes versions linguistiques d'un même article conceptuel, notamment pour le sélecteur de langue et la communication avec le backend (`articleCanonicalSlug`).
**User Story E2-S03:** En tant que Rédacteur/Admin, je veux définir un `slug` localisé spécifique à la langue dans le frontmatter de chaque article MDX afin d'avoir des URLs sémantiques et optimisées pour le SEO dans chaque langue (ex: `/fr/mon-titre-francais`, `/en/my-english-title`).

**Context:** Cette story affine la gestion du contenu bilingue définie dans la Story 2.1. `translationId` est la clé pour lier les traductions, et `slug` permet des URLs personnalisées par langue.

## Detailed Requirements

S'assurer que les champs `translationId` (obligatoire) et `slug` (optionnel mais recommandé) sont correctement définis et utilisés dans le schéma de la collection `blog` (`src/content/config.ts`). Créer des exemples d'articles démontrant l'utilisation de ces champs. Documenter la convention de nommage pour `translationId` si nécessaire. S'assurer que les pages d'articles sont générées avec ces slugs localisés (cela sera pleinement testé quand les pages dynamiques d'articles seront créées dans Epic 3).

## Acceptance Criteria (ACs)

- AC1: Le champ `translationId` est défini comme `z.string()` (obligatoire) dans le schéma Zod de la collection `blog` dans `frontend/src/content/config.ts`.
- AC2: Le champ `slug` est défini comme `z.string().optional()` dans le schéma Zod de la collection `blog`.
- AC3: Au moins deux paires d'articles traduits sont créées dans `src/content/blog/fr/` et `src/content/blog/en/`, chaque paire partageant le même `translationId` mais ayant des `slug` (et titres, descriptions) localisés.
- AC4: La documentation (`docs/bilinguisme/gestion-contenu.md` Section 2) est mise à jour ou confirmée pour refléter l'importance et l'utilisation de `translationId` et `slug`.
- AC5: Astro doit pouvoir utiliser le champ `slug` du frontmatter pour générer les URLs des articles (ceci anticipe la création des pages `[slug].astro` dans l'Epic 3). Si `slug` est absent, le nom du fichier MDX sera utilisé par défaut par Astro.

## Technical Implementation Context

**Guidance:** Modifier `frontend/src/content/config.ts` et créer des fichiers MDX d'exemple.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/src/content/config.ts` (pour confirmer/ajuster la définition de `translationId` et `slug`)
  - Files to Create:
    - Nouveaux fichiers MDX d'exemple dans `frontend/src/content/blog/fr/` et `frontend/src/content/blog/en/` (ex: `article-deux-fr.mdx`, `post-two-en.mdx`).
  - Files to Update/Verify:
    - `docs/bilinguisme/gestion-contenu.md`
  - _(Hint: Cette story s'appuie directement sur la Story 2.1)_

- **Key Technologies:**
  - Astro (Content Collections)
  - Zod
  - MDX
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Le `slug` affecte directement les URLs visibles par l'utilisateur.

- **Data Structures:**
  - Concerne les champs du frontmatter.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Les `translationId` doivent être uniques par "concept d'article" mais identiques entre ses traductions. Une convention (ex: `concept-unique-id-anneemois`) est recommandée.
  - Les `slug` doivent être URL-friendly (minuscules, tirets, pas de caractères spéciaux).
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Vérifier et s'assurer que `translationId: z.string()` et `slug: z.string().optional()` sont correctement définis dans le schéma Zod de `frontend/src/content/config.ts` (normalement déjà fait dans Story 2.1, ici c'est une confirmation et un focus).
- [ ] Créer une deuxième paire d'articles traduits :
    - `frontend/src/content/blog/fr/article-tauri-optimisation.mdx`:
        ```mdx
        ---
        title: "Optimisation Avancée avec Tauri"
        description: "Techniques pour optimiser les applications Tauri."
        pubDate: 2025-05-13
        lang: "fr"
        translationId: "tauri-optimisation-202505"
        slug: "optimisation-avancee-tauri"
        tags: ["tauri", "optimisation", "français"]
        isDraft: false
        ---

        Contenu sur l'optimisation Tauri...
        ```
    - `frontend/src/content/blog/en/advanced-tauri-optimization.mdx`:
        ```mdx
        ---
        title: "Advanced Tauri Optimization"
        description: "Techniques for optimizing Tauri applications."
        pubDate: 2025-05-13
        lang: "en"
        translationId: "tauri-optimisation-202505" # Même translationId
        slug: "advanced-tauri-optimization"
        tags: ["tauri", "optimization", "english"]
        isDraft: false
        ---

        Content about Tauri optimization...
        ```
- [ ] Mettre à jour les fichiers d'exemple de la Story 2.1 (`premier-article.mdx` et `first-post.mdx`) pour s'assurer qu'ils ont des `slug` distincts et un `translationId` partagé clair.
- [ ] Revoir et mettre à jour la section 2 de `docs/bilinguisme/gestion-contenu.md` pour :
    - Souligner que `translationId` est obligatoire.
    - Expliquer le rôle du `slug` localisé et sa différence avec le nom de fichier.
    - Suggérer une convention pour les `translationId` (ex: basé sur le slug de la langue principale + date, ou un UUID court).
- [ ] Vérifier que le projet compile (`pnpm astro check`) et que le serveur de dev démarre.
- [ ] (Anticipation pour Epic 3) Noter que la logique de génération des pages d'articles (ex: `src/pages/[lang]/blog/[slug].astro`) devra utiliser `getStaticPaths` et récupérer les entrées de la collection `blog`, en utilisant le champ `slug` du frontmatter pour construire l'URL.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Astro Build/Check:**
  - `pnpm --filter ./frontend astro check` doit passer.
- **Manual Verification:**
  - Inspecter les fichiers MDX d'exemple pour confirmer la présence et la correction des champs `translationId` et `slug`.
  - Vérifier que les `translationId` sont identiques pour les paires d'articles traduits et uniques entre les différents "concepts" d'articles.
  - Vérifier que les `slug` sont uniques par langue et URL-friendly.
  - Confirmer que la documentation `docs/bilinguisme/gestion-contenu.md` est à jour.
- **Future Test (Epic 3):**
  - Lorsque les pages d'articles dynamiques seront créées, vérifier que les URLs générées utilisent bien les `slug` du frontmatter. Par exemple, `http://localhost:4321/fr/blog/optimisation-avancee-tauri` et `http://localhost:4321/en/blog/advanced-tauri-optimization`.

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
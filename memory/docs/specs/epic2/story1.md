# Story 2.1: Organisation Contenu MDX Bilingue et Schéma Astro

**Status:** Draft

## Goal & Context

**User Story:** En tant que Rédacteur/Admin, je veux organiser les fichiers d'articles MDX dans une structure de répertoires claire, séparant les contenus par langue (ex: `src/content/blog/fr/` et `src/content/blog/en/`) afin de faciliter la gestion et la maintenance des articles et de leurs traductions.

**Context:** Cette story est la première de l'Epic 2 et établit la fondation pour la gestion de contenu bilingue. Elle s'appuie sur l'infrastructure Astro mise en place dans l'Epic 1. Une structure de contenu bien organisée est essentielle pour un blog multilingue.

## Detailed Requirements

Implémenter la structure de collection de contenu Astro `src/content/blog/[lang]/`. Définir le schéma de la collection `blog` dans `src/content/config.ts` en utilisant Zod pour la validation. Ce schéma doit inclure tous les champs requis pour les articles (title, lang, translationId, slug, pubDate, description, tags, isDraft, etc.).

## Acceptance Criteria (ACs)

- AC1: La structure de répertoires `frontend/src/content/blog/fr/` et `frontend/src/content/blog/en/` est créée.
- AC2: Un fichier `frontend/src/content/config.ts` est créé et définit une collection Astro nommée `blog`.
- AC3: Le schéma Zod dans `config.ts` pour la collection `blog` inclut et valide les champs suivants (types et contraintes appropriés) :
    - `title` (string)
    - `description` (string)
    - `pubDate` (date)
    - `updatedDate` (date, optionnel)
    - `lang` (enum ou string, ex: 'fr' ou 'en')
    - `translationId` (string, identifiant unique pour lier les traductions)
    - `slug` (string, pour l'URL localisée, optionnel mais recommandé pour remplacer le slug basé sur le nom de fichier)
    - `tags` (array de strings, optionnel)
    - `isDraft` (boolean, optionnel, default false)
    - `image` (string, chemin vers l'image de couverture, optionnel)
    - `image_alt` (string, alt text pour l'image de couverture, optionnel, mais requis si `image` est présent)
- AC4: Au moins un fichier d'exemple `.mdx` est placé dans chaque répertoire de langue (`fr` et `en`) avec un frontmatter conforme au schéma, pour tester la configuration.
- AC5: La documentation dans `docs/bilinguisme/gestion-contenu.md` (Sections 1.1, 1.2, 2) est consultée et ses recommandations sont prises en compte.

## Technical Implementation Context

**Guidance:** Utiliser la fonctionnalité "Content Collections" d'Astro. Définir le schéma avec Zod.

- **Relevant Files:**
  - Files to Create:
    - `frontend/src/content/config.ts`
    - `frontend/src/content/blog/fr/exemple-article.mdx`
    - `frontend/src/content/blog/en/example-post.mdx`
  - Files to Modify:
    - (Aucun fichier existant à modifier pour cette story spécifique, mais elle prépare le terrain pour les pages qui utiliseront cette collection)
  - _(Hint: Voir `docs/project-structure.md` pour la structure des dossiers `frontend/src/content/` et `docs/bilinguisme/gestion-contenu.md` pour les directives sur la gestion de contenu bilingue.)_

- **Key Technologies:**
  - Astro (Content Collections)
  - MDX
  - Zod (pour la validation de schéma dans Astro)
  - TypeScript
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Non applicable directement, mais cette structure impactera la façon dont le contenu est récupéré et affiché.

- **Data Structures:**
  - Définition du schéma de frontmatter pour les articles de blog.
  - _(Hint: Le document `docs/data-models.md` se concentre sur le backend, mais la logique de `translationId` ici sera cruciale pour `articleCanonicalSlug` du backend plus tard.)_

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Le schéma Zod doit être clair et précis.
  - Les noms de champs dans le frontmatter doivent être cohérents.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer les répertoires `frontend/src/content/blog/fr` et `frontend/src/content/blog/en`.
- [ ] Créer le fichier `frontend/src/content/config.ts`.
- [ ] Dans `config.ts`, importer `defineCollection` et `z` de `astro:content`.
- [ ] Définir la `blogCollection` en utilisant `defineCollection` avec un `type: 'content'` et le schéma Zod :
    ```typescript
    // frontend/src/content/config.ts
    import { defineCollection, z } from 'astro:content';

    const blogCollection = defineCollection({
      type: 'content', // 'content' pour les articles .mdx ou .md
      schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        updatedDate: z.date().optional(),
        lang: z.enum(['fr', 'en']),
        translationId: z.string(),
        slug: z.string().optional(), // Sera utilisé pour générer l'URL, si absent, le nom du fichier sera utilisé
        tags: z.array(z.string()).optional(),
        isDraft: z.boolean().default(false).optional(),
        // Champs pour l'image de couverture
        image: z.string().optional(), // ex: '/assets/images/blog/mon-image.jpg'
        image_alt: z.string().optional(),
      }).refine(data => !data.image || (data.image && data.image_alt), {
        message: "L'attribut 'image_alt' est requis si 'image' est fourni.",
        path: ["image_alt"],
      }),
    });

    export const collections = {
      'blog': blogCollection,
    };
    ```
- [ ] Créer un fichier d'exemple `frontend/src/content/blog/fr/premier-article.mdx` avec le frontmatter suivant :
    ```mdx
    ---
    title: "Mon Premier Article en Français"
    description: "Ceci est la description de mon premier article en français."
    pubDate: 2025-05-12
    lang: "fr"
    translationId: "premier-article-unique-id"
    slug: "mon-premier-article"
    tags: ["test", "français"]
    isDraft: false
    image: "/assets/blog/placeholder-fr.png" # Créer une image placeholder
    image_alt: "Image placeholder pour l'article en français"
    ---

    Contenu de l'article en français...
    ```
- [ ] Créer un fichier d'exemple `frontend/src/content/blog/en/first-post.mdx` avec le frontmatter suivant :
    ```mdx
    ---
    title: "My First Post in English"
    description: "This is the description of my first post in English."
    pubDate: 2025-05-12
    lang: "en"
    translationId: "premier-article-unique-id" # Même translationId
    slug: "my-first-post"
    tags: ["test", "english"]
    isDraft: false
    image: "/assets/blog/placeholder-en.png" # Créer une image placeholder
    image_alt: "Placeholder image for the English post"
    ---

    Content of the post in English...
    ```
- [ ] Créer les images placeholder dans `frontend/public/assets/blog/`.
- [ ] Vérifier que le projet Astro compile toujours sans erreur après ces ajouts (ex: `pnpm astro check` ou `pnpm dev`).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Astro Build/Check:**
  - Exécuter `pnpm --filter ./frontend astro check` doit passer sans erreurs de type liées aux collections de contenu.
  - Le serveur de développement (`pnpm --filter ./frontend dev`) doit démarrer.
- **Manual Verification:**
  - Vérifier la structure des dossiers et le contenu des fichiers `config.ts` et des exemples MDX.
  - Tenter de mettre un frontmatter invalide dans un des fichiers MDX (ex: type incorrect pour `pubDate` ou `translationId` manquant) et s'assurer qu'Astro signale une erreur au build ou au `check`.
- _(Hint: Voir `docs/strategie-tests.md` et `docs/bilinguisme/gestion-contenu.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
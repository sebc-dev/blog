# Story 3.1: Création et édition d'articles MDX avec frontmatter standardisé

**Status:** Draft

## Goal & Context

**User Story:** En tant que Rédacteur/Admin, je veux créer et éditer des articles de blog en utilisant le format MDX avec un frontmatter standardisé, afin d'avoir un workflow de publication simple et basé sur des fichiers, et assurer la cohérence des métadonnées des articles.

**Context:** Cette story est la base de la gestion de contenu. Elle permet de structurer les articles et leurs métadonnées essentielles pour leur affichage et leur organisation. Elle s'appuie sur les configurations du projet Astro (Epic 1) et les conventions pour le contenu bilingue (Epic 2).

## Detailed Requirements

Permettre la création, l'édition et la publication d'articles de blog. Gestion des articles en deux langues (français et anglais) avec des versions distinctes mais liées, en assurant une localisation profonde et culturellement pertinente. Les articles seront gérés sous forme de fichiers statiques MDX. Organisation du contenu par catégories/piliers et tags. Support pour différents formats de contenu : articles de fond avec exemples de code, tutoriels vidéo (intégration de lecteurs vidéo), listes de prompts IA, études de cas.

Plus spécifiquement pour cette story :
- Définir et implémenter le processus de création de fichiers `.mdx` dans les répertoires `src/content/blog/fr/` et `src/content/blog/en/`.
- Mettre en place la validation du frontmatter des fichiers MDX en utilisant un schéma Zod dans `src/content/config.ts`. Le frontmatter doit inclure au minimum : `title` (string), `description` (string), `pubDate` (date), `lang` (string, 'fr' ou 'en'), `translationId` (string, identifiant commun aux traductions), `slug` (string, unique par langue), `tags` (array de strings), `isDraft` (boolean), `image` (string, optionnel, chemin vers l'image de couverture).
- S'assurer que la syntaxe Markdown standard est supportée.
- Permettre l'intégration de composants Astro/JSX directement dans les fichiers MDX.
- Documenter ce processus et la structure du frontmatter dans `docs/bilinguisme/gestion-contenu.md` (à créer ou mettre à jour, en se basant sur les sections 2 & 3 comme référence).

## Acceptance Criteria (ACs)

- AC1: Un nouveau fichier `.mdx` peut être créé dans `src/content/blog/[lang]/` (ex: `src/content/blog/fr/mon-nouvel-article.mdx`).
- AC2: Le frontmatter du fichier MDX est validé par le schéma Zod défini dans `src/content/config.ts` lors du build ou du démarrage du serveur de développement. Les champs requis (`title`, `description`, `pubDate`, `lang`, `translationId`, `slug`, `isDraft`) doivent être présents et corrects.
- AC3: Le contenu Markdown standard (titres, listes, liens, emphase, etc.) est correctement interprété.
- AC4: Un composant Astro simple (ex: `<MonComposant />`) peut être importé et utilisé dans un fichier MDX.
- AC5: La documentation dans `docs/bilinguisme/gestion-contenu.md` (ou une section dédiée) explique clairement comment créer un article, la structure des répertoires et les champs du frontmatter.
- AC6: Les articles peuvent être marqués comme brouillon (`isDraft: true`) ou publiés (`isDraft: false`) via le frontmatter.

## Technical Implementation Context

**Guidance:** Utiliser les fonctionnalités de collections de contenu d'Astro.

- **Relevant Files:**
  - Files to Create: `src/content/config.ts`, `src/content/blog/fr/exemple-article.mdx`, `src/content/blog/en/example-article.mdx`, `docs/bilinguisme/gestion-contenu.md`.
  - Files to Modify: Potentiellement `astro.config.mjs` si des configurations globales MDX sont nécessaires.
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - Astro (Content Collections, MDX integration)
  - Zod (pour la validation de schéma du frontmatter)
  - Markdown
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - N/A pour cette story.
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:**
  - N/A pour cette story (concerne la structure et la gestion des fichiers).

- **Data Structures:**
  - Frontmatter des fichiers MDX (champs : `title`, `description`, `pubDate`, `updatedDate` (optionnel), `lang`, `translationId`, `slug`, `tags`, `category` (optionnel, si on veut un pilier principal), `isDraft`, `image` (chemin vers l'image de couverture)).
  - Schéma Zod correspondant dans `src/content/config.ts`.
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - N/A pour cette story.
  - _(Hint: See `docs/environment-vars.md` for all variables)_

- **Coding Standards Notes:**
  - Suivre les conventions Astro et TypeScript.
  - Nommer les fichiers MDX en `kebab-case.mdx`.
  - _(Hint: See `docs/coding-standards.md` for full standards)_

## Tasks / Subtasks

- [ ] Définir la structure exacte des répertoires pour les articles bilingues dans `src/content/blog/`.
- [ ] Créer le fichier `src/content/config.ts` et y définir le schéma Zod pour le frontmatter des articles de blog.
- [ ] Inclure tous les champs spécifiés dans le frontmatter (title, description, pubDate, lang, translationId, slug, tags, isDraft, image).
- [ ] S'assurer que `translationId` est utilisé pour lier les versions linguistiques.
- [ ] Documenter la structure du frontmatter et le processus de création d'article dans `docs/bilinguisme/gestion-contenu.md`.
- [ ] Créer un exemple d'article en français (`exemple-article.mdx`) et sa traduction en anglais (`example-article.mdx`) avec un frontmatter complet et valide.
- [ ] Vérifier que le serveur de développement Astro charge et valide ces articles exemples.
- [ ] Tester l'utilisation d'un composant Astro simple à l'intérieur d'un des articles exemples MDX.
- [ ] S'assurer que la syntaxe Markdown de base est bien rendue (sera pleinement vérifié dans les stories d'affichage).

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.
- **Unit Tests:**
    - Tester le schéma Zod dans `src/content/config.ts` avec des données de frontmatter valides et invalides.
- **Integration Tests:**
    - Le build Astro doit réussir avec les articles exemples.
    - Le serveur de dev Astro doit démarrer et afficher les articles exemples (même si l'affichage détaillé est pour E3-F01).
- **Manual/CLI Verification:**
    - Vérifier manuellement la structure des fichiers créés.
    - Inspecter les logs du serveur de dev Astro pour des erreurs de validation de frontmatter.
    - Confirmer que la documentation `docs/bilinguisme/gestion-contenu.md` est claire.
- _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
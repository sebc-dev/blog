# Story 6.C02: Traduire/Localiser les articles sources

**Status:** Draft

## Goal & Context

**User Story:** En tant que Rédacteur/Traducteur, je veux traduire (ou localiser profondément) les [X] articles sources dans l'autre langue (français ou anglais) pour atteindre un total de 20 articles (10 FR, 10 EN), afin d'offrir une expérience bilingue complète dès le lancement et répondre aux besoins des deux audiences linguistiques.

**Context:** Cette story est la contrepartie de E6-C01. Elle assure que le contenu initial est disponible dans les deux langues cibles du blog, en mettant l'accent sur une localisation de qualité plutôt qu'une simple traduction littérale.

## Detailed Requirements

Prendre les articles originaux créés dans la story E6-C01 et produire leurs équivalents de haute qualité dans l'autre langue. Cela implique non seulement la traduction du texte, mais aussi l'adaptation des exemples, des références culturelles si nécessaire, et la localisation du frontmatter.

## Acceptance Criteria (ACs)

- AC1: Pour chaque article source, une version traduite/localisée est créée et sauvegardée au format MDX dans le répertoire de la langue cible (ex: `frontend/src/content/blog/[langue-cible]/`).
- AC2: Le frontmatter de chaque article traduit est complet et correctement localisé :
    - `title` (traduit et adapté)
    - `description` (traduite et adaptée)
    - `pubDate` (généralement identique à l'original ou proche)
    - `updatedDate` (si applicable)
    - `lang` (code de la langue cible)
    - `translationId` (doit être **identique** à celui de l'article source correspondant pour lier les versions)
    - `slug` (localisé pour la langue cible et unique dans cette langue)
    - `tags` (traduits et/ou adaptés)
    - `category` (identique ou traduit si les noms de piliers sont localisés)
    - `author` (identique)
    - `isDraft: true` (initialement).
- AC3: La traduction est de haute qualité, fluide, et respecte la terminologie technique appropriée dans la langue cible. Le style et le ton de l'article original sont préservés.
- AC4: Les exemples de code, si leur contenu textuel (commentaires, chaînes de caractères) nécessite une traduction, sont adaptés. Les images contenant du texte sont recréées ou adaptées pour la langue cible si nécessaire.
- AC5: La mise en forme MDX de l'article traduit est correcte et validée par une prévisualisation locale.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create: Fichiers `.mdx` pour les traductions (ex: `frontend/src/content/blog/en/translated-article-1.mdx`).
  - Files to Reference: Les fichiers MDX sources de E6-C01. `frontend/src/content/config.ts`.
  - _(Hint: Voir `docs/project-structure.md`)_
  - _(Hint: Voir `docs/bilinguisme/gestion-contenu.md` Section 3.2 sur la liaison des traductions)_

- **Key Technologies:**
  - MDX.
  - Outils de traduction (ex: Claude, mentionné dans l'epic, avec validation humaine impérative).
  - _(Hint: Voir `docs/architecture/tech-stack.md`)_

- **API Interactions / SDK Usage:** Non applicable.

- **UI/UX Notes:**
  - La qualité de la localisation impacte directement l'UX pour l'audience de la langue cible.

- **Data Structures:**
  - Structure du frontmatter identique à E6-C01, avec une attention particulière à l'exactitude du `translationId` et à la localisation des champs textuels.

- **Environment Variables:** Non applicable.

- **Coding Standards Notes:**
  - Suivre les directives de `docs/bilinguisme/gestion-contenu.md` pour la gestion des fichiers traduits et du frontmatter.
  - _(Hint: Voir `docs/contribution/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Pour chaque article original de E6-C01 :
  - [ ] Procéder à la traduction/localisation du contenu principal du texte.
  - [ ] Adapter les exemples de code (commentaires, etc.) et les images si nécessaire.
  - [ ] Créer un nouveau fichier MDX dans le répertoire de la langue cible.
  - [ ] Copier le `translationId` de l'article source.
  - [ ] Rédiger/traduire les champs `title`, `description`, `slug`, et `tags` pour le frontmatter de la version traduite.
  - [ ] S'assurer que tous les autres champs du frontmatter sont corrects pour la version traduite.
  - [ ] Prévisualiser l'article traduit localement.
  - [ ] Relire et valider la qualité de la traduction et l'adaptation technique.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Validation de Schéma Frontmatter:**
  - Astro validera le frontmatter via Zod lors du build/dev.
- **Prévisualisation et Relecture Croisée :**
  - Prévisualiser chaque article traduit.
  - Comparer avec l'article source pour vérifier l'exhaustivité et la fidélité (tout en permettant une localisation de qualité).
  - Relecture humaine bilingue (si possible) ou par un locuteur natif de la langue cible pour la qualité linguistique et technique.
- **Validation des Liens de Traduction :**
  - (Couvert plus en détail dans les epics SEO/UI) S'assurer que le système peut lier l'original et sa traduction via le `translationId`.
- _(Hint: Voir `docs/tests/strategie-tests.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft
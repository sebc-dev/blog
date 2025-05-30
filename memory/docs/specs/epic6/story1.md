# Story 6.C01: Rédiger les articles techniques originaux

**Status:** Draft

## Goal & Context

**User Story:** En tant que Rédacteur de Contenu, je veux rédiger [X] articles techniques originaux de haute qualité (environ 5 en langue source, par exemple) sur les piliers thématiques du blog (Tauri, IA pour Devs, UX Desktop, Ingénierie Logicielle), afin de fournir une base de contenu substantielle et attrayante pour le lancement du blog.

**Context:** Cette story initie la création du contenu fondamental du blog. La qualité et la pertinence de ces articles sources sont cruciales pour attirer l'audience cible et établir la crédibilité du blog. Ces articles serviront de base pour les traductions (Story E6-C02).

## Detailed Requirements

Produire un ensemble d'articles techniques originaux. Chaque article doit être approfondi, techniquement précis, clairement rédigé, et s'inscrire dans l'un des piliers thématiques du blog. Le nombre exact d'articles sources à produire pour atteindre l'objectif global de 20 articles (10 FR, 10 EN) sera déterminé par la stratégie de traduction (certains peuvent être originaux dans chaque langue, d'autres traduits). Pour cette story, on se concentre sur la création d'un premier lot d'articles dans une langue source.

## Acceptance Criteria (ACs)

- AC1: [X] articles techniques originaux sont rédigés et sauvegardés au format MDX dans le répertoire approprié (ex: `frontend/src/content/blog/[langue-source]/`).
- AC2: Chaque article possède un frontmatter complet et valide, incluant :
    - `title` (unique et descriptif)
    - `description` (résumé engageant pour le SEO)
    - `pubDate` (date de publication prévue ou de création)
    - `updatedDate` (optionnel, date de dernière mise à jour)
    - `lang` (code de la langue source de l'article, ex: "fr" ou "en")
    - `translationId` (un identifiant unique généré pour lier cet article à ses futures traductions, ex: `uuid` ou un slug canonique descriptif comme `mon-premier-article-tauri-ia-2025`)
    - `slug` (le slug localisé pour l'URL de cet article, ex: `mon-super-article-original`)
    - `tags` (une liste de mots-clés pertinents)
    - `category` (le pilier thématique principal, ex: "Tauri", "IA pour Devs")
    - `author` (nom de l'auteur, peut être une valeur par défaut pour le blog)
    - `isDraft: true` (initialement, passera à `false` pour la publication dans E6-P01).
- AC3: Le contenu de chaque article est techniquement exact, bien structuré (titres Hn, paragraphes, listes), et écrit dans un style clair et engageant.
- AC4: Si pertinent, les articles incluent des exemples de code correctement formatés (avec langage spécifié pour la coloration syntaxique), des images optimisées avec attributs `alt`, et/ou des diagrammes.
- AC5: La mise en forme MDX est correcte et validée par une prévisualisation locale (`npm run dev`).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create: Fichiers `.mdx` dans `frontend/src/content/blog/[langue-source]/` (par exemple, `frontend/src/content/blog/fr/article-original-1.mdx`).
  - Files to Reference: `frontend/src/content/config.ts` (pour la structure du frontmatter et la validation Zod).
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_
  - _(Hint: Voir `docs/bilinguisme/gestion-contenu.md` Sections 2 et 3.1 pour les directives sur le frontmatter et la structure des fichiers)_

- **Key Technologies:**
  - MDX (Markdown avec JSX).
  - Astro (gestion des collections de contenu).
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:** Non applicable directement pour la rédaction.

- **UI/UX Notes:**
  - Le formatage du contenu (titres, listes, code, images) doit être pensé pour la lisibilité, en accord avec `docs/ui-ux/ui-ux-spec.md`.

- **Data Structures:**
  - Respecter la structure du frontmatter définie dans `frontend/src/content/config.ts` et documentée dans `docs/bilinguisme/gestion-contenu.md`.

- **Environment Variables:** Non applicable.

- **Coding Standards Notes:**
  - Suivre les bonnes pratiques de rédaction pour le web et de formatage MDX.
  - Assurer la cohérence du style et du ton.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les aspects techniques du MDX si des composants Astro y sont intégrés)_

## Tasks / Subtasks

- [ ] Choisir les sujets pour les [X] premiers articles originaux, en accord avec les piliers thématiques.
- [ ] Pour chaque article :
  - [ ] Effectuer les recherches nécessaires et structurer le contenu.
  - [ ] Rédiger le corps de l'article en MDX.
  - [ ] Créer et optimiser les images/diagrammes nécessaires.
  - [ ] Intégrer et formater les exemples de code.
  - [ ] Remplir soigneusement tous les champs requis du frontmatter, en particulier `translationId` (doit être unique par "concept" d'article) et `slug` (unique par langue).
  - [ ] Prévisualiser l'article localement pour vérifier le rendu.
  - [ ] Relire et corriger l'article.
- [ ] Organiser les fichiers MDX dans la structure de dossiers appropriée.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Validation de Schéma Frontmatter:**
  - S'assurer qu'Astro ne génère pas d'erreurs liées au frontmatter lors du build (`npm run build`) ou du dev (`npm run dev`), grâce à la validation Zod dans `src/content/config.ts`.
- **Prévisualisation et Relecture :**
  - Chaque article doit être prévisualisé dans le navigateur via le serveur de développement Astro.
  - Vérifier le rendu correct de tous les éléments MDX (titres, listes, code, images).
  - Vérifier la lisibilité et la clarté.
  - Relecture humaine pour la qualité technique, grammaticale et stylistique.
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale de validation, bien que cet epic soit orienté contenu)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft
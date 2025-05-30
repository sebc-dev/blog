# Story 6.C03: Valider le formatage MDX et le frontmatter des articles

**Status:** Draft

## Goal & Context

**User Story:** En tant que Rédacteur/Admin, je veux m'assurer que tous les articles de lancement (originaux et traduits) sont correctement formatés en MDX et que leur frontmatter est valide, afin de garantir que les articles s'affichent correctement et que les métadonnées sont exploitables par le système Astro et pour le SEO.

**Context:** Cette story est une étape de validation technique cruciale avant la publication. Des erreurs dans le MDX ou le frontmatter peuvent entraîner des échecs de build, un mauvais affichage, ou des problèmes de SEO.

## Detailed Requirements

Passer en revue tous les fichiers MDX (originaux et traductions) créés pour le lancement initial. Vérifier la syntaxe MDX, la validité du frontmatter par rapport au schéma défini, et le rendu général des articles en prévisualisation locale.

## Acceptance Criteria (ACs)

- AC1: Tous les fichiers `.mdx` des articles de lancement (originaux et traduits) sont exempts d'erreurs de syntaxe MDX courantes.
- AC2: Le frontmatter de chaque fichier `.mdx` est conforme au schéma Zod défini dans `frontend/src/content/config.ts`. Aucune erreur de validation de frontmatter n'est signalée par Astro lors du build ou en mode développement.
- AC3: Tous les articles se prévisualisent correctement dans l'environnement de développement local (`npm run dev`), sans erreur de rendu visible.
- AC4: Les champs critiques du frontmatter (`title`, `description`, `pubDate`, `lang`, `translationId`, `slug`) sont présents et correctement remplis pour tous les articles.
- AC5: Les `translationId` sont cohérents entre un article et sa (ses) traduction(s).
- AC6: Les `slug`s sont uniques au sein de chaque langue.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Review: Tous les fichiers `.mdx` dans `frontend/src/content/blog/en/` et `frontend/src/content/blog/fr/`.
  - File to Reference: `frontend/src/content/config.ts` (pour le schéma Zod du frontmatter).
  - _(Hint: Voir `docs/project-structure.md`)_
  - _(Hint: Voir `docs/bilinguisme/gestion-contenu.md`)_

- **Key Technologies:**
  - Astro (spécifiquement la validation des collections de contenu via Zod).
  - MDX.
  - Outils de développement Astro (serveur de dev, logs de build).
  - _(Hint: Voir `docs/architecture/tech-stack.md`)_

- **API Interactions / SDK Usage:** Non applicable.

- **UI/UX Notes:** Un frontmatter correct et un MDX valide sont essentiels pour l'affichage correct des articles comme défini dans `docs/ui-ux/ui-ux-spec.md`.

- **Data Structures:** Validation de la structure du frontmatter de chaque article.

- **Environment Variables:** Non applicable.

- **Coding Standards Notes:**
  - Respecter la syntaxe MDX.
  - S'assurer de la cohérence des données dans le frontmatter (ex: format des dates).
  - _(Hint: Voir `docs/contribution/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Lister tous les articles (fichiers MDX) prévus pour le lancement.
- [ ] Pour chaque article :
  - [ ] Ouvrir le fichier et vérifier visuellement la syntaxe MDX (pas d'éléments mal fermés, etc.).
  - [ ] Examiner attentivement chaque champ du frontmatter pour s'assurer de sa présence, de son exactitude et de sa conformité avec `config.ts`.
  - [ ] Vérifier spécifiquement l'unicité des `slug`s par langue et la cohérence des `translationId`.
  - [ ] Lancer `npm run dev` et naviguer vers l'article pour vérifier son rendu. Observer la console du terminal pour toute erreur Astro liée au contenu.
  - [ ] (Optionnel) Exécuter `npm run build` périodiquement pour intercepter les erreurs de validation de collection en bloc.
- [ ] Corriger toutes les erreurs de MDX ou de frontmatter identifiées.
- [ ] Documenter toute décision ou correction notable.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Validation Automatisée par Astro:**
  - Le processus de build (`npm run build`) ou le serveur de développement (`npm run dev`) d'Astro doit s'exécuter sans erreur relative à la validation du schéma Zod des collections de contenu (frontmatter). C'est le test principal pour AC2.
- **Prévisualisation Manuelle Rigoureuse:**
  - Chaque article doit être ouvert et inspecté dans un navigateur via `npm run dev`.
  - Vérifier l'affichage correct des titres, paragraphes, listes, blocs de code, images, et tout autre élément MDX utilisé.
  - S'assurer qu'il n'y a pas d'erreurs de rendu visuel ou de contenu manquant.
- **Vérification de Cohérence des Données :**
  - Utiliser des scripts ou une inspection manuelle pour vérifier l'unicité des `slug`s par langue et la liaison correcte via `translationId`.
- _(Hint: Voir `docs/tests/strategie-tests.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft
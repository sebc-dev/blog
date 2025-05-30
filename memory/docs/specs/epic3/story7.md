# Story 3.7: Affichage des métadonnées d'article (date, temps de lecture, tags)

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux voir les métadonnées de l'article (date, temps de lecture, tags/catégories), afin d'obtenir rapidement le contexte de l'article.

**Context:** Afficher les métadonnées clés aide l'utilisateur à évaluer rapidement la pertinence et l'actualité d'un article. Cette story dépend de la structure du frontmatter (E3-S01) et s'intègre dans le layout d'article.

## Detailed Requirements

- Afficher la date de publication (`pubDate` issue du frontmatter) de manière visible dans l'en-tête de l'article. Si une date de mise à jour (`updatedDate`) est également fournie dans le frontmatter, l'afficher aussi (par exemple, "Publié le [pubDate], Mis à jour le [updatedDate]").
- Calculer et afficher une estimation du temps de lecture de l'article. L'algorithme de base pourrait être : `nombre de mots / 200 mots par minute (WPM)`. Le nombre de mots peut être extrait du contenu MDX.
- Afficher les tags associés à l'article (issus du champ `tags` du frontmatter).
- Chaque tag doit être cliquable et mener à une page de listing qui filtre les articles par ce tag (la création de ces pages de listing de tags pourrait être une story séparée ou faire partie d'un Epic sur la navigation/découverte). Pour cette story, l'objectif est d'afficher les tags comme des liens avec les URLs appropriées (ex: `/[lang]/tags/[nom-du-tag]/`).
- Les métadonnées (date, temps de lecture, tags) doivent être groupées et stylées de manière cohérente, conformément à `docs/ui-ux/ui-ux-spec.md#6.4.1`.

## Acceptance Criteria (ACs)

- AC1: La date de publication de l'article est correctement affichée. Si `updatedDate` est présente, elle est également affichée.
- AC2: Le temps de lecture estimé est calculé et affiché pour chaque article.
- AC3: Les tags de l'article sont affichés et chaque tag est un lien hypertexte pointant vers une URL de type `/[lang]/tags/[nom-du-tag]/`.
- AC4: Les métadonnées sont présentées de manière claire et esthétique dans l'en-tête de l'article, respectant les spécifications UI/UX.
- AC5: Le calcul du temps de lecture est raisonnable (par exemple, un article de 1000 mots affiche environ "5 min de lecture").

## Technical Implementation Context

**Guidance:** Les données proviendront du frontmatter des fichiers MDX. Le calcul du temps de lecture nécessitera de traiter le contenu brut de l'article.

- **Relevant Files:**
  - Files to Create/Modify: `src/layouts/ArticleLayout.astro` (ou un composant d'en-tête d'article dédié), un utilitaire pour calculer le temps de lecture (ex: `src/lib/readingTime.ts`).
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - Astro (accès aux données du frontmatter, props de layout)
  - JavaScript/TypeScript (pour le calcul du temps de lecture)
  - TailwindCSS (pour le stylisme)
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - N/A
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:**
  - Se référer à `docs/ui-ux/ui-ux-spec.md` (Section 6.4.1 Métadonnées).
  - Les tags peuvent être affichés comme des badges (DaisyUI `badge`).
  - L'ordre et la présentation des métadonnées (date, temps de lecture, tags) doivent être cohérents.

- **Data Structures:**
  - Frontmatter: `pubDate` (Date), `updatedDate` (Date, optionnel), `tags` (string[]).
  - Contenu de l'article (string) pour calculer le nombre de mots.
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - N/A
  - _(Hint: See `docs/environment-vars.md` for all variables)_

- **Coding Standards Notes:**
  - La fonction de calcul du temps de lecture doit être pure et testable.
  - Utiliser les API d'Astro pour formater les dates si besoin.
  - _(Hint: See `docs/coding-standards.md` for full standards)_

## Tasks / Subtasks

- [ ] Créer une fonction utilitaire `calculateReadingTime(content: string): number` qui prend le contenu textuel d'un article et retourne le temps de lecture estimé en minutes.
    - Strip HTML/Markdown pour compter les mots de manière plus précise.
- [ ] Dans le layout d'article (`ArticleLayout.astro` ou composant enfant), récupérer `pubDate`, `updatedDate` (si existe), et `tags` depuis les props (frontmatter).
- [ ] Récupérer le contenu compilé de l'article (ou le contenu brut si plus simple pour compter les mots avant le rendu final) pour le passer à la fonction `calculateReadingTime`.
- [ ] Afficher la date de publication (et de mise à jour si applicable), en la formatant de manière lisible (ex: "11 mai 2025").
- [ ] Afficher le temps de lecture calculé (ex: "Lecture : 5 min").
- [ ] Itérer sur les `tags` et les afficher sous forme de liens (badges) pointant vers `/[lang]/tags/[tag-slugified]/`.
    - S'assurer que les noms de tags sont "slugifiés" correctement pour les URLs.
- [ ] Styler la section des métadonnées conformément aux spécifications UI/UX.

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.
- **Unit Tests:**
    - Tester la fonction `calculateReadingTime` avec différents contenus (court, long, avec/sans formatage) pour s'assurer d'un calcul correct.
    - Tester la fonction de "slugification" des tags si une fonction personnalisée est créée.
- **Integration Tests (Visuels/Snapshot):**
    - Tests de snapshot sur un en-tête d'article pour vérifier le rendu HTML des métadonnées.
- **Manual/CLI Verification:**
    - Créer des articles de test avec différentes dates, un contenu de longueur variable, et plusieurs tags.
    - Vérifier visuellement l'affichage des dates (publication, mise à jour).
    - Vérifier l'exactitude et l'affichage du temps de lecture.
    - Vérifier l'affichage des tags et la correction des URLs générées pour chaque tag.
    - S'assurer que le style et la disposition des métadonnées sont conformes aux maquettes UI/UX.
- _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
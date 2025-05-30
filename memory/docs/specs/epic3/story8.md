# Story 3.8: Fil d'Ariane sur les pages d'articles

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux bénéficier d'une structure de page d'article claire avec fil d'Ariane, afin de savoir où je me situe dans la structure du site et naviguer facilement en arrière.

**Context:** Le fil d'Ariane (breadcrumbs) est un élément de navigation secondaire important qui aide les utilisateurs à comprendre leur position dans la hiérarchie du site. Cette story assure son implémentation sur les pages d'articles.

## Detailed Requirements

- Implémenter un composant de fil d'Ariane pour les pages d'articles.
- Le fil d'Ariane doit typiquement afficher : `Accueil > Blog > [Titre de l'Article]`.
    - "Accueil" doit pointer vers la page d'accueil de la langue courante (`/[lang]/`).
    - "Blog" doit pointer vers la page principale du blog dans la langue courante (`/[lang]/blog/`).
    - "[Titre de l'Article]" est la page actuelle et ne doit pas être un lien.
- Si les articles sont aussi structurés par catégories/piliers accessibles via des URLs distinctes (ex: `/[lang]/pilier/[nom-pilier]/[slug-article]`), le fil d'Ariane devrait refléter cette hiérarchie : `Accueil > Piliers > [Nom du Pilier] > [Titre de l'Article]`. Pour le MVP, nous nous concentrons sur la structure `Accueil > Blog > Article`.
- Le style du fil d'Ariane doit être discret mais lisible, et conforme à `docs/ui-ux/ui-ux-spec.md#6.4.1`.
- Le fil d'Ariane doit être placé en haut de la page d'article, généralement sous le header principal et au-dessus du titre de l'article.

## Acceptance Criteria (ACs)

- AC1: Un fil d'Ariane est affiché sur chaque page d'article.
- AC2: Le fil d'Ariane contient des liens corrects vers "Accueil" et "Blog" (ou la page de listing parente appropriée).
- AC3: Le titre de l'article actuel dans le fil d'Ariane n'est pas un lien.
- AC4: Le style et le positionnement du fil d'Ariane sont conformes aux spécifications UI/UX (`docs/ui-ux/ui-ux-spec.md`).
- AC5: Le fil d'Ariane est responsive et s'affiche correctement sur toutes les tailles d'écran.

## Technical Implementation Context

**Guidance:** Créer un composant Astro réutilisable pour le fil d'Ariane. Les informations nécessaires (titre de l'article, langue) seront passées en props.

- **Relevant Files:**
  - Files to Create: `src/components/common/Breadcrumbs.astro` (ou similaire).
  - Files to Modify: `src/layouts/ArticleLayout.astro` (pour y intégrer le composant `Breadcrumbs.astro`).
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - Astro (composants, props)
  - HTML (sémantique pour la navigation, ex: `<nav aria-label="breadcrumb"><ul><li>...</li></ul></nav>`)
  - TailwindCSS/CSS (pour le style)
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - N/A
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:**
  - Se référer à `docs/ui-ux/ui-ux-spec.md` (Section 6.4.1 Fil d'Ariane).
  - Utiliser un séparateur visuel standard entre les éléments du fil d'Ariane (ex: ">" ou "/").
  - Assurer une bonne accessibilité, notamment avec `aria-label="breadcrumb"`.

- **Data Structures:**
  - Un tableau d'objets représentant les segments du fil d'Ariane, chaque objet contenant `label` et `url` (sauf pour le dernier segment).
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - N/A
  - _(Hint: See `docs/environment-vars.md` for all variables)_

- **Coding Standards Notes:**
  - Le composant `Breadcrumbs.astro` doit être flexible pour accepter différentes structures de chemin si besoin à l'avenir.
  - _(Hint: See `docs/coding-standards.md` for full standards)_

## Tasks / Subtasks

- [ ] Créer le composant `src/components/common/Breadcrumbs.astro`.
    - Ce composant acceptera une liste de segments (chacun avec `label` et `url` optionnel).
    - Il générera la structure HTML sémantique (ex: `<nav><ul>...</ul></nav>`).
- [ ] Styler le composant `Breadcrumbs.astro` conformément aux spécifications UI/UX (séparateurs, couleurs de liens, style du dernier élément).
- [ ] Dans `src/layouts/ArticleLayout.astro`, instancier le composant `Breadcrumbs.astro`.
    - Lui passer les segments appropriés : "Accueil", "Blog", et le titre de l'article actuel (récupéré du frontmatter).
    - Générer les URLs correctes pour "Accueil" (`/[lang]/`) et "Blog" (`/[lang]/blog/`).
- [ ] S'assurer que le fil d'Ariane est bien positionné sur la page.
- [ ] Vérifier la responsivité du fil d'Ariane (il doit rester lisible et ne pas causer de débordement sur petits écrans).

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.
- **Unit Tests:**
    - Tester le composant `Breadcrumbs.astro` avec différentes listes de segments pour vérifier le rendu HTML correct (labels, URLs, dernier élément non cliquable).
- **Integration Tests (Visuels/Snapshot):**
    - Tests de snapshot sur une page d'article pour s'assurer que le fil d'Ariane est présent et correctement structuré.
- **Manual/CLI Verification:**
    - Naviguer vers plusieurs pages d'articles (en français et en anglais).
    - Vérifier la présence et l'exactitude du fil d'Ariane sur chaque page.
        - Les libellés sont corrects.
        - Les liens pointent vers les bonnes URLs.
        - Le titre de l'article actuel n'est pas un lien.
    - Vérifier le style et le positionnement.
    - Redimensionner la fenêtre du navigateur pour tester la responsivité.
- _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
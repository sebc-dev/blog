# Story 3.3: Lisibilité des articles (Typographie, Largeur, Contraste)

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux lire les articles de blog avec une typographie claire, une largeur de ligne confortable, et un bon contraste des couleurs, afin d'avoir une expérience de lecture agréable et minimiser la fatigue visuelle.

**Context:** Cette story est fondamentale pour l'expérience utilisateur du blog. Elle s'assure que le contenu principal des articles est présenté de manière optimale. Elle s'appuie sur la configuration du thème (Epic 1) et les spécifications UI/UX.

## Detailed Requirements

-   Appliquer le plugin `@tailwindcss/typography` (classe `prose`) au conteneur principal du contenu de l'article pour une stylisation de base du Markdown.
-   Personnaliser les styles de `prose` pour qu'ils correspondent aux spécifications de `docs/ui-ux/ui-ux-spec.md` concernant :
    -   **Polices :**
        -   Corps du texte et titres généraux : Police **Inter**.
        -   Blocs de code : Police **JetBrains Mono**.
    -   **Tailles de police :** Base de `16px` (`1rem`) pour le corps, échelle proportionnelle pour H1-H6.
    -   **Hauteur de ligne (interligne) :** Environ `1.6` à `1.7` pour le corps du texte.
    -   **Couleurs et contraste :** Respecter les palettes définies pour les modes clair et sombre, en assurant un contraste WCAG 2.1 AA.
-   Limiter la largeur du conteneur de texte principal à `max-w-prose` (environ `65ch`) pour une lisibilité optimale.
-   S'assurer que le texte est aligné à gauche.
-   Ces styles doivent s'appliquer au contenu généré à partir des fichiers MDX.
-   Le layout d'article (ex: `ArticleLayout.astro` ou un composant similaire) sera responsable de l'application de ces classes et styles.

## Acceptance Criteria (ACs)

-   AC1: Le contenu textuel d'un article MDX utilise la police "Inter" pour le corps et les titres.
-   AC2: La taille de police de base pour le corps du texte est de `16px` et l'interligne est d'environ `1.6`-`1.7`.
-   AC3: Les titres (H1-H6) ont une hiérarchie visuelle claire en termes de taille et de graisse, conformément aux spécifications UI/UX.
-   AC4: La largeur maximale du bloc de contenu textuel de l'article est limitée (par exemple par `max-w-prose`).
-   AC5: Le contraste entre le texte et l'arrière-plan respecte les normes WCAG 2.1 AA (minimum 4.5:1 pour texte normal) dans les modes clair et sombre.
-   AC6: Les styles sont appliqués via la classe `prose` de Tailwind Typography, avec les personnalisations nécessaires dans le fichier CSS principal `src/styles/global.css` en utilisant l'approche "CSS-first" de TailwindCSS v4.
-   AC7: Le layout d'article (`src/layouts/ArticleLayout.astro` ou équivalent) applique correctement ces styles au contenu MDX.

## Technical Implementation Context

**Guidance:** Utiliser TailwindCSS, le plugin `@tailwindcss/typography`, et les polices spécifiées.

-   **Relevant Files:**

    -   Files to Create/Modify: `src/layouts/ArticleLayout.astro` (ou un nom similaire pour le layout des articles), `src/styles/global.css` (pour l'import et la configuration du plugin `@tailwindcss/typography` ainsi que les surcharges des styles `prose`).
    -   _(Hint: See `docs/project-structure.md` for overall layout)_

-   **Key Technologies:**

    -   Astro
    -   TailwindCSS
    -   `@tailwindcss/typography`
    -   Polices : Inter, JetBrains Mono (à importer via Google Fonts ou localement).
    -   _(Hint: See `docs/tech-stack.md` for full list)_

-   **API Interactions / SDK Usage:**

    -   N/A
    -   _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

-   **UI/UX Notes:**

    -   Se référer scrupuleusement à `docs/ui-ux/ui-ux-spec.md` (Section 4. Typographie, Section 5.1.2 Longueur de ligne, Section 6.4 Page d'Article Individuel).
    -   Assurer la cohérence entre les modes clair et sombre.

-   **Data Structures:**

    -   N/A pour cette story (concerne le rendu).
    -   _(Hint: See `docs/data-models.md` for key project data structures)_

-   **Environment Variables:**

    -   N/A
    -   _(Hint: See `docs/environment-vars.md` for all variables)_

-   **Coding Standards Notes:**
    -   Déclarer les polices via `@theme` dans le fichier CSS principal.
    -   Personnaliser `prose` de manière modulaire par des surcharges CSS utilisant les variables de thème DaisyUI.
    -   _(Hint: See `docs/coding-standards.md` and `docs/modification_structure.md` for full standards)_

## Tasks / Subtasks

-   [ ] Configurer le plugin `@tailwindcss/typography` via la directive `@plugin "@tailwindcss/typography"` dans `src/styles/global.css`.
-   [ ] Importer les polices "Inter" et "JetBrains Mono" dans le projet (via Fontsource ou des déclarations `@font-face` dans `src/styles/global.css`).
-   [ ] Configurer les polices via la directive `@theme` dans `src/styles/global.css` pour utiliser "Inter" comme police par défaut et "JetBrains Mono" pour les éléments `<code>` ou `pre`.
-   [ ] Personnaliser les styles de `prose` dans `src/styles/global.css` en utilisant des surcharges CSS qui font référence aux variables du thème DaisyUI actif (ex: `var(--base-content)`, `var(--primary)`) pour ajuster les tailles de police, les interlignes, les couleurs des titres, des liens, du corps de texte, etc.
-   [ ] Créer ou modifier le layout d'article (ex: `src/layouts/ArticleLayout.astro`) pour envelopper le contenu `<slot />` avec un `<div>` appliquant les classes `prose` et `max-w-prose`.
-   [ ] S'assurer que les couleurs de texte et d'arrière-plan pour les modes clair et sombre offrent un contraste suffisant (WCAG AA).
-   [ ] Tester l'affichage d'un article MDX exemple pour vérifier l'application correcte de tous les styles typographiques et leur adaptation aux changements de thème.

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.

-   **Unit Tests:**
    -   N/A directement, mais la configuration Tailwind pourrait être inspectée si des tests de configuration étaient mis en place.
-   **Integration Tests (Visuels/Snapshot):**
    -   Des tests de snapshot sur le rendu HTML d'un composant d'article pourraient aider à détecter des régressions de classes CSS.
-   **Manual/CLI Verification:**
    -   Inspecter visuellement un article de test dans le navigateur (en modes clair et sombre) :
        -   Utiliser les outils de développement pour vérifier les polices appliquées, les tailles, les interlignes, les couleurs.
        -   Mesurer les contrastes de couleurs (ex: avec l'outil pipette des devtools ou une extension).
        -   Vérifier la largeur maximale du contenu.
    -   S'assurer que la classe `prose` et les classes de `max-w-prose` sont bien appliquées au conteneur du contenu de l'article.
-   _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

-   **Agent Model Used:** `<Agent Model Name/Version>`
-   **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
-   **Change Log:**
    -   Initial Draft

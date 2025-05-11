# Story 3.4: Affichage et copie des blocs de code

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux voir les blocs de code clairement mis en forme avec coloration syntaxique, numéros de ligne, et pouvoir copier le code facilement, afin de comprendre et réutiliser facilement les exemples de code fournis.

**Context:** Cette story est cruciale pour un blog technique. Elle s'assure que les extraits de code, qui sont un élément central des articles, sont présentés de manière professionnelle, lisible et fonctionnelle. Elle s'appuie sur la configuration du thème (Epic 1) et les spécifications UI/UX.

## Detailed Requirements

- Configurer Shiki pour la coloration syntaxique des blocs de code dans les fichiers MDX.
- Utiliser les thèmes Shiki `github-light` pour le mode clair et `github-dark` pour le mode sombre du site, ou des thèmes personnalisés équivalents comme spécifié dans `docs/ui-ux/ui-ux-spec.md#6.6`.
- Afficher les numéros de ligne par défaut pour les blocs de code.
- Implémenter un bouton "Copier" pour chaque bloc de code :
    - Le bouton doit être positionné en haut à droite du bloc de code.
    - Il doit être "sticky" à l'intérieur du bloc de code lors du défilement vertical du bloc lui-même (si le bloc est plus haut que la zone visible).
    - Au clic, le contenu complet du bloc de code (sans les numéros de ligne) est copié dans le presse-papiers.
    - Un feedback visuel (ex: changement d'icône, tooltip "Copié !") doit être fourni.
- Gérer le dépassement horizontal des lignes de code longues en activant le défilement horizontal pour le bloc de code.
- Afficher clairement le langage du bloc de code (ex: "javascript", "python", "java"), généralement au-dessus ou à côté du bouton "Copier".
- Le conteneur du bloc de code doit avoir un style distinct (fond, padding, coins arrondis) en accord avec `docs/ui-ux/ui-ux-spec.md#6.6` (ex: composant DaisyUI `mockup-code` ou `div` stylisé).

## Acceptance Criteria (ACs)

- AC1: Les blocs de code dans les articles MDX sont rendus avec une coloration syntaxique appropriée au langage spécifié (ex: ` ```javascript ... ``` `).
- AC2: La coloration syntaxique s'adapte automatiquement aux modes clair et sombre du site en utilisant les thèmes Shiki configurés.
- AC3: Les numéros de ligne sont affichés à gauche de chaque ligne de code.
- AC4: Un bouton "Copier" est visible sur chaque bloc de code et permet de copier le contenu brut du code (sans numéros de ligne) dans le presse-papiers.
- AC5: Un feedback visuel confirme la réussite de l'opération de copie.
- AC6: Les blocs de code avec des lignes plus longues que la largeur disponible présentent une barre de défilement horizontale. Les lignes ne doivent pas être retournées à la ligne de force.
- AC7: Le langage du code est affiché pour chaque bloc.
- AC8: Le style du conteneur du bloc de code (fond, padding, etc.) est conforme aux spécifications UI/UX.

## Technical Implementation Context

**Guidance:** Utiliser l'intégration Shiki d'Astro (ou un plugin remark/rehype compatible si nécessaire). Le bouton "Copier" nécessitera du JavaScript côté client.

- **Relevant Files:**
  - Files to Create/Modify: `astro.config.mjs` (pour la configuration de Shiki/MDX), un composant Astro pour le bloc de code personnalisé si nécessaire (ex: `src/components/article/CodeBlock.astro`) qui encapsulerait la logique du bouton "Copier", le layout d'article (`src/layouts/ArticleLayout.astro`) pour s'assurer que les styles s'appliquent.
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - Astro (intégration MDX, Shiki)
  - Shiki
  - JavaScript (pour la fonctionnalité de copie)
  - TailwindCSS (pour le style du conteneur et du bouton)
  - DaisyUI (pour le composant `mockup-code` ou des styles de bouton)
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - API Clipboard du navigateur (`navigator.clipboard.writeText()`).
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:**
  - Se référer à `docs/ui-ux/ui-ux-spec.md` (Section 6.6 Blocs de Code).
  - L'icône du bouton "Copier" pourrait changer temporairement après le clic (ex: de "copier" à "vérifié").
  - Le positionnement "sticky interne" du bouton Copier peut nécessiter du CSS spécifique (position relative sur le conteneur, position absolute/sticky sur le bouton).

- **Data Structures:**
  - N/A (concerne le rendu et l'interaction).
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - N/A
  - _(Hint: See `docs/environment-vars.md` for all variables)_

- **Coding Standards Notes:**
  - Le JavaScript pour la copie doit être simple, efficace et géré proprement dans le contexte des îles Astro si un composant est utilisé.
  - Assurer l'accessibilité du bouton "Copier" (`aria-label`).
  - _(Hint: See `docs/coding-standards.md` for full standards)_

## Tasks / Subtasks

- [ ] Configurer Shiki dans `astro.config.mjs` avec les thèmes `github-light` et `github-dark` (ou équivalents spécifiés).
- [ ] Activer l'option d'affichage des numéros de ligne avec Shiki.
- [ ] S'assurer que Shiki gère l'affichage du nom du langage.
- [ ] Créer un composant Astro (ex: `CodeBlockWrapper.astro`) ou modifier la configuration MDX pour ajouter le bouton "Copier" à chaque bloc de code.
- [ ] Implémenter la logique JavaScript pour copier le contenu du bloc de code dans le presse-papiers.
    - Cibler correctement le texte du code à l'exclusion des numéros de ligne.
- [ ] Ajouter un feedback visuel lors de la copie.
- [ ] Styler le conteneur du bloc de code (ex: `mockup-code` DaisyUI ou `div` stylisé) et le bouton "Copier" conformément aux spécifications UI/UX.
- [ ] S'assurer que le défilement horizontal fonctionne pour les lignes de code longues.
- [ ] Tester la fonctionnalité sur plusieurs navigateurs.
- [ ] Vérifier le positionnement "sticky interne" du bouton copier si le bloc de code lui-même est scrollable verticalement.

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.
- **Unit Tests:**
    - Si un composant Astro est créé pour le bouton "Copier", tester sa logique de copie (potentiellement en mockant `navigator.clipboard`).
- **Integration Tests (Visuels/Snapshot):**
    - Tests de snapshot sur le rendu HTML d'un article contenant des blocs de code pour vérifier la structure et les classes.
- **Manual/CLI Verification:**
    - Créer un article de test avec plusieurs blocs de code (différents langages, code court, code long horizontalement et verticalement).
    - Vérifier visuellement la coloration syntaxique dans les modes clair et sombre.
    - Vérifier la présence et l'affichage correct des numéros de ligne.
    - Tester la fonctionnalité "Copier" sur chaque bloc :
        - Le contenu copié est correct (pas de numéros de ligne).
        - Le feedback visuel apparaît.
    - Vérifier le défilement horizontal pour les lignes longues.
    - Vérifier l'affichage du langage.
    - Valider le style du conteneur et du bouton.
    - S'assurer que le bouton "Copier" reste visible et accessible quand on scrolle un long bloc de code verticalement.
- _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
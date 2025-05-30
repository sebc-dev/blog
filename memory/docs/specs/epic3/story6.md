# Story 3.6: Table des matières (ToC)

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux naviguer facilement au sein d'un long article grâce à une table des matières (ToC), afin d'accéder rapidement aux sections d'intérêt dans un article.

**Context:** Une table des matières améliore significativement la navigation dans les articles longs et techniques. Cette story se concentre sur sa génération, son affichage et son interactivité, en accord avec les spécifications UI/UX.

## Detailed Requirements

- Générer automatiquement une table des matières (ToC) pour chaque article à partir de ses titres de section (H2 et H3).
- Afficher la ToC de manière "sticky" (flottante et fixe lors du défilement) dans une colonne dédiée sur les écrans desktop (colonne de droite selon `docs/ui-ux/ui-ux-spec.md#6.4.1`).
- La ToC doit indiquer la section actuellement visible dans la fenêtre de lecture (highlighting de l'élément actif dans la ToC).
- Les éléments de la ToC doivent être des liens cliquables qui font défiler la page jusqu'à la section correspondante de l'article.
- Sur les écrans plus petits (tablette, mobile), la ToC doit se transformer en un menu déroulant accessible via un bouton, ou être intégrée de manière compacte, pour ne pas surcharger l'interface (selon `docs/ui-ux/ui-ux-spec.md#6.4.3`).
- La ToC ne doit s'afficher que si l'article contient un nombre minimum de sections (ex: au moins 3 titres H2/H3).
- Le style de la ToC (typographie, espacements, indicateur d'élément actif) doit être conforme à `docs/ui-ux/ui-ux-spec.md`.

## Acceptance Criteria (ACs)

- AC1: Une ToC est générée pour les articles contenant au moins 3 titres H2/H3. Les articles avec moins de sections n'affichent pas de ToC.
- AC2: La ToC liste correctement les titres H2 et H3 de l'article, en respectant leur hiérarchie.
- AC3: Sur desktop, la ToC est affichée dans une colonne de droite et reste visible (sticky) lors du défilement de l'article.
- AC4: Cliquer sur un lien dans la ToC fait défiler la page en douceur jusqu'à la section correspondante.
- AC5: La section de l'article actuellement visible à l'écran est mise en évidence (highlighting) dans la ToC.
- AC6: Sur les appareils mobiles/tablettes, la ToC est accessible via un mécanisme approprié (ex: bouton ouvrant un dropdown/drawer) et est utilisable.
- AC7: Le style de la ToC est conforme aux spécifications UI/UX (`docs/ui-ux/ui-ux-spec.md`).

## Technical Implementation Context

**Guidance:** Explorer les plugins MDX/Remark/Rehype pour extraire les titres et générer la structure de la ToC. L'interactivité (highlighting au scroll, sticky) nécessitera du JavaScript côté client et du CSS.

- **Relevant Files:**
  - Files to Create/Modify: `src/layouts/ArticleLayout.astro` (pour intégrer la ToC), un composant Astro pour la ToC (ex: `src/components/article/ArticleToc.astro`), potentiellement `astro.config.mjs` (pour ajouter des plugins remark/rehype).
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - Astro
  - MDX (plugins remark/rehype comme `remark-toc`, `rehype-slug`, `rehype-autolink-headings`, ou une solution personnalisée pour extraire les titres).
  - JavaScript (pour le highlighting au scroll, le comportement sticky, et le menu mobile).
  - TailwindCSS/CSS (pour le style et le positionnement sticky/responsive).
  - DaisyUI (pour les composants de dropdown/drawer sur mobile).
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - API Intersection Observer (JavaScript) peut être utile pour le highlighting au scroll.
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:**
  - Se référer à `docs/ui-ux/ui-ux-spec.md` (Sections 6.4.1 Page d'Article - Colonne Droite, et 6.4.3 Responsive Design).
  - Le highlighting doit être subtil mais clair.
  - Le défilement doit être fluide.
  - S'assurer que la ToC ne masque pas d'autres éléments importants.

- **Data Structures:**
  - Une structure de données représentant l'arbre des titres (texte, niveau, ancre/slug) sera nécessaire pour rendre la ToC.
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - N/A
  - _(Hint: See `docs/environment-vars.md` for all variables)_

- **Coding Standards Notes:**
  - Le code JavaScript pour l'interactivité doit être performant et éviter les recalculs excessifs lors du scroll.
  - Utiliser des ID uniques et valides pour les ancres des titres.
  - _(Hint: See `docs/coding-standards.md` for full standards)_

## Tasks / Subtasks

- [ ] Rechercher et choisir/implémenter une méthode pour extraire les titres H2/H3 du contenu MDX et générer leurs ancres (slugs).
    - Envisager `rehype-slug` pour générer les IDs des titres et `rehype-autolink-headings` pour ajouter des liens d'ancrage.
    - Un plugin remark personnalisé pourrait aussi collecter les titres.
- [ ] Créer un composant `ArticleToc.astro` qui prend la liste des titres et génère le HTML de la ToC.
- [ ] Implémenter la logique JavaScript pour :
    - Rendre la ToC sticky sur desktop.
    - Mettre en évidence l'élément actif dans la ToC en fonction de la section visible à l'écran (ex: avec Intersection Observer).
    - Gérer le défilement fluide vers les sections lors d'un clic.
- [ ] Intégrer le composant `ArticleToc.astro` dans `src/layouts/ArticleLayout.astro`.
- [ ] Styler la ToC (desktop et version mobile/dropdown) conformément aux spécifications UI/UX.
- [ ] Implémenter la logique pour n'afficher la ToC que si le nombre minimum de sections est atteint.
- [ ] Assurer la responsivité de la ToC (transformation en dropdown/drawer sur mobile).

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.
- **Unit Tests:**
    - Tester la logique d'extraction des titres si un script/plugin personnalisé est développé.
    - Tester le composant `ArticleToc.astro` avec différentes listes de titres pour vérifier le rendu HTML.
- **Integration Tests (E2E ou avec outils comme Playwright/Cypress si interaction complexe):**
    - Vérifier que la ToC est correctement générée pour un article de test.
    - Tester la navigation par clic sur les liens de la ToC.
    - Tester le highlighting de la section active lors du défilement.
    - Tester le comportement sticky.
- **Manual/CLI Verification:**
    - Créer un article de test avec une structure de titres variée (H2, H3).
    - Vérifier visuellement sur desktop :
        - La ToC s'affiche correctement et est sticky.
        - Les liens fonctionnent et le défilement est fluide.
        - Le highlighting de la section active fonctionne.
    - Vérifier visuellement sur mobile/tablette :
        - La ToC se transforme en un menu accessible (dropdown/drawer).
        - Les fonctionnalités de navigation et de highlighting sont préservées.
    - Vérifier qu'un article avec peu de titres n'affiche pas de ToC.
- _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
# Story 3.10: Affichage responsive des articles

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux accéder aux articles sur différents appareils (desktop, tablette, mobile) avec une expérience de lecture toujours optimale, afin de pouvoir lire confortablement le contenu quel que soit mon appareil.

**Context:** La majorité du trafic web étant mobile, une expérience responsive impeccable est non négociable. Cette story garantit que tous les éléments de la page d'article, y compris ceux développés dans les stories précédentes (ToC, partage, code, images), s'adaptent correctement à toutes les tailles d'écran.

## Detailed Requirements

- Le layout général de la page d'article doit être entièrement responsive.
- **Sur Desktop (large) :**
    - Affichage en 3 colonnes : Partage Social (gauche, sticky), Contenu Principal (centre, `max-w-prose`), Table des Matières (droite, sticky). (Conforme à `docs/ui-ux/ui-ux-spec.md#6.4.1`)
- **Sur Tablette :**
    - Potentiellement 2 colonnes : Contenu Principal, et Table des Matières (peut-être compactée ou transformée en icône/bouton).
    - La barre de partage social peut être plus compacte ou déplacée (ex: en bas de l'article ou via un bouton).
    - (Selon `docs/ui-ux/ui-ux-spec.md#6.4.3` : 2 colonnes Contenu, ToC. Partage compacté.)
- **Sur Mobile :**
    - Affichage en 1 seule colonne pour le contenu principal.
    - La Table des Matières doit se transformer en un menu déroulant accessible via un bouton (ex: icône "list" ou "sommaire") en haut de l'article ou intégrée dans un header d'article mobile. (Conforme à `docs/ui-ux/ui-ux-spec.md#6.4.3`)
    - Les boutons de partage social doivent être positionnés de manière accessible sans être intrusifs (ex: une barre horizontale en bas de l'écran, fixe ou apparaissant au scroll, ou un bouton "Partager" ouvrant une modale/menu). (Conforme à `docs/ui-ux/ui-ux-spec.md#6.4.3`)
- Tous les éléments interactifs (boutons, liens, ToC mobile) doivent être facilement cliquables sur des écrans tactiles (taille suffisante, espacement).
- La lisibilité du texte, la taille des polices, et les espacements doivent s'adapter pour rester optimaux sur chaque taille d'écran.
- Les images et les blocs de code doivent continuer à s'afficher correctement et être utilisables (scroll horizontal pour le code si besoin, images responsives).

## Acceptance Criteria (ACs)

- AC1: La page d'article s'affiche correctement sur les points d'arrêt standards de TailwindCSS (`sm`, `md`, `lg`, `xl`, `2xl`).
- AC2: Sur grand écran (desktop `lg+`), la mise en page à 3 colonnes (Partage, Contenu, ToC) est respectée.
- AC3: Sur tablette (ex: `md`), la mise en page s'adapte de manière utilisable (ex: 2 colonnes ou passage en mode mobile pour certains éléments comme la ToC).
- AC4: Sur mobile (ex: `<md`), la page s'affiche en une seule colonne, la ToC est accessible via un menu déroulant/bouton, et les options de partage sont adaptées.
- AC5: Tous les textes restent lisibles et les éléments interactifs sont facilement utilisables sur toutes les tailles d'écran.
- AC6: Les images sont responsives et les blocs de code gèrent correctement le dépassement sur petits écrans.
- AC7: La performance reste bonne sur mobile (pas de dégradation due à des scripts JS lourds pour la responsivité).

## Technical Implementation Context

**Guidance:** Utiliser intensivement les classes responsives de TailwindCSS (ex: `md:`, `lg:`) et potentiellement du JavaScript pour les transformations de composants plus complexes (comme la ToC mobile).

- **Relevant Files:**
  - Files to Modify: `src/layouts/ArticleLayout.astro`, `src/components/article/ArticleToc.astro`, `src/components/article/ShareButtons.astro` (ou équivalent pour le partage), et tous les composants enfants de la page d'article. Les fichiers CSS globaux ou spécifiques si des media queries complexes sont nécessaires au-delà de Tailwind.
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - Astro
  - TailwindCSS (classes responsives)
  - JavaScript (pour la logique des menus mobiles, drawers, etc.)
  - DaisyUI (pour les composants responsives comme `drawer`, `dropdown`)
  - CSS (Media Queries si besoin)
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - N/A
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:**
  - Se référer à `docs/ui-ux/ui-ux-spec.md` (Section 6.4.3 Responsive Design pour la Page d'Article et Section 8 Responsive Design et Points d'Arrêt).
  - Prioriser l'expérience mobile ("mobile-first").
  - Tester sur des appareils réels ou des simulateurs fiables.
  - Attention aux "zones de pouce" pour les interactions sur mobile.

- **Data Structures:**
  - N/A (concerne principalement le layout et le style).
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - N/A
  - _(Hint: See `docs/environment-vars.md` for all variables)_

- **Coding Standards Notes:**
  - Utiliser les utilitaires responsifs de Tailwind autant que possible avant d'écrire du CSS personnalisé.
  - Garder le JavaScript pour la responsivité au minimum et s'assurer qu'il est performant.
  - _(Hint: See `docs/coding-standards.md` for full standards)_

## Tasks / Subtasks

- [ ] Revoir le `src/layouts/ArticleLayout.astro` et appliquer les classes Tailwind responsives pour adapter la structure générale (passage de 3 colonnes à 1 colonne, etc.).
- [ ] Modifier le composant `ArticleToc.astro`:
    - Implémenter la version mobile (ex: bouton qui ouvre un `dropdown` ou `drawer` DaisyUI affichant la liste des titres).
    - Utiliser des classes responsives pour afficher/masquer la version desktop vs mobile.
- [ ] Modifier le composant de partage social :
    - Adapter son positionnement pour mobile (ex: barre horizontale en bas, ou menu).
    - S'assurer que les icônes restent cliquables.
- [ ] Vérifier le comportement des blocs de code sur mobile (défilement horizontal doit être fonctionnel).
- [ ] Vérifier le comportement des images et des `figure`/`figcaption` sur mobile.
- [ ] Tester en profondeur avec les outils de développement du navigateur (mode responsive) sur tous les breakpoints définis.
- [ ] Tester si possible sur quelques appareils physiques réels (iOS, Android).

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.
- **Unit Tests:**
    - N/A directement pour les aspects de layout responsive basés sur CSS, mais les logiques JS des composants mobiles (ToC dropdown) peuvent être testées unitairement.
- **Integration Tests (E2E avec Cypress/Playwright):**
    - Écrire des tests E2E qui redimensionnent la fenêtre d'affichage et vérifient :
        - La présence/absence de certains éléments (ex: ToC desktop vs bouton ToC mobile).
        - La cliquabilité des éléments interactifs en mode mobile.
        - L'absence de débordement horizontal.
- **Visual Regression Tests (Optionnel MVP, mais recommandé post-MVP):**
    - Utiliser des outils de régression visuelle pour comparer des captures d'écran de la page d'article sur différents breakpoints avant/après des changements.
- **Manual/CLI Verification:**
    - Utiliser intensivement les outils de développement des navigateurs pour simuler différentes tailles d'écran et appareils.
    - Vérifier chaque élément de la page d'article :
        - Header d'article (titre, métadonnées).
        - Corps du texte.
        - Blocs de code.
        - Images et légendes.
        - Table des Matières (desktop et mobile).
        - Boutons de partage (desktop et mobile).
    - Vérifier la lisibilité, les espacements, et l'absence de problèmes de layout (chevauchements, débordements).
- _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
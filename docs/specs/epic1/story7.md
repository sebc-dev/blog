# Story 1.7: Configuration Thème DaisyUI de Base (Couleurs, Typo)

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux configurer le thème DaisyUI de base (clair/sombre) avec la palette de couleurs et la typographie définies afin d'assurer une identité visuelle cohérente dès le début et respecter les spécifications UI/UX.

**Context:** Cette story fait suite à l'initialisation du projet Astro et à l'ajout des dépendances UI (Story 1.6). Elle applique les décisions de design initiales pour donner au blog son apparence de base.

## Detailed Requirements

Configurer les thèmes clair et sombre de DaisyUI dans `tailwind.config.cjs` en utilisant les valeurs HSL spécifiées dans `docs/ui-ux/ui-ux-spec.md`. Intégrer les polices de caractères (Inter, JetBrains Mono) et s'assurer que le plugin `@tailwindcss/typography` est configuré pour utiliser ces thèmes. Mettre en place un sélecteur de thème fonctionnel.

## Acceptance Criteria (ACs)

- AC1: Deux thèmes DaisyUI (ex: "customLight", "customDark") sont configurés dans `tailwind.config.cjs` et appliquent correctement les palettes de couleurs HSL (arrière-plans, textes, accents, primaires, etc.) définies dans `docs/ui-ux/ui-ux-spec.md` (Section 4.1).
- AC2: Les polices de caractères "Inter" (pour le corps et les titres) et "JetBrains Mono" (pour le code) sont configurées dans `tailwind.config.cjs` et correctement importées/appliquées sur le site.
- AC3: Le plugin `@tailwindcss/typography` (classe `prose`) est configuré pour respecter les couleurs des thèmes clair/sombre pour les éléments HTML générés à partir de MDX (liens, titres, listes, etc.).
- AC4: Un sélecteur de thème (bouton ou interrupteur) est présent (par exemple dans le Header) et permet à l'utilisateur de basculer fonctionnellement entre le thème clair et le thème sombre. La préférence de thème est persistée (ex: via `localStorage` et appliquée au chargement).

## Technical Implementation Context

**Guidance:** Modifier `tailwind.config.cjs` pour définir les thèmes DaisyUI et les familles de polices. Créer ou utiliser un composant Astro pour le sélecteur de thème.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/tailwind.config.cjs`
    - `frontend/src/styles/global.css` (pour l'import des polices si via CSS)
    - Un layout ou composant de header (ex: `frontend/src/components/common/Header.astro` ou `frontend/src/layouts/BaseLayout.astro`) pour intégrer le sélecteur de thème.
  - Files to Create:
    - Potentiellement un composant Astro pour le sélecteur de thème (ex: `frontend/src/components/common/ThemeSwitcher.astro`).
    - Un script JS pour la logique du sélecteur de thème et la persistance.
  - _(Hint: Se référer à `docs/ui-ux/ui-ux-spec.md` Sections 4.1, 4.2 et 6.1 pour les spécifications visuelles. Consulter la documentation DaisyUI pour la configuration des thèmes et TailwindCSS pour les polices.)_

- **Key Technologies:**
  - TailwindCSS
  - DaisyUI
  - Astro (pour les composants et la logique client)
  - JavaScript (pour la logique du sélecteur de thème)
  - `@tailwindcss/typography`
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - L'implémentation doit correspondre précisément aux spécifications de couleurs et de typographie de `docs/ui-ux/ui-ux-spec.md`.
  - Le sélecteur de thème doit être accessible et facile à utiliser.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Le code du composant de sélecteur de thème doit être propre et réutilisable.
  - Les configurations Tailwind/DaisyUI doivent être bien organisées.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Importer les polices de caractères "Inter" et "JetBrains Mono" (ex: via Google Fonts dans le `<head>` du layout de base, ou en les téléchargeant et en les servant localement via `@font-face` dans `global.css`).
- [ ] Configurer les familles de polices dans `frontend/tailwind.config.cjs` :
    ```javascript
    // tailwind.config.cjs
    module.exports = {
      // ...
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'], // Police par défaut pour le texte
            mono: ['JetBrains Mono', 'monospace'], // Police pour le code
          },
        },
      },
      // ...
    };
    ```
- [ ] Définir les thèmes DaisyUI "customLight" et "customDark" dans `frontend/tailwind.config.cjs` en utilisant les variables de couleur HSL spécifiées dans `docs/ui-ux/ui-ux-spec.md#4.1`. Exemple pour une couleur :
    ```javascript
    // tailwind.config.cjs
    module.exports = {
      // ...
      plugins: [require('daisyui')],
      daisyui: {
        themes: [
          {
            customLight: {
              "primary": "hsl(0 0% 9%)", // Noir adouci (boutons primaires)
              "primary-content": "hsl(0 0% 98%)", // Texte sur primaire (blanc cassé)
              "secondary": "hsl(0 0% 96.1%)", // Gris très clair (boutons secondaires)
              "secondary-content": "hsl(0 0% 3.9%)", // Texte sur secondaire (noir adouci)
              "accent": "hsl(0 0% 96.1%)", // Également gris très clair pour accent
              "neutral": "hsl(0 0% 26.1%)", // Gris-bleu foncé (texte nav latérale)
              "base-100": "hsl(0 0% 100%)", // Arrière-plan principal (blanc pur)
              "base-content": "hsl(0 0% 3.9%)", // Texte standard (noir profond adouci)
              // ... autres variables DaisyUI (info, success, warning, error, --b2, --b3 etc.) en HSL
              "--rounded-btn": "6px", // Bordure des boutons
            },
          },
          {
            customDark: {
              "primary": "hsl(0 0% 98%)", // Blanc cassé (boutons primaires)
              "primary-content": "hsl(0 0% 3.9%)", // Texte sur primaire (noir adouci)
              "secondary": "hsl(0 0% 14.9%)", // Gris très foncé (boutons secondaires)
              "secondary-content": "hsl(0 0% 98%)", // Texte sur secondaire (blanc cassé)
              "accent": "hsl(0 0% 14.9%)",
              "neutral": "hsl(240 4.8% 95.9%)", // Gris-bleu très clair (texte nav latérale)
              "base-100": "hsl(0 0% 3.9%)", // Arrière-plan principal (quasi-noir)
              "base-content": "hsl(0 0% 98%)", // Texte standard (blanc cassé)
              // ... autres variables DaisyUI en HSL
              "--rounded-btn": "6px",
            },
          },
        ],
        darkTheme: "customDark", // Spécifier quel thème est le thème sombre par défaut pour DaisyUI
      },
    };
    ```
- [ ] Configurer `@tailwindcss/typography` pour utiliser les couleurs des thèmes. Cela peut nécessiter de surcharger les styles `prose` dans `tailwind.config.js` ou via CSS pour s'aligner avec les couleurs `base-content`, `primary`, etc. des thèmes DaisyUI.
- [ ] Créer un composant `ThemeSwitcher.astro` :
    - Inclure un bouton ou un interrupteur (ex: DaisyUI `toggle` ou `swap`).
    - Ajouter un script côté client pour :
        - Lire la préférence de thème depuis `localStorage` au chargement.
        - Appliquer le thème à la balise `<html>` (ex: `document.documentElement.setAttribute('data-theme', theme);`).
        - Mettre à jour `localStorage` et l'attribut `data-theme` lors du changement de thème.
- [ ] Intégrer le `ThemeSwitcher.astro` dans un layout global ou le header.
- [ ] Tester l'application des polices et des couleurs des thèmes sur divers éléments (texte, boutons, fond).
- [ ] Tester le fonctionnement du sélecteur de thème et la persistance de la préférence.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Visual Verification:**
  - Inspecter les polices appliquées au corps du texte et aux blocs de code (via les outils de développement du navigateur).
  - Vérifier que les couleurs des thèmes clair et sombre correspondent aux spécifications pour les éléments clés (fonds, textes, boutons, liens `prose`).
  - Tester le sélecteur de thème : s'assurer qu'il bascule correctement l'apparence et que le choix est mémorisé après rechargement de la page ou fermeture/réouverture du navigateur.
  - Vérifier que les styles `prose` pour le contenu MDX s'adaptent bien aux thèmes.
- _(Hint: Voir `docs/strategie-tests.md` et `docs/ui-ux/ui-ux-spec.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
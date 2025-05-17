# Story 1.7.1: Configuration Thème DaisyUI de Base (Couleurs, Typo) avec Astro, TailwindCSS v4 et DaisyUI v5

**Status:** Draft

## 1. Goal & Context

**User Story:** En tant que Développeur (Dev), je veux configurer le thème DaisyUI v5 de base (clair/sombre) en utilisant TailwindCSS v4, avec la palette de couleurs et la typographie définies afin d'assurer une identité visuelle cohérente dès le début et respecter les spécifications UI/UX. [cite: 1]

**Context:** Cette story fait suite à l'initialisation du projet Astro et à l'ajout des dépendances UI (Story 1.6). [cite: 2] Elle applique les décisions de design initiales pour donner au blog son apparence de base, en tirant parti des nouvelles capacités de configuration "CSS-first" de TailwindCSS v4 et DaisyUI v5. [cite: 3] L'évolution vers TailwindCSS v4 et DaisyUI v5 marque une transition significative vers une approche de configuration "CSS-first". [cite: 4] Ce changement est motivé par les avancées des standards CSS, notamment la généralisation des variables CSS personnalisées (custom properties) et des fonctions comme `color-mix()`. [cite: 5] TailwindCSS v4 a été réécrit pour exploiter nativement ces fonctionnalités, ce qui permet de réduire la dépendance à JavaScript pour la configuration et durant la phase de compilation, tout en améliorant les performances. [cite: 5] En conséquence, DaisyUI, en tant que plugin TailwindCSS, a évolué vers sa version 5 pour s'aligner sur cette nouvelle architecture et bénéficier des mêmes avantages. [cite: 5] Pour cette story, cela signifie que les instructions de configuration abandonneront largement le fichier `tailwind.config.js` (ou `.cjs`) au profit de directives et de définitions directement dans les fichiers CSS. [cite: 5, 6]

## 2. Detailed Requirements

Configurer les thèmes clair et sombre de DaisyUI v5 directement dans le fichier CSS principal (par exemple, `frontend/src/styles/global.css`) en utilisant la directive `@plugin "daisyui"` et les valeurs HSL spécifiées dans `docs/ui-ux/ui-ux-spec.md`. [cite: 7] La configuration des thèmes s'effectue désormais principalement en CSS, ce qui représente un changement majeur par rapport aux versions précédentes qui utilisaient `tailwind.config.cjs`. [cite: 8]
Intégrer les polices de caractères ("Inter" pour le corps et les titres, "JetBrains Mono" pour le code) via la directive `@theme` de TailwindCSS v4 dans le même fichier CSS principal. [cite: 8] Il conviendra également de s'assurer de leur importation correcte, soit via des déclarations `@font-face` pour des polices locales, soit en utilisant des paquets Fontsource. [cite: 9] La configuration des polices migre également vers le CSS. [cite: 9]
S'assurer que le plugin `@tailwindcss/typography` est configuré via `@plugin "@tailwindcss/typography"` dans le fichier CSS et que ses styles (associés à la classe `prose`) sont adaptés pour utiliser les variables de couleur des thèmes DaisyUI (par exemple, `var(--base-content)` pour le texte, `var(--primary)` pour les liens). [cite: 10] L'intégration et la personnalisation du plugin se font donc en CSS, permettant une adaptation dynamique aux thèmes. [cite: 11]
Mettre en place un sélecteur de thème fonctionnel (bouton ou interrupteur). [cite: 11] Ce sélecteur permettra à l'utilisateur de basculer entre le thème clair et le thème sombre. [cite: 12] La préférence de thème devra être persistée en utilisant `localStorage` et appliquée dynamiquement à l'attribut `data-theme` de l'élément `<html>`. [cite: 13]
L'approche "CSS-first" simplifie la définition des thèmes et des polices en centralisant la personnalisation de TailwindCSS et DaisyUI dans les fichiers CSS. [cite: 13] TailwindCSS v4 expose les jetons de design (design tokens) comme des variables CSS natives, et DaisyUI v5 s'appuie sur ces variables pour permettre la définition de thèmes entièrement en CSS. [cite: 14] De même, la configuration des polices via `@theme` dans TailwindCSS v4 et le chargement de plugins comme Typography via une directive CSS suivent cette logique. [cite: 14] Cela réduit la complexité de la configuration JavaScript et rend le système de design plus directement accessible et modifiable via CSS, ce qui peut s'avérer plus intuitif pour les développeurs front-end. [cite: 14]

## 3. Acceptance Criteria (ACs)

-   AC1: Deux thèmes DaisyUI v5 (par exemple, "customLight", "customDark") sont configurés dans le fichier CSS principal (ex: `frontend/src/styles/global.css`) via la directive `@plugin "daisyui"`. [cite: 15] Ces thèmes appliquent correctement les palettes de couleurs HSL (arrière-plans, textes, accents, primaires, etc.) telles que définies dans `docs/ui-ux/ui-ux-spec.md` (Section 4.1). [cite: 16] Un des thèmes est désigné comme thème sombre par défaut pour la media query `prefers-color-scheme: dark`, conformément aux mécanismes de DaisyUI v5. [cite: 17]
-   AC2: Les polices de caractères "Inter" (pour le corps du texte et les titres) et "JetBrains Mono" (pour les blocs de code) sont configurées au sein du bloc `@theme` dans le fichier CSS principal. [cite: 17] Elles sont correctement importées (soit via des déclarations `@font-face` dans le CSS global, soit via des imports de paquets Fontsource dans les layouts Astro) et appliquées de manière effective sur l'ensemble du site. [cite: 18]
-   AC3: Le plugin `@tailwindcss/typography` (utilisé via la classe `prose`) est configuré dans le fichier CSS principal par la directive `@plugin "@tailwindcss/typography"`. [cite: 19] Ses styles de base, notamment la couleur du texte, des liens, et des titres, sont surchargés à l'aide de règles CSS additionnelles. [cite: 20] Ces surcharges utilisent les variables de couleur des thèmes DaisyUI (par exemple, `var(--base-content)`, `var(--primary)`, `var(--secondary)`) afin que le contenu `prose` s'adapte dynamiquement aux thèmes clair et sombre activés. [cite: 21]
-   AC4: Un sélecteur de thème, sous forme de bouton ou d'interrupteur, est présent (par exemple, dans le composant Header). [cite: 22] Il permet à l'utilisateur de basculer de manière fonctionnelle entre le thème clair et le thème sombre. [cite: 23] La préférence de thème de l'utilisateur est persistée grâce à `localStorage`. [cite: 24] Cette préférence est appliquée à l'attribut `data-theme` de la balise `<html>` dès le chargement initial de la page, afin d'éviter tout effet de "Flash Of Unstyled Content" (FOUC). [cite: 25]

_La réussite du critère d'acceptation AC3, qui concerne l'adaptation dynamique du contenu `prose`, est intrinsèquement liée à la mise en place correcte des variables CSS par DaisyUI (AC1) et à la capacité de surcharger les styles de `prose` en utilisant ces variables._ [cite: 26] _Le passage à TailwindCSS v4 et DaisyUI v5 rend cette approche plus naturelle, car l'ensemble du système de thématiques est géré par des variables CSS._ [cite: 27] _Lorsque le thème est modifié par le sélecteur (AC4), l'attribut `data-theme` de la balise `<html>` est mis à jour._ [cite: 28] _En réponse, DaisyUI actualise les valeurs de ses variables CSS (telles que `--p` pour la couleur primaire, `--s` pour la secondaire, `--bc` pour la couleur du contenu de base). [cite: 29] Si les styles du plugin `@tailwindcss/typography` sont configurés pour utiliser ces variables (par exemple, `color: var(--bc);` pour le texte et `color: var(--p);` pour les liens, comme stipulé dans AC3), alors les éléments `prose` hériteront automatiquement des nouvelles couleurs du thème actif._ [cite: 29] _Ce mécanisme ne nécessite aucune logique JavaScript supplémentaire pour re-thématiser le contenu `prose`, ce qui constitue une amélioration notable par rapport aux approches antérieures qui pouvaient nécessiter la manipulation de classes spécifiques (comme `dark:prose-invert`) ou des configurations JavaScript complexes._ [cite: 30]

## 4. Technical Implementation Context

**Guidance:**
La modification principale interviendra dans le fichier CSS global (par exemple, `frontend/src/styles/global.css`). [cite: 31] Ce fichier centralisera la configuration de TailwindCSS v4 (via `@theme` pour les polices et potentiellement d'autres jetons de design), l'import et la configuration de DaisyUI v5 (via `@plugin "daisyui" { themes: [...] }`), ainsi que l'import du plugin `@tailwindcss/typography` (via `@plugin "@tailwindcss/typography"`). [cite: 32] Des règles CSS spécifiques devront être ajoutées pour surcharger les styles de la classe `prose` afin qu'ils utilisent les variables de couleur des thèmes DaisyUI. [cite: 33] Un composant Astro sera créé ou mis à jour pour le sélecteur de thème. [cite: 34] Ce composant inclura un script côté client pour gérer la logique de basculement entre les thèmes et la persistance de la préférence utilisateur. [cite: 35]

_Bien que la configuration JavaScript soit réduite, la complexité peut se déplacer vers le fichier CSS principal, qui pourrait devenir volumineux._ [cite: 36] _Une organisation rigoureuse, incluant des commentaires et une structuration claire par sections, sera essentielle pour maintenir la lisibilité et la maintenabilité._ [cite: 37] _Néanmoins, pour de nombreux développeurs front-end, la manipulation directe du CSS est souvent perçue comme plus directe et intuitive que la navigation dans des fichiers de configuration JavaScript complexes. [cite: 38] TailwindCSS v4 encourage cette configuration en CSS, et DaisyUI v5 s'aligne sur cette approche. [cite: 38] Les polices, les thèmes et les plugins comme Typography sont tous configurés ou importés dans le CSS, ce qui signifie que le fichier `tailwind.config.js` devient minimaliste, voire disparaît pour la plupart des cas d'usage courants. [cite: 38] La "source unique de vérité" pour le système de design de base (couleurs, typographie) tend ainsi à devenir le CSS._ [cite: 38]

-   **Relevant Files:**

    -   Files to Modify:
        -   `frontend/src/styles/global.css`: Ce sera le fichier principal pour l'instruction `@import "tailwindcss"`, la configuration `@theme` de Tailwind, l'import et la configuration de `@plugin "daisyui"`, l'import de `@plugin "@tailwindcss/typography"`, les surcharges CSS pour la classe `prose`, et potentiellement les imports `@font-face` pour les polices locales. [cite: 39]
        -   Un layout global ou un composant d'en-tête (par exemple, `frontend/src/components/common/Header.astro` ou `frontend/src/layouts/BaseLayout.astro`): Nécessaire pour intégrer le sélecteur de thème et, de manière cruciale, le script anti-FOUC dans la section `<head>` du document HTML. [cite: 40]
    -   Files to Create:
        -   Potentiellement un nouveau composant Astro dédié au sélecteur de thème (par exemple, `frontend/src/components/common/ThemeSwitcher.astro`). [cite: 41]
        -   Un script JavaScript, qui peut être inclus de manière inline dans `ThemeSwitcher.astro` pour la logique d'interaction, et une partie dans `BaseLayout.astro` (pour le script anti-FOUC dans `<head>`), pour gérer la logique du sélecteur de thème et la persistance des préférences. [cite: 42]
    -   Files to Delete or Minimize:
        -   `frontend/tailwind.config.cjs`: Ce fichier sera soit supprimé, soit considérablement réduit. [cite: 43] TailwindCSS v4 vise une approche "zéro configuration" pour les scénarios d'utilisation courants. [cite: 44] Si des options de configuration très spécifiques, non gérables via la directive `@config` en CSS, s'avéraient nécessaires (ce qui est peu probable pour les besoins de cette story), le fichier pourrait subsister. [cite: 45] Des sources indiquent la possibilité d'utiliser `@config "./tailwind.config.js"` pour des cas avancés comme la configuration fine du plugin Typography, mais pour la gestion des couleurs, les variables CSS devraient être suffisantes. [cite: 46]

-   **Tableau Comparatif des Approches de Configuration:** [cite: 47]
    | Caractéristique | Ancienne Approche (Tailwind v3 / DaisyUI <v5) | Nouvelle Approche (Tailwind v4 / DaisyUI v5) | Fichier Principal Affecté |
    | ------------------------------------ | --------------------------------------------- | ---------------------------------------------------- | ------------------------- |
    | Définition des couleurs de base (hors thèmes) | `tailwind.config.js` (theme.extend.colors) | `@theme { --color-...:... }` en CSS (si besoin) | `global.css` |
    | Définition des polices | `tailwind.config.js` (theme.extend.fontFamily)| `@theme { --font-sans:... }` en CSS | `global.css` |
    | Thèmes DaisyUI | `tailwind.config.js` (daisyui.themes) | `@plugin "daisyui" { themes: [...] }` en CSS | `global.css` |
    | Plugin Typography | `require` dans `tailwind.config.js` | `@plugin "@tailwindcss/typography"` en CSS | `global.css` |
    _Ce tableau illustre la centralisation de la configuration de l'apparence vers les fichiers CSS, ce qui simplifie la structure globale du projet pour ces aspects._ [cite: 49]

-   **Key Technologies:**

    -   TailwindCSS v4 (et son moteur CSS sous-jacent, par exemple Lightning CSS)
    -   DaisyUI v5 [cite: 50]
    -   Astro (pour la structure des composants et la gestion de la logique côté client) [cite: 50]
    -   JavaScript (pour la logique interactive du sélecteur de thème) [cite: 50]
    -   `@tailwindcss/typography` (configuré et personnalisé en CSS) [cite: 50]

-   **UI/UX Notes:**

    -   L'implémentation doit correspondre avec une grande précision aux spécifications de couleurs (en format HSL) et de typographie détaillées dans le document `docs/ui-ux/ui-ux-spec.md`. [cite: 50]
    -   Le sélecteur de thème doit être conçu pour être accessible et d'une utilisation intuitive. [cite: 51]
        _L'utilisation de variables CSS pour les couleurs HSL, à la fois dans la définition des thèmes DaisyUI et dans les surcharges des styles `prose`, garantit une source unique de vérité pour les couleurs._ [cite: 52] _Cela facilite grandement la maintenance et assure une cohérence visuelle rigoureuse à travers toute l'application. [cite: 53] Si une couleur HSL doit être modifiée selon les spécifications, cette modification n'aura besoin d'être effectuée qu'à un seul endroit (dans la définition du thème DaisyUI), et elle se propagera automatiquement à tous les éléments concernés, y compris ceux stylisés par la classe `prose`._ [cite: 53]

-   **Coding Standards Notes:**
    -   Le code du composant Astro pour le sélecteur de thème doit être propre, réutilisable et adhérer aux bonnes pratiques de développement avec Astro. [cite: 54]
    -   Les configurations de TailwindCSS et DaisyUI au sein du fichier CSS principal doivent être bien organisées, clairement sectionnées et commentées pour en faciliter la compréhension et la maintenance future. [cite: 55]

## 5. Tasks / Subtasks

-   **Tâche 1: Importer les polices de caractères "Inter" et "JetBrains Mono".** [cite: 56]

    -   _Deux méthodes principales peuvent être envisagées pour l'importation des polices, conformément aux pratiques recommandées avec Astro._ [cite: 57]
    -   **Méthode 1 (Polices Locales):**
        -   Télécharger les fichiers de polices requis (de préférence au format WOFF2) et les placer dans `frontend/public/fonts/`. [cite: 57]
        -   Déclarer les polices via `@font-face` dans le fichier CSS principal (ex: `frontend/src/styles/global.css`). [cite: 58]
            ```css
            /* frontend/src/styles/global.css */
            @font-face {
                /* [cite: 59] */
                font-family: "Inter"; /* [cite: 59] */
                src: url("/fonts/Inter-Regular.woff2") format("woff2"); /* [cite: 59] */
                font-weight: normal; /* [cite: 60] */
                font-style: normal; /* [cite: 61] */
                font-display: swap; /* [cite: 61] */
            }
            @font-face {
                /* [cite: 62] */
                font-family: "Inter"; /* [cite: 62] */
                src: url("/fonts/Inter-Bold.woff2") format("woff2"); /* [cite: 63] */
                font-weight: bold; /* [cite: 63] */
                font-style: normal; /* [cite: 63] */
                font-display: swap; /* [cite: 63] */
            }
            @font-face {
                /* [cite: 64] */
                font-family: "JetBrains Mono"; /* [cite: 64] */
                src: url("/fonts/JetBrainsMono-Regular.woff2") format("woff2"); /* [cite: 64] */
                font-weight: normal; /* [cite: 64] */
                font-style: normal; /* [cite: 65] */
                font-display: swap; /* [cite: 65] */
            }
            /* Inclure d'autres poids et styles si utilisés */ /* [cite: 62, 66] */
            ```
    -   **Méthode 2 (Utilisation de Fontsource):**
        -   Installer les paquets npm: `npm install @fontsource/inter @fontsource/jetbrains-mono`. [cite: 66]
        -   Importer les CSS des polices dans un layout de base Astro (ex: `frontend/src/layouts/BaseLayout.astro`). [cite: 66, 67]
            ```astro
            // frontend/src/layouts/BaseLayout.astro
            ---
            import '@fontsource/inter/400.css'; // Inter Normal [cite: 67]
            import '@fontsource/inter/700.css'; // Inter Bold [cite: 68]
            // import '@fontsource/inter/variable.css'; // Pour police variable [cite: 68]
            import '@fontsource/jetbrains-mono/400.css'; // JetBrains Mono Normal [cite: 69]
            // Importer d'autres poids/styles si nécessaire [cite: 69]
            ---
            <html>...</html>
            ```
            _L'approche Fontsource est souvent privilégiée pour sa simplicité._ [cite: 69]

-   **Tâche 2: Configurer les familles de polices dans `frontend/src/styles/global.css` via `@theme`.** [cite: 70]

    -   _Avec TailwindCSS v4, la configuration se fait directement en CSS via `@theme`._ [cite: 71, 72]

        ```css
        /* frontend/src/styles/global.css */
        @import "tailwindcss"; /* [cite: 72] */ /* Doit être la première instruction Tailwind */ /* [cite: 73] */

        @theme {
            /* [cite: 73] */
            --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
                "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
                "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; /* [cite: 73] */
            --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo,
                Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* [cite: 74] */
            /* Autres jetons de design globaux si besoin */ /* [cite: 75] */
        }
        /* ... Reste de la configuration ... */ /* [cite: 76] */
        ```

    -   _Inclure une pile de polices de repli robuste._ [cite: 76]

-   **Tâche 3: Définir les thèmes DaisyUI "customLight" et "customDark" dans `frontend/src/styles/global.css`.** [cite: 77]

    -   _Utiliser la directive `@plugin "daisyui"` avec les palettes HSL._ [cite: 78]

        ```css
        /* frontend/src/styles/global.css */
        /* ... @import "tailwindcss", @font-face, @theme ... */

        @plugin "daisyui" { /* [cite: 78] */
          themes: [ /* [cite: 78] */
            {
              customLight: {
                "primary": "hsl(0 0% 9%)",      // Noir adouci (boutons primaires)
                "primary-content": "hsl(0 0% 98%)", // Texte sur primaire (blanc cassé)
                "secondary": "hsl(0 0% 96.1%)", // Gris très clair (boutons secondaires)
                "secondary-content": "hsl(0 0% 3.9%)",// Texte sur secondaire (noir adouci)
                "accent": "hsl(0 0% 96.1%)",    // Également gris très clair pour accent
                "neutral": "hsl(0 0% 26.1%)",   // Gris-bleu foncé (texte nav latérale)
                "base-100": "hsl(0 0% 100%)",  // Arrière-plan principal (blanc pur)
                "base-content": "hsl(0 0% 3.9%)", // Texte standard (noir profond adouci)
                // ... autres variables DaisyUI (info, success, warning, error) en HSL
                "--rounded-btn": "6px",        // Bordure des boutons
                "color-scheme": "light",      // Indique le schéma de couleur au navigateur
              },
            },
            {
              customDark: {
                "primary": "hsl(0 0% 98%)",    // Blanc cassé (boutons primaires)
                "primary-content": "hsl(0 0% 3.9%)", // Texte sur primaire (noir adouci)
                "secondary": "hsl(0 0% 14.9%)",// Gris très foncé (boutons secondaires)
                "secondary-content": "hsl(0 0% 98%)",// Texte sur secondaire (blanc cassé)
                "accent": "hsl(0 0% 14.9%)",
                "neutral": "hsl(240 4.8% 95.9%)",// Gris-bleu très clair (texte nav latérale)
                "base-100": "hsl(0 0% 3.9%)",  // Arrière-plan principal (quasi-noir)
                "base-content": "hsl(0 0% 98%)", // Texte standard (blanc cassé)
                // ... autres variables DaisyUI en HSL
                "--rounded-btn": "6px",
                "color-scheme": "dark",       // Indique le schéma de couleur au navigateur
              },
            },
          ],
          // darkTheme: "customDark", // Peut être géré par le script ou `prefers-color-scheme`
          // styled: true, // default [cite: 78]
          // utils: true,  // default [cite: 78]
          // prefix: "",   // default [cite: 78, 79]
          // logs: true,   // pour débogage [cite: 79]
        }
        ```

    -   _La désignation du thème sombre par défaut peut être gérée via `themes: "customLight --default, customDark --prefersdark"` ou par le script du ThemeSwitcher._ [cite: 79, 80, 81] _DaisyUI v5 et le script assureront l'application correcte._ [cite: 82]

-   **Tâche 4: Configurer `@tailwindcss/typography` et adapter ses couleurs.** [cite: 83]

    -   _Intégration et personnalisation en CSS pour utiliser les variables de thème DaisyUI._ [cite: 84]

        ```css
        /* frontend/src/styles/global.css */
        /* ... @import "tailwindcss", @theme, @plugin "daisyui" ... */

        @plugin "@tailwindcss/typography"; /* [cite: 84] */

        /* Surcharges pour @tailwindcss/typography */ /* [cite: 85] */
        /* Ces règles s'appliqueront globalement à .prose et s'adapteront dynamiquement. */ /* [cite: 86] */

        .prose {
            /* [cite: 87] */
            color: var(
                --base-content
            ); /* Couleur de base du texte */ /* [cite: 87] */
        }

        .prose :where(a):not(:where([class~="not-prose"] *)) {
            /* [cite: 89] */
            color: var(
                --primary
            ); /* Utilise la couleur primaire pour les liens */ /* [cite: 89] */
            text-decoration: none; /* Optionnel: supprime le soulignement */ /* [cite: 89, 90] */
        }
        .prose :where(a):not(:where([class~="not-prose"] *)):hover {
            /* [cite: 90] */
            color: var(
                --primary-focus,
                var(--primary)
            ); /* Couleur au survol */ /* [cite: 91] */
            text-decoration: underline; /* Optionnel: ajoute soulignement au survol */ /* [cite: 91, 92] */
        }

        .prose :where(strong):not(:where([class~="not-prose"] *)) {
            /* [cite: 92] */
            color: var(--base-content); /* Texte en gras */ /* [cite: 92, 93] */
        }

        .prose
            :where(h1, h2, h3, h4, h5, h6):not(:where([class~="not-prose"] *)) {
            /* [cite: 93] */
            color: var(
                --base-content
            ); /* Couleur des titres */ /* [cite: 93, 94] */
        }

        .prose :where(blockquote):not(:where([class~="not-prose"] *)) {
            /* [cite: 94] */
            color: var(
                --neutral-content,
                var(--base-content)
            ); /* Texte des citations */ /* [cite: 94, 95] */
            border-left-color: var(
                --neutral,
                var(--base-300)
            ); /* Bordure des citations */ /* [cite: 95] */
        }

        /* Code inline */
        .prose :where(code):not(:where([class~="not-prose"] *)):not(pre code) {
            /* [cite: 95] */
            color: var(
                --secondary-content,
                var(--base-content)
            ); /* [cite: 95, 96] */
            background-color: var(
                --secondary,
                hsl(0 0% 90%)
            ); /* [cite: 96, 97] */
            padding: 0.2em 0.4em; /* [cite: 97] */
            border-radius: 0.25rem; /* [cite: 98] */
            font-size: 0.875em; /* [cite: 98, 99] */
        }

        /* Blocs de code */
        .prose :where(pre):not(:where([class~="not-prose"] *)) {
            /* [cite: 99] */
            color: var(
                --neutral-content,
                var(--base-content)
            ); /* [cite: 99, 100] */
            background-color: var(
                --neutral,
                hsl(0 0% 10%)
            ); /* [cite: 100, 101] */
            border-radius: 0.375rem; /* [cite: 101, 102] */
            padding: 1em; /* [cite: 102, 103] */
        }
        .prose :where(pre code):not(:where([class~="not-prose"] *)) {
            /* [cite: 103] */
            background-color: transparent; /* [cite: 103, 104] */
            color: inherit; /* [cite: 104] */
            font-size: inherit; /* [cite: 104] */
            padding: 0; /* [cite: 104, 105] */
            border-radius: 0; /* [cite: 105] */
        }

        /* Styles additionnels pour listes, hr, etc. si besoin */ /* [cite: 105, 106, 107, 108] */
        /* Utiliser :where() pour faible spécificité et :not(:where([class~="not-prose"] *)) pour exclusion */ /* [cite: 108, 109, 110, 111] */
        ```

        _Cette approche garantit l'harmonisation des styles `prose` avec le thème DaisyUI actif._ [cite: 111] _Les variables DaisyUI changent avec `data-theme`, et les styles `prose` s'adaptent automatiquement._ [cite: 112, 113, 114]

-   **Tâche 5: Créer/Mettre à jour le composant `ThemeSwitcher.astro` et son script.** [cite: 115]

    -   **Script anti-FOUC** (à placer dans `<head>` du layout principal, ex: `frontend/src/layouts/BaseLayout.astro`, avec `is:inline`). [cite: 116, 117]
        ```html
        <head>
            <script is:inline>
                /* [cite: 117] */
                (function () {
                    /* [cite: 118] */
                    const THEMES_AVAILABLE = [
                        "customLight",
                        "customDark",
                    ]; /* Correspondre à la config DaisyUI */ /* [cite: 118] */
                    const DEFAULT_THEME = "customLight"; /* [cite: 118] */
                    const DARK_THEME = "customDark"; /* [cite: 118] */
                    let themeToApply = DEFAULT_THEME; /* [cite: 118] */
                    try {
                        /* [cite: 118, 119] */
                        const storedTheme =
                            localStorage.getItem("theme"); /* [cite: 119] */
                        if (
                            storedTheme &&
                            THEMES_AVAILABLE.includes(storedTheme)
                        ) {
                            /* [cite: 119] */
                            themeToApply = storedTheme; /* [cite: 119] */
                        } else {
                            if (
                                window.matchMedia &&
                                window.matchMedia(
                                    "(prefers-color-scheme: dark)"
                                ).matches
                            ) {
                                /* [cite: 119, 120] */
                                themeToApply = DARK_THEME; /* [cite: 120] */
                            }
                            if (
                                storedTheme &&
                                !THEMES_AVAILABLE.includes(storedTheme)
                            ) {
                                /* [cite: 120] */
                                localStorage.removeItem(
                                    "theme"
                                ); /* [cite: 120, 121] */
                            }
                        }
                    } catch (e) {
                        /* [cite: 121] */
                        console.warn(
                            "localStorage not accessible for theme persistence."
                        ); /* [cite: 121] */
                        if (
                            window.matchMedia &&
                            window.matchMedia("(prefers-color-scheme: dark)")
                                .matches
                        ) {
                            /* [cite: 122] */
                            themeToApply = DARK_THEME; /* [cite: 122, 123] */
                        }
                    }
                    document.documentElement.setAttribute(
                        "data-theme",
                        themeToApply
                    ); /* [cite: 123] */
                })();
            </script>
        </head>
        ```
    -   **Composant `ThemeSwitcher.astro`** (exemple avec DaisyUI `swap` ou `toggle`). [cite: 124]

        ```astro
        ---
        // frontend/src/components/common/ThemeSwitcher.astro
        const themes = ['customLight', 'customDark'] as const; /* [cite: 124] */
        type Theme = typeof themes[number]; // 'customLight' | 'customDark' [cite: 125, 126]

        const sunIcon = `<svg class="swap-on fill-current w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>`; /* [cite: 126] */ // (contenu SVG du soleil)
        const moonIcon = `<svg class="swap-off fill-current w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>`; /* [cite: 127] */ // (contenu SVG de la lune)
        ---
        <label class="swap swap-rotate btn btn-ghost btn-circle" title="Changer de thème"> /* [cite: 128] */
          <input type="checkbox" id="theme-toggle-checkbox" aria-label="Changer de thème" /> /* [cite: 128] */
          <Fragment set:html={sunIcon} /> /* [cite: 128] */
          <Fragment set:html={moonIcon} /> /* [cite: 128] */
        </label>

        <script define:vars={{ themesAvailable: themes, lightTheme: themes[0], darkTheme: themes[1] }}> /* [cite: 128] */
          const toggle = document.getElementById('theme-toggle-checkbox'); /* [cite: 128, 129] */
          const htmlElement = document.documentElement; /* [cite: 129] */

          function applyTheme(theme) { /* [cite: 129] */
            if (themesAvailable.includes(theme)) { /* [cite: 129] */
              htmlElement.setAttribute('data-theme', theme); /* [cite: 129] */
              try { localStorage.setItem('theme', theme); } catch (e) { console.warn('localStorage not accessible.'); } /* [cite: 130, 131] */
              if (toggle) { toggle.checked = (theme === darkTheme); } /* [cite: 132, 133] */
            } else { console.warn(`Invalid theme: ${theme}`); } /* [cite: 133, 134] */
          }

          const currentAppliedTheme = htmlElement.getAttribute('data-theme'); /* [cite: 134] */
          if (toggle && currentAppliedTheme) { toggle.checked = (currentAppliedTheme === darkTheme); } /* [cite: 135, 136] */

          if (toggle) { /* [cite: 136] */
            toggle.addEventListener('change', function() { /* [cite: 136] */
              const newTheme = this.checked ? darkTheme : lightTheme; /* [cite: 136] */
              applyTheme(newTheme); /* [cite: 136] */
            });
          }
          // Optionnel: Écouter changements de préférence système [cite: 137, 138]
        </script>
        ```

        _Ce script initialise le toggle et gère les changements de thème et la persistance._ [cite: 139] _Cohérence des noms de thèmes essentielle._ [cite: 140]

-   **Tâche 6: Tester l'application des polices et des couleurs des thèmes.** [cite: 141]

    -   Vérifier visuellement et avec les outils de dev que les polices Inter et JetBrains Mono sont appliquées. [cite: 142]
    -   S'assurer que les couleurs des thèmes correspondent aux spécifications HSL pour tous les éléments clés (fonds, textes, boutons, `prose`). [cite: 143]

-   **Tâche 7: Tester le fonctionnement du sélecteur de thème et la persistance.** [cite: 144]
    -   Confirmer que le sélecteur modifie `data-theme` sur `<html>`. [cite: 145]
    -   Vérifier sauvegarde dans `localStorage` et application au rechargement sans FOUC. [cite: 146]
    -   Valider adaptation dynamique des styles `prose` aux changements de thème. [cite: 147]

## 6. Testing Requirements

-   **Manual/Visual Verification:**

    -   Inspecter les polices appliquées (corps, titres, code) via les outils de dev. [cite: 148]
    -   Vérifier que les couleurs des thèmes clair/sombre correspondent aux specs HSL (fonds, textes, boutons, liens `prose`). [cite: 149, 150]
    -   Tester le sélecteur de thème : bascule correcte, mémorisation dans `localStorage`, application sans FOUC. [cite: 151]
    -   Confirmer adaptation fluide des styles `prose` aux changements de thème. [cite: 152]

-   **Tableau : Checklist de Vérification des Couleurs par Thème** [cite: 153]
    | Élément UI | Variable DaisyUI/CSS Attendue (ex) | Couleur HSL Spécifiée (customLight) | Couleur HSL Spécifiée (customDark) | Vérifié (Light) | Vérifié (Dark) |
    | ---------------------------------------- | ---------------------------------- | ----------------------------------- | ---------------------------------- | --------------- | -------------- |
    | Fond principal (`<body data-theme="">`) | `var(--b1)` / `base-100` | `hsl(0 0% 100%)` | `hsl(0 0% 3.9%)` | ☐ | ☐ |
    | Texte standard (paragraphe) | `var(--bc)` / `base-content` | `hsl(0 0% 3.9%)` | `hsl(0 0% 98%)` | ☐ | ☐ |
    | Bouton primaire (fond) | `var(--p)` / `primary` | `hsl(0 0% 9%)` | `hsl(0 0% 98%)` | ☐ | ☐ |
    | Bouton primaire (texte) | `var(--pc)` / `primary-content` | `hsl(0 0% 98%)` | `hsl(0 0% 3.9%)` | ☐ | ☐ |
    | Lien dans `.prose` | `var(--primary)` | `hsl(0 0% 9%)` | `hsl(0 0% 98%)` | ☐ | ☐ |
    | Titre H1 dans `.prose` | `var(--base-content)` | `hsl(0 0% 3.9%)` | `hsl(0 0% 98%)` | ☐ | ☐ |
    | Code inline `.prose` (fond) | `var(--secondary)` | `hsl(0 0% 96.1%)` | `hsl(0 0% 14.9%)` | ☐ | ☐ |
    | Code inline `.prose` (texte) | `var(--secondary-content)` | `hsl(0 0% 3.9%)` | `hsl(0 0% 98%)` | ☐ | ☐ |
    | Bloc de code `<pre>` `.prose` (fond) | `var(--neutral)` | `hsl(0 0% 26.1%)` | `hsl(240 4.8% 95.9%)` | ☐ | ☐ |
    | Bloc de code `<pre>` `.prose` (texte) | `var(--neutral-content)` | `hsl(0 0% 98%)` | `hsl(0 0% 3.9%)` | ☐ | ☐ |
    _Cette checklist assure que les critères AC1 et AC3 sont remplis en vérifiant l'implémentation des couleurs._ [cite: 155] _Elle établit un lien direct entre les éléments UI, les variables CSS et les valeurs HSL cibles._ [cite: 156]

## 7. Story Wrap Up (Agent Populates After Execution)

-   **Agent Model Used:** `<Agent Model Name/Version>`
-   **Completion Notes:** {À remplir après l'implémentation : notes sur les choix techniques, difficultés, solutions, ou suivi. [cite: 157] Par exemple : "La configuration de @tailwindcss/typography via des surcharges CSS directes utilisant les variables DaisyUI s'est avérée efficace et alignée avec la philosophie CSS-first. L'organisation du fichier global.css est devenue primordiale pour maintenir la clarté." [cite: 158] ou "Le script anti-FOUC a nécessité une attention particulière pour gérer correctement les thèmes valides et la détection de prefers-color-scheme." [cite: 159]}
-   **Change Log:**
    -   17-05-2025 (Date actuelle) : Mise à jour de la story pour intégrer TailwindCSS v4 et DaisyUI v5. [cite: 159] Adoption d'une configuration "CSS-first". [cite: 160] Adaptation des styles prose pour utiliser les variables de thème DaisyUI. [cite: 160] Révision complète des tâches et des exemples de code. [cite: 161]
    -   11-05-2025 : Initial Draft (version pour TailwindCSS v3 / DaisyUI < v5). [cite: 161]

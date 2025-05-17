# Story 1.6: Initialisation Projet Frontend Astro de Base

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux initialiser un nouveau projet Astro dans `frontend/` avec les dépendances de base (TypeScript, TailwindCSS, DaisyUI, PNPM) afin d'avoir un projet frontend Astro fonctionnel avec la stack UI définie.

**Context:** Cette story s'appuie sur la structure de monorepo créée (Story 1.5) et l'infrastructure Docker/VPS (Stories 1.2-1.4). Elle met en place le squelette de l'application frontend qui servira le blog.

## Detailed Requirements

Initialiser un projet Astro (version spécifiée dans `docs/teck-stack.md`) dans le répertoire `frontend/`. Installer et configurer TypeScript, TailwindCSS et DaisyUI. Utiliser PNPM comme gestionnaire de paquets. S'assurer qu'une page d'accueil Astro basique est affichable.

## Acceptance Criteria (ACs)

-   AC1: Un projet Astro (version spécifiée, ex: 5.7.12) est créé et fonctionnel dans le répertoire `frontend/`.
-   AC2: TypeScript est configuré et utilisable dans le projet Astro.
-   AC3: TailwindCSS est installé et configuré (`tailwind.config.cjs`, `postcss.config.cjs`, CSS global importé). Les classes utilitaires Tailwind sont fonctionnelles.
-   AC4: DaisyUI est installé comme plugin TailwindCSS et ses composants de base sont utilisables.
-   AC5: PNPM est utilisé pour la gestion des dépendances (`pnpm-lock.yaml` est présent).
-   AC6: Une page d'accueil Astro basique (ex: `src/pages/index.astro`) peut être rendue avec succès par le serveur de développement Astro (`pnpm dev`).
-   AC7: Le plugin `@tailwindcss/typography` est installé.

## Technical Implementation Context

**Guidance:** Utiliser les commandes d'initialisation Astro et les guides d'intégration pour TailwindCSS et DaisyUI.

-   **Relevant Files:**

    -   Files to Create/Modify in `frontend/`:
        -   `package.json` (géré par PNPM)
        -   `pnpm-lock.yaml` (géré par PNPM)
        -   `astro.config.ts`
        -   `tsconfig.json`
        -   `tailwind.config.cjs`
        -   `postcss.config.cjs`
        -   `src/styles/global.css` (ou un nom similaire pour importer Tailwind)
        -   `src/pages/index.astro` (page d'exemple)
        -   `src/env.d.ts`
    -   _(Hint: Voir `docs/project-structure.md` pour la structure cible du répertoire `frontend/` et `docs/ui-ux/ui-ux-spec.md` pour les attentes concernant le thème)_

-   **Key Technologies:**

    -   Astro (version 5.7.12 ou compatible, voir `docs/teck-stack.md`)
    -   TypeScript (version 5.8 ou compatible)
    -   TailwindCSS (version 4.1.6 ou compatible)
    -   DaisyUI (version 5.0.35 ou compatible)
    -   PNPM
    -   Node.js (version 22 LTS pour l'environnement de build/dev)
    -   `@tailwindcss/typography`
    -   _(Hint: Voir `docs/teck-stack.md`)_

-   **API Interactions / SDK Usage:**

    -   Non applicable pour cette story.

-   **UI/UX Notes:**

    -   Cette story pose les bases techniques. La configuration détaillée du thème DaisyUI avec les couleurs et polices spécifiques est couverte par la Story 1.7 (E1-F02).

-   **Data Structures:**

    -   Non applicable pour cette story.

-   **Environment Variables:**

    -   `ASTRO_TELEMETRY_DISABLED=1` peut être ajouté à `.env` ou au script de démarrage pour désactiver la télémétrie.
    -   _(Hint: Voir `docs/environnement-vars.md`)_

-   **Coding Standards Notes:**
    -   Suivre les conventions Astro et TypeScript.
    -   Organiser les fichiers de configuration proprement.
    -   _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

-   [x] Naviguer dans le répertoire `frontend/`.
-   [x] Initialiser un nouveau projet Astro avec PNPM : `pnpm create astro@latest . --template empty --typescript strict --install --git no`. (Ajuster la commande si un template plus adapté est disponible ou si des options interactives sont préférées).
-   [x] Installer TailwindCSS : `pnpm add @tailwindcss/vite@^4.1.7 tailwindcss@^4.1.7`.
-   [x] Configurer Astro pour utiliser TailwindCSS en créant ou modifiant `astro.config.ts` :

    ```typescript
    // astro.config.ts
    import { defineConfig } from "astro/config";
    import tailwindcss from "@tailwindcss/vite";

    // https://astro.build/config
    export default defineConfig({
        vite: {
            plugins: [tailwindcss()],
        },
    });
    ```

-   [x] Créer/Modifier `src/styles/global.css` et y ajouter les directives Tailwind :
    ```css
    @import "tailwindcss";
    @plugin "@tailwindcss/typography";
    @plugin "daisyui";
    ```
-   [x] Importer ce fichier CSS global dans un layout de base ou directement dans `src/pages/index.astro` pour test :
    ```astro
    ---
    import "../styles/global.css";
    ---
    ```
-   [x] Installer DaisyUI : `pnpm add -D daisyui@^5.0.35`.
-   [x] Installer le plugin `@tailwindcss/typography`: `pnpm add -D @tailwindcss/typography@^0.5.16`.
-   [x] Créer une page d'accueil simple `frontend/src/pages/index.astro` qui utilise une classe Tailwind et un composant DaisyUI pour vérifier l'installation. Exemple :
    ```astro
    ---
    // src/pages/index.astro
    import "../styles/global.css";
    ---
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width" />
        <meta name="generator" content={Astro.generator} />
        <title>Astro Blog Test</title>
    </head>
    <body>
        <h1 class="text-3xl font-bold text-blue-600 p-4">Hello Astro!</h1>
        <button class="btn btn-primary">DaisyUI Button</button>
    </body>
    </html>
    ```
-   [x] Lancer le serveur de développement Astro (`pnpm dev` depuis le répertoire `frontend/`) et vérifier que la page s'affiche correctement avec les styles appliqués.
-   [x] S'assurer que le fichier `pnpm-lock.yaml` est généré.
-   [x] Ajouter les fichiers générés (`astro.config.ts`, `src/styles/global.css`, `src/pages/index.astro`, `tsconfig.json`, `package.json`, `pnpm-lock.yaml`) à Git.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

-   **Manual/CLI Verification:**
    -   Le projet Astro se lance sans erreur avec `pnpm dev`.
    -   La page d'accueil s'affiche dans le navigateur.
    -   Les styles Tailwind (ex: `text-3xl font-bold text-blue-600`) sont appliqués.
    -   Le composant DaisyUI (ex: `btn btn-primary`) est correctement stylisé.
    -   Le fichier `pnpm-lock.yaml` existe dans `frontend/`.
    -   La compilation pour la production (`pnpm build`) s'exécute sans erreur (vérification basique, le Dockerfile sera testé plus tard).
-   _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

-   **Agent Model Used:** `<Agent Model Name/Version>`
-   **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
-   **Change Log:**
    -   Initial Draft

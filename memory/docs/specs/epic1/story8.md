# Story 1.8: Création Layout de Base (Header/Footer Squelettes)

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux créer le layout de base (`BaseLayout.astro`) incluant le header et le footer globaux (structure vide) afin d'avoir une structure de page cohérente pour l'ensemble du site.

**Context:** Cette story s'appuie sur l'initialisation du projet Astro (Story 1.6) et la configuration du thème (Story 1.7). Elle définit l'ossature principale de toutes les pages du blog.

## Detailed Requirements

Créer un fichier `BaseLayout.astro` qui contiendra la structure HTML commune à toutes les pages (balise `<html>`, `<head>`, `<body>`). Ce layout inclura des placeholders ou des versions squelettes des composants `Header.astro` et `Footer.astro`. L'attribut `lang` sur `<html>` doit être défini dynamiquement. Un lien d'évitement "Skip to content" doit être implémenté.

## Acceptance Criteria (ACs)

- AC1: Un fichier `frontend/src/layouts/BaseLayout.astro` est créé.
- AC2: `BaseLayout.astro` contient la structure HTML de base (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
- AC3: L'attribut `lang` de la balise `<html>` est dynamiquement défini en fonction de la locale Astro actuelle (ex: `Astro.currentLocale`).
- AC4: Le `<head>` inclut les métadonnées de base (charset, viewport), un `<title>` par défaut ou configurable, et l'import du CSS global.
- AC5: Des composants `frontend/src/components/common/Header.astro` et `frontend/src/components/common/Footer.astro` sont créés (même avec un contenu placeholder initial).
- AC6: `BaseLayout.astro` intègre les composants `Header.astro` et `Footer.astro`.
- AC7: `BaseLayout.astro` définit un `<slot />` principal pour injecter le contenu spécifique des pages.
- AC8: Un lien d'évitement ("Skip to main content") est implémenté et fonctionnel (visible au focus clavier, mène au contenu principal).

## Technical Implementation Context

**Guidance:** Créer les fichiers Astro et s'assurer que le layout peut être utilisé par une page d'exemple.

- **Relevant Files:**
  - Files to Create:
    - `frontend/src/layouts/BaseLayout.astro`
    - `frontend/src/components/common/Header.astro`
    - `frontend/src/components/common/Footer.astro`
  - Files to Modify:
    - `frontend/src/pages/index.astro` (pour utiliser `BaseLayout.astro`)
  - _(Hint: Voir `docs/project-structure.md` et `docs/ui-ux/ui-ux-spec.md` Sections 5.1, 6.1 pour les attentes concernant le header/footer)_

- **Key Technologies:**
  - Astro
  - HTML, CSS
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Le design détaillé du header et du footer sera traité dans des stories ultérieures. Ici, il s'agit de la structure.
  - Le lien d'évitement est une exigence d'accessibilité clé.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Utiliser du HTML sémantique.
  - La structure des composants Astro doit être claire.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer le répertoire `frontend/src/components/common/`.
- [ ] Créer `frontend/src/components/common/Header.astro` avec un contenu placeholder :
    ```astro
    ---
    // src/components/common/Header.astro
    ---
    <header class="bg-base-200 p-4">
      <p>Global Header Placeholder</p>
      </header>
    ```
- [ ] Créer `frontend/src/components/common/Footer.astro` avec un contenu placeholder :
    ```astro
    ---
    // src/components/common/Footer.astro
    ---
    <footer class="bg-base-200 p-4 mt-8 text-center">
      <p>&copy; {new Date().getFullYear()} Blog Technique Bilingue. Placeholder.</p>
    </footer>
    ```
- [ ] Créer `frontend/src/layouts/BaseLayout.astro` :
    ```astro
    ---
    // src/layouts/BaseLayout.astro
    import Header from '../components/common/Header.astro';
    import Footer from '../components/common/Footer.astro';

    // Props pour le titre de la page, description, etc.
    export interface Props {
        title?: string;
        description?: string;
    }

    const {
        title = 'Blog Technique Bilingue', // Titre par défaut
        description = 'Un blog sur IA, UX, Ingénierie & Tauri', // Description par défaut
    } = Astro.props;

    const currentLang = Astro.currentLocale || 'fr'; // 'fr' comme fallback si i18n non encore pleinement configuré
    ---
    <!DOCTYPE html>
    <html lang={currentLang} data-theme="customLight"> {/* Thème par défaut, sera géré par ThemeSwitcher */}
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="description" content={description} />
        <title>{title}</title>
        <link rel="stylesheet" href="/src/styles/global.css"> {/* Assurez-vous que ce chemin est correct */}
        {/* Scripts pour le thème, etc. peuvent être ajoutés ici ou via des composants Astro */}
    </head>
    <body class="font-sans bg-base-100 text-base-content min-h-screen flex flex-col">
        <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-content">
            Aller au contenu principal
        </a>

        <Header />

        <main id="main-content" class="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
            <slot /> {/* Contenu de la page spécifique */}
        </main>

        <Footer />
        {/* Scripts globaux peuvent être chargés ici */}
    </body>
    </html>
    ```
    *Note : S'assurer que le chemin vers `global.css` est correct. Il pourrait être `/styles/global.css` si le répertoire `src` n'est pas dans le chemin public.*
- [ ] Mettre à jour `frontend/src/pages/index.astro` (ou une autre page de test) pour utiliser `BaseLayout.astro` :
    ```astro
    ---
    // src/pages/index.astro
    import BaseLayout from '../layouts/BaseLayout.astro';
    ---
    <BaseLayout title="Accueil - Blog Technique" description="Page d'accueil du blog technique bilingue.">
      <h1 class="text-2xl font-bold">Contenu de la Page d'Accueil</h1>
      <p>Bienvenue sur le blog !</p>
      <button class="btn btn-accent mt-4">Test Button</button>
    </BaseLayout>
    ```
- [ ] Lancer `pnpm dev` et vérifier :
    - Que la page d'accueil s'affiche avec le header et le footer placeholder.
    - Que l'attribut `lang` de `<html>` est correct.
    - Que le titre de la page est correct.
    - Que le lien d'évitement "Aller au contenu principal" apparaît lors de la navigation au clavier (Tab) et fonctionne.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Visual Verification:**
  - Ouvrir une page utilisant `BaseLayout.astro` dans le navigateur.
  - Vérifier la présence du header et du footer (même s'ils sont des placeholders).
  - Inspecter le code source de la page pour vérifier la structure HTML, l'attribut `lang` sur `<html>`, les métadonnées de base dans `<head>`, et le titre.
  - Tester la fonctionnalité du lien d'évitement en naviguant avec la touche Tab. Il doit devenir visible et, en cliquant dessus (ou Entrée), le focus doit se déplacer vers l'élément avec `id="main-content"`.
- _(Hint: Voir `docs/strategie-tests.md` et `docs/ui-ux/ui-ux-spec.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
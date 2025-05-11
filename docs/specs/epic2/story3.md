# Story 2.3: Configuration Routage i18n Astro avec Préfixes de Langue

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur Frontend (DevFE), je veux configurer le routage i18n d'Astro pour utiliser des préfixes de langue dans les URLs (ex: `/fr/...`, `/en/...`) afin d'assurer que chaque langue a une URL distincte et que les utilisateurs et les moteurs de recherche peuvent y accéder correctement.

**Context:** Cette story est une étape clé de l'Epic 2 pour mettre en place le système bilingue. Elle active la fonctionnalité de routage internationalisé d'Astro, qui est fondamentale pour servir le contenu dans différentes langues via des URLs distinctes.

## Detailed Requirements

Configurer les options d'internationalisation (i18n) dans `astro.config.mjs`. Spécifier les `locales` supportées (français et anglais), la `defaultLocale`, et configurer le `routing` pour que la locale par défaut soit également préfixée dans l'URL (ex: `/en/...` même si l'anglais est la langue par défaut).

## Acceptance Criteria (ACs)

- AC1: Le fichier `frontend/astro.config.mjs` est mis à jour avec une section de configuration `i18n`.
- AC2: Les `locales` configurées sont `['en', 'fr']` (ou `['fr', 'en']`).
- AC3: La `defaultLocale` est définie (ex: `en`).
- AC4: L'option de routage `routing: { prefixDefaultLocale: true }` est configurée dans la section `i18n`.
- AC5: Après configuration, les pages du site (ex: la page d'accueil `index.astro`) sont accessibles via leurs URLs préfixées par la langue (ex: `http://localhost:4321/en/` et `http://localhost:4321/fr/`).
- AC6: Tenter d'accéder à une URL sans préfixe (ex: `http://localhost:4321/`) doit rediriger vers l'URL préfixée de la `defaultLocale` (ex: vers `http://localhost:4321/en/`).

## Technical Implementation Context

**Guidance:** Modifier `frontend/astro.config.mjs` en suivant la documentation d'Astro sur l'i18n.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/astro.config.mjs`
  - Files to Test Access With:
    - `frontend/src/pages/index.astro` (et potentiellement d'autres pages si créées)
  - _(Hint: Consulter la documentation officielle d'Astro pour la configuration `i18n`. Se référer à `docs/bilinguisme/gestion-contenu.md` Section 7.1.)_

- **Key Technologies:**
  - Astro (configuration i18n)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Impacte directement la structure des URLs visibles par l'utilisateur et utilisées pour la navigation.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - La configuration dans `astro.config.mjs` doit être propre.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Ouvrir le fichier `frontend/astro.config.mjs`.
- [ ] Ajouter ou modifier la section `i18n` dans la configuration `defineConfig` :
    ```javascript
    // frontend/astro.config.mjs
    import { defineConfig } from 'astro/config';
    import tailwind from "@astrojs/tailwind";
    import mdx from "@astrojs/mdx"; // S'assurer que MDX est là si on a des .mdx
    // ... autres imports

    export default defineConfig({
      // ... autres configurations (ex: site, integrations)
      integrations: [
        tailwind({
          applyBaseStyles: false, // Si DaisyUI ou CSS global gère les styles de base
        }),
        mdx(), // Nécessaire pour les collections de contenu MDX
        // ... autres intégrations
      ],
      i18n: {
        defaultLocale: 'en', // Choisir la langue par défaut
        locales: ['en', 'fr'],
        routing: {
          prefixDefaultLocale: true, // '/en/...' sera utilisé même pour la langue par défaut
          // fallback: { 'es': 'en' } // Optionnel: si on avait d'autres langues
        }
      }
    });
    ```
- [ ] S'assurer que des pages existent au moins pour la structure de base. Par exemple, si `src/pages/index.astro` existe, il servira de page d'accueil pour chaque locale. Pour des pages spécifiques à une langue non traduite, il faudra gérer les redirections ou les 404 plus tard, ou utiliser les fallbacks.
- [ ] Si le serveur de développement est en cours, l'arrêter et le redémarrer (`pnpm --filter ./frontend dev`) pour que les changements de configuration `astro.config.mjs` soient pris en compte.
- [ ] Tester l'accès aux URLs :
    - `http://localhost:4321/en/` (doit afficher la page d'accueil en anglais, ou le contenu de `src/pages/index.astro` interprété pour 'en').
    - `http://localhost:4321/fr/` (doit afficher la page d'accueil en français, ou le contenu de `src/pages/index.astro` interprété pour 'fr').
    - `http://localhost:4321/` (doit rediriger vers `http://localhost:4321/en/` si 'en' est `defaultLocale`).
- [ ] (Optionnel) Créer des pages simples comme `src/pages/about.astro`. Vérifier que `http://localhost:4321/en/about` et `http://localhost:4321/fr/about` fonctionnent. Astro créera ces routes pour chaque locale à partir de la page unique `src/pages/about.astro` si des versions spécifiques `src/pages/en/about.astro` n'existent pas.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Server Restart & URL Testing:**
  - Redémarrer le serveur de développement Astro.
  - Accéder aux URLs préfixées pour chaque langue (ex: `/en/`, `/fr/`) et vérifier qu'elles servent du contenu (même si c'est la même page `index.astro` pour l'instant).
  - Accéder à l'URL racine (sans préfixe) et vérifier la redirection vers la `defaultLocale` préfixée.
- **Manual Verification:**
  - Inspecter le fichier `astro.config.mjs` pour confirmer la configuration i18n.
- _(Hint: Voir `docs/strategie-tests.md` et `docs/bilinguisme/gestion-contenu.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
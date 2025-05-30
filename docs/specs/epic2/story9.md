# Story 2.9 : Gestion Statique de la Langue et Utilitaires i18n

**Status:** Completed

## Goal & Context

**User Story :** En tant qu'Utilisateur, je veux avoir une expérience de navigation bilingue fluide avec une détection automatique de la langue basée sur l'URL et des utilitaires de traduction robustes, afin de pouvoir naviguer entre les langues sans friction tout en gardant une architecture statique simple.

**Context :** Cette story de l'Epic 2 améliore l'expérience utilisateur bilingue en adoptant une approche entièrement statique. Elle s'appuie sur le routage i18n d'Astro natif et fournit les utilitaires nécessaires pour la gestion des langues. Cette approche a été préférée pour maintenir la simplicité et les performances du site statique.

## Detailed Requirements

Mettre en place un système de gestion de langue entièrement statique basé sur l'URL. Un middleware Astro minimal (`src/middleware.ts`) détecte la langue à partir de l'URL et la stocke dans `locals.currentLang` pour les composants. Les utilitaires i18n (`src/lib/i18n/`) gèrent la détection de langue, les traductions, et la génération de chemins traduits. La configuration i18n est centralisée et cohérente entre Astro et les utilitaires custom. Cette approche évite toute complexité liée aux cookies et redirections automatiques.

## Acceptance Criteria (ACs)

-   AC1 : Un fichier `frontend/src/middleware.ts` simple est créé pour détecter la langue depuis l'URL et la stocker dans `locals.currentLang`.
-   AC2 : Un système de configuration i18n centralisé (`src/lib/i18n/config.ts`) est mis en place avec les langues supportées et la langue par défaut.
-   AC3 : Les utilitaires i18n (`src/lib/i18n/i18nUtils.ts`) fournissent :
    -   `getLangFromUrl(url)` : détection de langue depuis l'URL
    -   `t(key, lang)` : fonction de traduction
    -   `useTranslations(lang)` : hook de traduction pour une langue
    -   `getTranslatedPath(localeToSwitchTo, currentPathname, currentLocale)` : génération de chemins traduits
-   AC4 : La configuration Astro (`astro.config.ts`) utilise la même configuration i18n que les utilitaires.
-   AC5 : Le routage ne redirige jamais automatiquement les utilisateurs - ils naviguent explicitement vers les URLs avec préfixes de langue.
-   AC6 : La langue par défaut (anglais) n'a pas de préfixe dans l'URL (`prefixDefaultLocale: false`).
-   AC7 : La documentation (`docs/bilinguisme/gestion-contenu.md` Section 6.2) est mise à jour pour refléter l'approche statique finale.

## Technical Implementation Context

**Guidance:** Utiliser l'API i18n native d'Astro avec une approche entièrement statique. Pas de cookies, pas de localStorage, pas de redirections automatiques. La langue est déterminée uniquement par l'URL.

-   **Relevant Files :**

    -   Files Created:
        -   `frontend/src/middleware.ts`
        -   `frontend/src/lib/i18n/config.ts`
        -   `frontend/src/lib/i18n/i18nUtils.ts`
        -   `frontend/src/lib/i18n/index.ts`
        -   `frontend/src/lib/i18n/locales/en.ts`
        -   `frontend/src/lib/i18n/locales/fr.ts`
    -   Files Modified :
        -   `frontend/astro.config.ts`
        -   `frontend/src/env.d.ts`
        -   `docs/bilinguisme/gestion-contenu.md`

-   **Key Technologies :**

    -   Astro (i18n natif, Middleware, `Astro.locals`)
    -   TypeScript (pour le typage des traductions)

-   **API Interactions / SDK Usage :**

    -   Non applicable pour cette story.

-   **UI/UX Notes :**

    -   Approche explicite : les utilisateurs choisissent leur langue via les sélecteurs
    -   Pas de redirection automatique - navigation intentionnelle
    -   URLs claires et prévisibles
    -   Performance optimale grâce à l'approche statique

-   **Data Structures :**

    -   Configuration i18n centralisée
    -   Fichiers de traduction TypeScript typés
    -   Interface standardisée pour les utilitaires

-   **Environment Variables :**

    -   Non applicable pour cette story.

-   **Coding Standards Notes :**
    -   Middleware minimal et performant
    -   Utilitaires réutilisables et bien typés
    -   Configuration partagée entre Astro et les utilitaires
    -   Code documenté et maintenable

## Tasks / Subtasks

-   [x] Créer `frontend/src/lib/i18n/config.ts`:

```typescript
export const i18nConfig = {
    defaultLocale: "en",
    locales: ["en", "fr"],
    routing: {
        prefixDefaultLocale: false, // Pas de préfixe pour l'anglais
    },
};

export type Locale = "en" | "fr";
export type DefaultLocale = "en";
```

-   [x] Créer `frontend/src/middleware.ts`:

```typescript
import { defineMiddleware } from "astro:middleware";
import { getLangFromUrl } from "./lib/i18n";

export const onRequest = defineMiddleware(async (context, next) => {
    const { request, locals } = context;
    const url = new URL(request.url);

    // Éviter le traitement pour les assets ou les fichiers API
    if (
        url.pathname.startsWith("/assets/") ||
        url.pathname.startsWith("/api/")
    ) {
        return next();
    }

    // Utiliser la fonction existante pour déterminer la langue
    locals.currentLang = getLangFromUrl(url);

    return next();
});
```

-   [x] Créer les utilitaires i18n complets dans `frontend/src/lib/i18n/i18nUtils.ts`
-   [x] Configurer `frontend/astro.config.ts` pour utiliser la configuration i18n partagée
-   [x] Mettre à jour `frontend/src/env.d.ts` pour déclarer `currentLang` dans `App.Locals`
-   [x] Créer les fichiers de traductions dans `frontend/src/lib/i18n/locales/`
-   [x] Tester le système complet :
    1. Navigation vers `/` (anglais par défaut, pas de préfixe)
    2. Navigation vers `/fr/` (français avec préfixe)
    3. Utilisation des utilitaires de traduction
    4. Génération correcte des chemins traduits
    5. Fonctionnement du sélecteur de langue
-   [x] Mettre à jour `docs/bilinguisme/gestion-contenu.md` (Section 6.2)

## Testing Requirements

**Guidance:** Vérifier l'implémentation statique par rapport aux ACs.

-   **Manual/Browser Testing:**
    -   **Scénario 1 (Navigation anglaise):** Visiter `http://localhost:4321/`. Vérifier que la page s'affiche en anglais sans redirection.
    -   **Scénario 2 (Navigation française):** Visiter `http://localhost:4321/fr/`. Vérifier que la page s'affiche en français.
    -   **Scénario 3 (Détection de langue):** Vérifier que `getLangFromUrl` retourne la bonne langue pour différentes URLs.
    -   **Scénario 4 (Sélecteur de langue):** Utiliser le sélecteur pour naviguer entre `/` et `/fr/`. Vérifier la navigation directe sans redirection.
    -   **Scénario 5 (Chemins traduits):** Tester la génération de chemins traduits avec `getTranslatedPath`.
    -   **Scénario 6 (Pages spécifiques):** Tester les pages avec URLs différentes (ex: `/about/` ↔ `/fr/a-propos/`).

## Story Wrap Up

-   **Agent Model Used:** Claude Sonnet 4
-   **Completion Notes:** L'approche statique a été adoptée pour maintenir la simplicité, les performances et la prévisibilité du site. Cette implémentation évite toute complexité liée aux cookies, localStorage et redirections automatiques tout en fournissant une expérience utilisateur fluide. Le middleware est minimal et ne fait que détecter la langue depuis l'URL. Les utilitaires i18n gèrent toute la logique de traduction et de navigation multilingue.
-   **Change Log:**
    -   Initial Draft (approche middleware avec cookies et redirections)
    -   **Révision Majeure** - Passage à une approche entièrement statique :
        -   Suppression de toute logique de cookies et localStorage
        -   Suppression des redirections automatiques côté serveur
        -   Middleware simplifié pour détecter la langue depuis l'URL uniquement
        -   Utilitaires i18n complets pour la gestion statique des langues
        -   Configuration i18n centralisée et cohérente
        -   Documentation mise à jour pour refléter l'approche statique

```

```

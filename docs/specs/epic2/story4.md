# Story 2.4: Attribut `lang` Dynamique sur `<html>`

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux voir l'attribut `lang` de la balise `<html>` correctement défini sur chaque page en fonction de la langue du contenu affiché afin d'améliorer l'accessibilité et aider les moteurs de recherche à comprendre la langue de la page.

**Context:** Cette story est une petite mais importante partie de la configuration du bilinguisme (Epic 2). Elle fait suite à la configuration du routage i18n (Story 2.3) et assure que chaque page HTML déclare correctement sa langue.

## Detailed Requirements

Modifier le `BaseLayout.astro` pour qu'il définisse dynamiquement l'attribut `lang` sur la balise `<html>`. La valeur de cet attribut doit correspondre à la locale Astro actuelle de la page (ex: `Astro.currentLocale`).

## Acceptance Criteria (ACs)

- AC1: Le fichier `frontend/src/layouts/BaseLayout.astro` est modifié.
- AC2: La balise `<html>` dans `BaseLayout.astro` a son attribut `lang` défini dynamiquement en utilisant `Astro.currentLocale`.
- AC3: En naviguant sur une page en version française (ex: `/fr/`), l'inspecteur du navigateur montre `<html lang="fr">`.
- AC4: En naviguant sur une page en version anglaise (ex: `/en/`), l'inspecteur du navigateur montre `<html lang="en">`.
- AC5: Si `Astro.currentLocale` est `undefined` (ce qui ne devrait pas arriver avec `prefixDefaultLocale: true`), une langue par défaut (ex: la `defaultLocale` configurée) est utilisée comme fallback pour l'attribut `lang`.

## Technical Implementation Context

**Guidance:** Utiliser l'API `Astro.currentLocale` disponible dans les composants Astro.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/src/layouts/BaseLayout.astro`
  - _(Hint: Se référer à la documentation Astro sur l'internationalisation et `Astro.currentLocale`. Voir `docs/bilinguisme/gestion-contenu.md` Section 6.1.)_

- **Key Technologies:**
  - Astro (API `Astro.currentLocale`)
  - HTML
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Invisible directement pour l'utilisateur, mais crucial pour l'accessibilité (lecteurs d'écran) et le SEO.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Le code dans `BaseLayout.astro` doit rester propre et lisible.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Ouvrir le fichier `frontend/src/layouts/BaseLayout.astro`.
- [ ] Localiser la balise `<html>`.
- [ ] Modifier la balise `<html>` pour inclure l'attribut `lang` dynamiquement. Exemple (en supposant que `defaultLocale` est 'en' dans `astro.config.mjs` et que `i18n` est configuré) :
    ```astro
    ---
    // src/layouts/BaseLayout.astro
    // ... autres imports et props ...
    const currentLang = Astro.currentLocale || import.meta.env.PUBLIC_DEFAULT_LOCALE || 'en'; // PUBLIC_DEFAULT_LOCALE peut être défini dans .env
    ---
    <!DOCTYPE html>
    <html lang={currentLang} data-theme="customLight"> {/* data-theme sera géré par ThemeSwitcher */}
    {/* ... reste du head et body ... */}
    </html>
    ```
    *Note : `Astro.currentLocale` devrait être défini grâce à la configuration i18n. Un fallback est une sécurité.*
- [ ] Tester en naviguant sur les versions `/fr/` et `/en/` du site et en inspectant l'élément `<html>`.
- [ ] S'assurer que la `defaultLocale` configurée dans `astro.config.mjs` est utilisée comme fallback si nécessaire (bien que `prefixDefaultLocale: true` devrait garantir que `Astro.currentLocale` est toujours défini).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Browser Inspection:**
  - Charger une page en version française (ex: `http://localhost:4321/fr/`) et vérifier que l'inspecteur d'éléments affiche `<html lang="fr">`.
  - Charger une page en version anglaise (ex: `http://localhost:4321/en/`) et vérifier que l'inspecteur d'éléments affiche `<html lang="en">`.
- _(Hint: Voir `docs/strategie-tests.md` et `docs/bilinguisme/gestion-contenu.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft